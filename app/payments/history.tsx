import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useOnlinePaymentHistory, useOfflinePaymentHistory } from '@/hooks';
import type { OnlinePayment, OfflinePayment } from '@/types';
import { useState } from 'react';

type Tab = 'online' | 'offline';

function getPaymentIcon(paidBy: string): React.ComponentProps<typeof Ionicons>['name'] {
  const m = paidBy.toUpperCase();
  if (m.includes('NET') || m.includes('IMPS') || m.includes('NEFT')) return 'phone-portrait-outline';
  if (m.includes('CARD')) return 'card-outline';
  return 'cash-outline';
}

export default function PaymentHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('offline');
  const [refreshing, setRefreshing] = useState(false);

  const { data: online, isLoading: onlineLoading, error: onlineError, refetch: refetchOnline } = useOnlinePaymentHistory();
  const { data: offline, isLoading: offlineLoading, error: offlineError, refetch: refetchOffline } = useOfflinePaymentHistory();

  const isLoading = onlineLoading || offlineLoading;
  const hasError = onlineError || offlineError;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOnline(), refetchOffline()]);
    setRefreshing(false);
  };

  const totalOfflinePaid = (offline ?? []).reduce(
    (s, p) => s + (parseFloat(p.Amount || '0') || 0), 0,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentHistory.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{(online?.length ?? 0) + (offline?.length ?? 0)}</Text>
          <Text style={styles.summaryLabel}>{t('paymentHistory.total')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{online?.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>{t('paymentHistory.online')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{offline?.length ?? 0}</Text>
          <Text style={styles.summaryLabel}>{t('paymentHistory.offline')}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {totalOfflinePaid > 0 ? `₹${(totalOfflinePaid / 1000).toFixed(0)}K` : '—'}
          </Text>
          <Text style={styles.summaryLabel}>{t('paymentHistory.totalPaid')}</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offline' && styles.tabActive]}
          onPress={() => setActiveTab('offline')}
          activeOpacity={0.8}
        >
          <Ionicons name="cash-outline" size={14} color={activeTab === 'offline' ? colors.primary.dark : colors.neutral[400]} />
          <Text style={[styles.tabText, activeTab === 'offline' && styles.tabTextActive]}>
            {t('paymentHistory.offline')} ({offline?.length ?? 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'online' && styles.tabActive]}
          onPress={() => setActiveTab('online')}
          activeOpacity={0.8}
        >
          <Ionicons name="phone-portrait-outline" size={14} color={activeTab === 'online' ? colors.primary.dark : colors.neutral[400]} />
          <Text style={[styles.tabText, activeTab === 'online' && styles.tabTextActive]}>
            {t('paymentHistory.online')} ({online?.length ?? 0})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
          <Text style={styles.loadingText}>{t('paymentHistory.loading')}</Text>
        </View>
      ) : hasError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.warning} />
          <Text style={styles.errorText}>{t('paymentHistory.failedToLoad')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh} activeOpacity={0.8}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.gold} colors={[colors.primary.gold]} />
          }
        >
          {activeTab === 'offline' ? (
            !offline || offline.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="receipt-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.emptyTitle}>{t('paymentHistory.noHistory')}</Text>
                <Text style={styles.emptySubtitle}>{t('paymentHistory.noHistorySubtitle')}</Text>
              </View>
            ) : (
              offline.map((p: OfflinePayment) => {
                const amt = parseFloat(p.Amount || '0');
                return (
                  <View key={p.ID} style={styles.card}>
                    {/* Row 1 - icon + loan no + amount */}
                    <View style={styles.cardRow}>
                      <View style={styles.iconWrap}>
                        <Ionicons name={getPaymentIcon(p.PaidBy)} size={20} color={colors.primary.dark} />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.loanNo}>{p.LoanNo}</Text>
                        <Text style={styles.cardDate}>{p.Date}</Text>
                      </View>
                      <Text style={styles.amount}>₹{amt.toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Row 2 - receipt + paid by + view receipt */}
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('paymentHistory.receiptNo')}</Text>
                        <Text style={styles.detailValue}>{p.ReceiptNo || '—'}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('paymentHistory.paidBy')}</Text>
                        <View style={styles.paidByBadge}>
                          <Text style={styles.paidByText}>{p.PaidBy}</Text>
                        </View>
                      </View>
                      {p.PaymentReferenceNo ? (
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t('paymentHistory.refNo')}</Text>
                          <Text style={styles.detailValue}>{p.PaymentReferenceNo}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* View Receipt link */}
                    {p.URL ? (
                      <TouchableOpacity
                        style={styles.receiptBtn}
                        onPress={() => Linking.openURL(p.URL)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="document-text-outline" size={14} color={colors.primary.gold} />
                        <Text style={styles.receiptBtnText}>{t('paymentHistory.viewReceipt')}</Text>
                        <Ionicons name="open-outline" size={13} color={colors.primary.gold} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })
            )
          ) : (
            !online || online.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="phone-portrait-outline" size={48} color={colors.neutral[300]} />
                <Text style={styles.emptyTitle}>{t('paymentHistory.noOnlinePayments')}</Text>
                <Text style={styles.emptySubtitle}>{t('paymentHistory.noOnlinePaymentsSubtitle')}</Text>
              </View>
            ) : (
              online.map((p: OnlinePayment) => {
                const isSuccess = p.Status?.toLowerCase() === 'success';
                const amt = parseFloat(p.Amount || '0');
                const txn = p.parsedResponseCode;
                const mode = (p.Mode ?? txn?.payment_method_type ?? '').toUpperCase();
                const refId = p.TransactionRefID ?? txn?.transactionid ?? txn?.bank_ref_no ?? null;
                const bankRef = txn?.bank_ref_no ?? null;
                return (
                  <View key={p.ID} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={[styles.iconWrap, isSuccess ? styles.iconSuccess : styles.iconFail]}>
                        <Ionicons
                          name={isSuccess ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={isSuccess ? '#2E7D32' : colors.error}
                        />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.loanNo}>{p.LoanNo}</Text>
                        <Text style={styles.cardDate}>{p.Date}{mode ? ` • ${mode}` : ''}</Text>
                      </View>
                      <View style={styles.amountCol}>
                        <Text style={styles.amount}>₹{amt.toLocaleString('en-IN')}</Text>
                        <View style={[styles.statusBadge, isSuccess ? styles.statusSuccess : styles.statusFail]}>
                          <Text style={[styles.statusText, isSuccess ? styles.statusTextSuccess : styles.statusTextFail]}>
                            {isSuccess ? t('paymentHistory.statusSuccess') : t('paymentHistory.statusFailed')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {(refId || bankRef) ? (
                      <View style={styles.divider} />
                      ) : null}
                    {refId ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>{t('paymentHistory.txnId')}</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{refId}</Text>
                        </View>
                        {bankRef && bankRef !== refId ? (
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>{t('paymentHistory.bankRef')}</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{bankRef}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )
          )}
          <View style={{ height: spacing[6] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2],
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EDE8D8',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.neutral[900] },

  summaryStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing[5], marginVertical: spacing[3],
    backgroundColor: colors.primary.gold, borderRadius: 18, padding: spacing[4],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: colors.white },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  summaryDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },

  tabRow: {
    flexDirection: 'row', marginHorizontal: spacing[5],
    backgroundColor: colors.neutral[100], borderRadius: 14,
    padding: 4, marginBottom: spacing[4],
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: spacing[2], borderRadius: 11 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.neutral[400] },
  tabTextActive: { color: colors.primary.dark },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[3] },
  loadingText: { fontSize: 14, color: colors.neutral[500] },
  errorText: { fontSize: 15, fontWeight: '600', color: colors.neutral[700] },
  retryBtn: { backgroundColor: colors.primary.gold, paddingHorizontal: spacing[6], paddingVertical: spacing[2], borderRadius: 10 },
  retryText: { color: colors.white, fontWeight: '700' },

  list: { paddingHorizontal: spacing[5] },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[3] },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[700] },
  emptySubtitle: { fontSize: 13, color: colors.neutral[400], textAlign: 'center', paddingHorizontal: spacing[6] },

  card: {
    backgroundColor: colors.white, borderRadius: 20,
    padding: spacing[4], marginBottom: spacing[4],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center',
  },
  iconSuccess: { backgroundColor: '#E8F5E9' },
  iconFail: { backgroundColor: '#FFEBEE' },
  cardInfo: { flex: 1 },
  loanNo: { fontSize: 14, fontWeight: '800', color: colors.neutral[900] },
  cardDate: { fontSize: 12, color: colors.neutral[400], marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.neutral[900] },
  amountCol: { alignItems: 'flex-end', gap: 4 },

  divider: { height: 1, backgroundColor: '#F0EBD8', marginVertical: spacing[3] },

  detailRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: colors.neutral[400], marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: '600', color: colors.neutral[700] },
  paidByBadge: {
    backgroundColor: '#FFF8E7', borderRadius: 6,
    paddingHorizontal: spacing[2], paddingVertical: 2, alignSelf: 'flex-start',
  },
  paidByText: { fontSize: 11, fontWeight: '700', color: colors.primary.dark },

  receiptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing[2], borderRadius: 10,
    borderWidth: 1, borderColor: '#EDE8D8', backgroundColor: '#FDFBF5',
  },
  receiptBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary.gold },

  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: 5 },
  statusSuccess: { backgroundColor: '#E8F5E9' },
  statusFail: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextSuccess: { color: '#2E7D32' },
  statusTextFail: { color: colors.error },
});
