import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { AppStateStatus } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useOutstandingLoans, useGeneratePaymentToken } from '@/hooks';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import {
  paymentCalculator,
  BillDeskPaymentHandler,
  type BillDeskPaymentConfig,
  type BillDeskPaymentState,
  type PaymentCalculationResult,
} from '@/utils';
import type { Loan } from '@/types';

function parseSafe(val: string | undefined): number {
  const n = parseFloat(val || '0');
  return isNaN(n) ? 0 : n;
}

export default function MakePaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loanId } = useLocalSearchParams<{ loanId?: string }>();
  const { data: loans, isLoading: loansLoading } = useOutstandingLoans();
  const generatePaymentToken = useGeneratePaymentToken();
  const { alert, alertState } = useCustomAlert();

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<BillDeskPaymentConfig | null>(null);
  const [calculation, setCalculation] = useState<PaymentCalculationResult | null>(null);
  const [, setPaymentState] = useState<BillDeskPaymentState>({ status: 'pending' });

  const webViewRef = useRef<WebView>(null);
  const billDeskHandler = useRef<BillDeskPaymentHandler | null>(null);
  // Pre-select loan from param
  useEffect(() => {
    if (loanId && loans) {
      const loan = loans.find((l: Loan) => l.ID === loanId);
      if (loan) setSelectedLoan(loan);
    }
  }, [loanId, loans]);

  // Live instruction as user types (permissive — mirrors old app's useEffect)
  const [liveInstruction, setLiveInstruction] = useState<{ instruction: string; isPayable: boolean; minIntdaysWarning?: string } | null>(null);

  useEffect(() => {
    if (!selectedLoan || !paymentAmount) { setLiveInstruction(null); setCalculation(null); return; }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) { setLiveInstruction(null); setCalculation(null); return; }
    setLiveInstruction(paymentCalculator.getInstruction({ loan: selectedLoan, paymentAmount: amount }));
    // Clear previous strict calculation when amount changes
    setCalculation(null);
  }, [selectedLoan, paymentAmount]);

  // Resume pending transaction on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next: AppStateStatus) => {
      if (next === 'active') {
        const pending = await BillDeskPaymentHandler.checkPendingTransaction();
        if (pending && !showWebView) {
          alert(t('makePayment.alertPendingTitle'), t('makePayment.alertPendingBody'), [
            { text: t('makePayment.alertNo'), style: 'cancel' },
            { text: t('makePayment.alertResume'), onPress: () => { setPaymentConfig(pending); setShowWebView(true); } },
          ]);
        }
      }
    });
    return () => sub.remove();
  }, [showWebView]);

  // Android back during WebView
  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showWebView) {
        confirmCancelPayment();
        return true;
      }
      return false;
    });
    return () => bh.remove();
  }, [showWebView]);

  const confirmCancelPayment = () => {
    alert(t('makePayment.alertCancelTitle'), t('makePayment.alertCancelBody'), [
      { text: t('makePayment.alertNo'), style: 'cancel' },
      { text: t('makePayment.alertYes'), style: 'destructive', onPress: () => {
        billDeskHandler.current?.cancelPayment();
        setShowWebView(false);
      }},
    ]);
  };

  const handleProceedToPayment = async () => {
    if (!selectedLoan || !liveInstruction?.isPayable || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    // Run strict band validation (SendToPG equivalent)
    const strictCalc = paymentCalculator.calculate({ loan: selectedLoan, paymentAmount: amount });
    setCalculation(strictCalc);
    if (!strictCalc.canPay) {
      alert(t('makePayment.alertErrorTitle'), strictCalc.error ?? t('makePayment.alertErrorBody'));
      return;
    }

    const existing = await BillDeskPaymentHandler.checkPendingTransaction();
    if (existing) {
      alert(t('makePayment.alertPendingExistsTitle'), t('makePayment.alertPendingExistsBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('makePayment.alertResume'), onPress: () => { setPaymentConfig(existing); setShowWebView(true); } },
      ]);
      return;
    }

    try {
      const tokenResponse = await generatePaymentToken.mutateAsync({
        loanId: selectedLoan.ID,
        loanNo: selectedLoan.LoanNo,
        amount: strictCalc.roundedTotal.toString(),
      });

      const config: BillDeskPaymentConfig = {
        merchantId: tokenResponse.merchantId,
        bdorderid: tokenResponse.bdorderid,
        token: tokenResponse.token,
        amount: strictCalc.roundedTotal.toString(),
        loanId: selectedLoan.ID,
        loanNo: selectedLoan.LoanNo,
      };

      billDeskHandler.current = new BillDeskPaymentHandler((state) => {
        setPaymentState(state);
        if (state.status === 'success' || state.status === 'failed' || state.status === 'cancelled') {
          setShowWebView(false);
          if (state.status === 'success') {
            alert(t('makePayment.alertSuccessTitle'), t('makePayment.alertSuccessBody'), [
              { text: t('makePayment.alertOk'), onPress: () => router.back() },
            ]);
          } else if (state.status === 'failed') {
            alert(t('makePayment.alertFailedTitle'), state.errorMessage || t('makePayment.alertFailedBody'));
          }
        }
      });

      await billDeskHandler.current.startPayment(config);
      setPaymentConfig(config);
      setShowWebView(true);
      setPaymentState({ status: 'pending' });
      setCalculation(strictCalc);
    } catch {
      alert(t('makePayment.alertTokenErrorTitle'), t('makePayment.alertTokenErrorBody'));
    }
  };

  // ─── WebView screen ───────────────────────────────────────────────
  if (showWebView && paymentConfig) {
    const html = BillDeskPaymentHandler.generatePaymentHtml(paymentConfig);
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.webHeader}>
          <TouchableOpacity onPress={confirmCancelPayment} style={styles.webCancelBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.webHeaderTitle}>{t('makePayment.securePayment')}  </Text>
          <View style={styles.webHeaderLock}>
            <Ionicons name="lock-closed" size={14} color={colors.primary.gold} />
          </View>
        </View>
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: 'https://pay.billdesk.com' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          mixedContentMode="always"
          allowsInlineMediaPlayback
          allowUniversalAccessFromFileURLs
          onNavigationStateChange={(ns) => billDeskHandler.current?.handleNavigationStateChange(ns)}
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data) as { type: string; msg?: string };
              if (__DEV__) {
                if (data.type === 'error') {
                  console.error('[BillDesk WebView]', data.msg);
                } else if (data.type === 'sdk_timeout') {
                  console.error('[BillDesk WebView] SDK timed out — SDK script may not have loaded');
                } else {
                  console.log('[BillDesk WebView]', data.msg);
                }
              }
            } catch {}
            billDeskHandler.current?.handleWebViewMessage(e);
          }}
          onError={(e) => {
            if (__DEV__) console.error('[BillDesk WebView] onError:', e.nativeEvent.description);
          }}
          onHttpError={(e) => {
            if (__DEV__) console.error('[BillDesk WebView] HTTP error:', e.nativeEvent.statusCode, e.nativeEvent.url);
          }}
          onLoad={() => {
            if (__DEV__) console.log('[BillDesk WebView] page loaded');
            if (billDeskHandler.current && webViewRef.current) {
              billDeskHandler.current.setWebViewRef(webViewRef.current);
            }
          }}
          renderLoading={() => (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary.gold} />
              <Text style={styles.loadingText}>{t('makePayment.loadingGateway')}</Text>
            </View>
          )}
        />

        {alertState && <CustomAlert {...alertState} />}
      </SafeAreaView>
    );
  }

  // ─── Form screen ──────────────────────────────────────────────────
  if (loansLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const openLoans = (loans ?? []).filter((l: Loan) => l.LoanStatus === 'Open');
  const totalDue   = parseSafe(selectedLoan?.TotalDueAmount);
  const intAmt     = parseSafe(selectedLoan?.IntAmount);
  const pending    = parseSafe(selectedLoan?.PendingLoanAmount);
  const intDueDays = parseSafe(selectedLoan?.IntDuedays);
  const suggests   = selectedLoan ? paymentCalculator.suggestAmounts(selectedLoan) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('makePayment.title')}  </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Loan selector — only shown if no loanId pre-selected */}
        {!loanId && (
          <>
            <Text style={styles.sectionTitle}>{t('makePayment.selectLoan')}  </Text>
            {openLoans.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={32} color={colors.neutral[300]} />
                <Text style={styles.emptyText}>{t('makePayment.noOpenLoans')}</Text>
              </View>
            ) : (
              openLoans.map((loan: Loan) => {
                const selected = selectedLoan?.ID === loan.ID;
                return (
                  <TouchableOpacity
                    key={loan.ID}
                    style={[styles.loanCard, selected && styles.loanCardSelected]}
                    onPress={() => { setSelectedLoan(loan); setPaymentAmount(''); }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.loanCardLeft}>
                      <Text style={styles.loanNo}>{loan.LoanNo}  </Text>
                      {loan.BranchName ? <Text style={styles.loanBranch}>{loan.BranchName}</Text> : null}
                    </View>
                    <View style={styles.loanCardRight}>
                      <Text style={styles.loanDue}>₹{parseSafe(loan.TotalDueAmount).toLocaleString('en-IN')}  </Text>
                      <Text style={styles.loanDueLabel}>{t('makePayment.totalDue')}</Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary.gold} style={{ marginLeft: spacing[2] }} />}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {/* Selected loan summary */}
        {selectedLoan && (
          <>
            <Text style={styles.sectionTitle}>{t('makePayment.loanSummary')}  </Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('makePayment.loanNo')}  </Text>
                <Text style={styles.summaryValue}>{selectedLoan.LoanNo}  </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStatsRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatVal}>₹{pending.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.summaryStatLabel}>{t('makePayment.principal')}</Text>
                </View>
                <View style={styles.summaryStatDivider} />
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatVal}>₹{intAmt.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.summaryStatLabel}>{t('makePayment.interest')}</Text>
                </View>
                <View style={styles.summaryStatDivider} />
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatVal}>{intDueDays}  </Text>
                  <Text style={styles.summaryStatLabel}>{t('makePayment.dueDays')}</Text>
                </View>
                <View style={styles.summaryStatDivider} />
                <View style={styles.summaryStat}>
                  <Text style={[styles.summaryStatVal, { color: colors.error }]}>₹{totalDue.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.summaryStatLabel}>{t('makePayment.totalDue')}</Text>
                </View>
              </View>
              <Text style={styles.summaryHint}>
                {t('makePayment.hint', { max: ((totalDue > 0 ? totalDue : pending) - 90).toLocaleString('en-IN') })}
              </Text>
            </View>
          </>
        )}

        {/* Amount input */}
        {selectedLoan && (
          <>
            <Text style={styles.sectionTitle}>{t('makePayment.paymentAmount')}  </Text>
            <View style={styles.amountCard}>
              <View style={styles.amountInputRow}>
                <Text style={styles.rupeeSymbol}>₹  </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={t('makePayment.placeholder')}
                  placeholderTextColor={colors.neutral[300]}
                  keyboardType="numeric"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  accessibilityLabel="Payment amount"
                />
              </View>

              {/* Quick suggest chips */}
              {suggests && (
                <View style={styles.chipsRow}>
                  {suggests.lower > 0 && (
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setPaymentAmount(suggests.lower.toString())}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.chipText}>₹{suggests.lower.toLocaleString('en-IN')}  </Text>
                    </TouchableOpacity>
                  )}
                  {suggests.upper > 0 && suggests.upper !== suggests.lower && (
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => setPaymentAmount(suggests.upper.toString())}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.chipText}>₹{suggests.upper.toLocaleString('en-IN')}  </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Live instruction (permissive — shown as user types) */}
              {liveInstruction && (
                <>
                  {liveInstruction.minIntdaysWarning && (
                    <View style={[styles.instructionBox, styles.instructionWarn]}>
                      <Ionicons name="warning" size={16} color="#E65100" />
                      <Text style={[styles.instructionText, styles.instructionTextWarn]}>
                        {liveInstruction.minIntdaysWarning}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.instructionBox, liveInstruction.isPayable ? styles.instructionOk : styles.instructionErr]}>
                    <Ionicons
                      name={liveInstruction.isPayable ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={liveInstruction.isPayable ? '#2E7D32' : '#B71C1C'}
                    />
                    <Text style={[styles.instructionText, liveInstruction.isPayable ? styles.instructionTextOk : styles.instructionTextErr]}>
                      {liveInstruction.instruction}
                    </Text>
                  </View>
                  {/* Strict band error shown after Pay pressed */}
                  {calculation && !calculation.canPay && (
                    <View style={[styles.instructionBox, styles.instructionErr]}>
                      <Ionicons name="alert-circle" size={16} color="#B71C1C" />
                      <Text style={[styles.instructionText, styles.instructionTextErr]}>{calculation.error}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Breakdown — only shown after strict validation passes */}
        {calculation?.canPay && (
          <>
            <Text style={styles.sectionTitle}>{t('makePayment.breakdown')}  </Text>
            <View style={styles.breakdownCard}>
              {calculation.payingIntDays > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('makePayment.interestDays', { days: calculation.payingIntDays })}</Text>
                  <Text style={styles.breakdownValue}>
                    ₹{(calculation.payingIntDays * calculation.interestPerDay).toLocaleString('en-IN', { maximumFractionDigits: 2 })}  
                  </Text>
                </View>
              )}
              {calculation.principalAdjustment > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('makePayment.principalAdjustment')}</Text>
                  <Text style={styles.breakdownValue}>₹{calculation.principalAdjustment.toLocaleString('en-IN')}  </Text>
                </View>
              )}
              {calculation.totalCharges > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('makePayment.charges')}</Text>
                  <Text style={styles.breakdownValue}>₹{calculation.totalCharges.toLocaleString('en-IN')}  </Text>
                </View>
              )}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotalLabel}>{t('makePayment.totalPayable')}  </Text>
                <Text style={styles.breakdownTotalValue}>₹{calculation.roundedTotal.toLocaleString('en-IN')}  </Text>
              </View>
            </View>
          </>
        )}

        {/* CTA — enabled when live instruction says payable */}
        {selectedLoan && (
          <TouchableOpacity
            style={[styles.payBtn, (!liveInstruction?.isPayable || generatePaymentToken.isPending) && styles.payBtnDisabled]}
            disabled={!liveInstruction?.isPayable || generatePaymentToken.isPending}
            onPress={handleProceedToPayment}
            activeOpacity={0.85}
          >
            {generatePaymentToken.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={16} color={colors.white} />
                <Text style={styles.payBtnText}>{t('makePayment.paySecurely', { amount: paymentAmount || '—' })}  </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  keyboardView: { flex: 1 },
  scroll: { paddingHorizontal: spacing[5] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[3] },
  loadingText: { fontSize: 14, color: colors.neutral[500], marginTop: spacing[2] },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[4] },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F1E8', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral[900] },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.neutral[400], letterSpacing: 0.8, textTransform: 'uppercase', marginTop: spacing[5], marginBottom: spacing[2] },

  emptyCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing[6], alignItems: 'center', gap: spacing[2], borderWidth: 1, borderColor: '#EDE8D8' },
  emptyText: { fontSize: 14, color: colors.neutral[400] },

  loanCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: spacing[4],
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3],
    borderWidth: 1.5, borderColor: '#EDE8D8',
  },
  loanCardSelected: { borderColor: colors.primary.gold, backgroundColor: '#FFFBEF' },
  loanCardLeft: { flex: 1 },
  loanNo: { fontSize: 14, fontWeight: '700', color: colors.neutral[900] },
  loanBranch: { fontSize: 12, color: colors.neutral[400], marginTop: 2 },
  loanCardRight: { alignItems: 'flex-end' },
  loanDue: { fontSize: 15, fontWeight: '800', color: colors.primary.gold },
  loanDueLabel: { fontSize: 11, color: colors.neutral[400], marginTop: 2 },

  summaryCard: {
    backgroundColor: colors.primary.gold, borderRadius: 20, padding: spacing[4],
    shadowColor: colors.primary.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  summaryValue: { fontSize: 13, fontWeight: '800', color: colors.white },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: spacing[3] },
  summaryStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryStatVal: { fontSize: 13, fontWeight: '800', color: colors.white },
  summaryStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  summaryStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  summaryHint: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: spacing[3] },

  amountCard: { backgroundColor: colors.white, borderRadius: 20, padding: spacing[5], borderWidth: 1, borderColor: '#EDE8D8' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.primary.gold, paddingBottom: spacing[2], marginBottom: spacing[4] },
  rupeeSymbol: { fontSize: 28, fontWeight: '800', color: colors.neutral[700], marginRight: spacing[2] },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '800', color: colors.neutral[900] },
  chipsRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap', marginBottom: spacing[3] },
  chip: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: 20, backgroundColor: '#FFF8E7', borderWidth: 1, borderColor: colors.primary.gold },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.primary.dark },
  instructionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], padding: spacing[3], borderRadius: 12, marginTop: spacing[1] },
  instructionOk: { backgroundColor: '#E8F5E9' },
  instructionErr: { backgroundColor: '#FFEBEE' },
  instructionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  instructionTextOk: { color: '#1B5E20' },
  instructionTextErr: { color: '#B71C1C' },
  instructionWarn: { backgroundColor: '#FFF3E0' },
  instructionTextWarn: { color: '#E65100' },

  breakdownCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing[4], borderWidth: 1, borderColor: '#EDE8D8' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] },
  breakdownLabel: { fontSize: 13, color: colors.neutral[500] },
  breakdownValue: { fontSize: 13, fontWeight: '700', color: colors.neutral[800] },
  breakdownDivider: { height: 1, backgroundColor: '#F5F0E8', marginVertical: spacing[2] },
  breakdownTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
  breakdownTotalValue: { fontSize: 18, fontWeight: '800', color: colors.primary.gold },

  payBtn: {
    marginTop: spacing[5], backgroundColor: colors.primary.dark, borderRadius: 18,
    paddingVertical: spacing[4], flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2],
    shadowColor: colors.primary.dark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  payBtnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  payBtnText: { fontSize: 16, fontWeight: '800', color: colors.white },

  webHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: '#EDE8D8', backgroundColor: '#FDFBF5',
  },
  webCancelBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F1E8', justifyContent: 'center', alignItems: 'center' },
  webHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
  webHeaderLock: { width: 36, alignItems: 'flex-end' },
});
