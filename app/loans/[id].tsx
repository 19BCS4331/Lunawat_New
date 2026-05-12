import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useOutstandingLoans, useMyLoans, useOfflinePaymentHistory } from '@/hooks';
import type { Loan, OfflinePayment } from '@/types';

function parseSafe(val: string | number | undefined): number {
  if (!val || val === '-') return 0;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

interface RowProps { label: string; value: string; highlight?: boolean; }
function Row({ label, value, highlight }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}  </Text>
    </View>
  );
}

export default function LoanDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: outstandingLoans, isLoading: outstandingLoading } = useOutstandingLoans();
  const { data: allLoans, isLoading: allLoansLoading, error } = useMyLoans();
  const { data: offlinePayments } = useOfflinePaymentHistory();
  const isLoading = outstandingLoading || allLoansLoading;
  // Outstanding has full payment fields — prefer it; fall back to allLoans for closed loans
  const loan = outstandingLoans?.find((l: Loan) => l.ID === id) ?? allLoans?.find((l: Loan) => l.ID === id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !loan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
          <Text style={styles.errorTitle}>Loan Not Found  </Text>
          <TouchableOpacity style={styles.backBtnAlt} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnAltText}>Go Back  </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOpen = loan.LoanStatus === 'Open';
  const loanAmt = parseSafe(loan.LoanAmount);
  const pending = parseSafe(loan.PendingLoanAmount);
  const interest = parseSafe(loan.IntAmount);
  const totalDue = parseSafe(loan.TotalDueAmount);
  const notice = parseSafe(loan.NoticeAmount);
  const otherCharges = parseSafe(loan.OtherCharges);
  const goldAmt = parseSafe(loan.GoldAmount);
  const eligible = parseSafe(loan.LoanEligibleAmount);
  const loanReceipts = (offlinePayments ?? []).filter(
    (p: OfflinePayment) => p.LoanNo === loan.LoanNo,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Details  </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecor} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLoanNo}>{loan.LoanNo}  </Text>
              {loan.BranchName ? <Text style={styles.heroBranch}>{loan.BranchName}  </Text> : null}
            </View>
            <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
              <Text style={[styles.badgeText, isOpen ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                {loan.LoanStatus + '  '}
              </Text>
            </View>
          </View>

          {isOpen ? (
            <>
              <Text style={styles.heroAmtLabel}>Outstanding Balance</Text>
              <Text style={styles.heroAmt}>
                {pending > 0 ? `₹${pending.toLocaleString('en-IN')}` + ' ' : '—'}  
              </Text>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>₹{loanAmt.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.heroStatLabel}>Loan Amount</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>₹{interest.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.heroStatLabel}>Interest</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{loan.IntDuedays ?? '0'}  </Text>
                  <Text style={styles.heroStatLabel}>Due Days</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heroAmtLabel}>Net Paid</Text>
              <Text style={[styles.heroAmt, { color: colors.success }]}>
                ₹{loan.NetPaid ? parseFloat(loan.NetPaid).toLocaleString('en-IN') : loanAmt.toLocaleString('en-IN')}
              </Text>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>₹{loanAmt.toLocaleString('en-IN')}  </Text>
                  <Text style={styles.heroStatLabel}>Loan Amount</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{loan.PaidBy ?? '—'}  </Text>
                  <Text style={styles.heroStatLabel}>Paid By</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{loan.Scheme ?? '—'}  </Text>
                  <Text style={styles.heroStatLabel}>Scheme</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Make Payment CTA */}
        {isOpen && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => router.push(`/payments/make-payment?loanId=${loan.ID}`)}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={18} color={colors.white} />
            <Text style={styles.payBtnText}>Make Payment  </Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}

        {/* Gold Details */}
        <Text style={styles.sectionTitle}>Gold Details  </Text>
        <View style={styles.card}>
          <View style={styles.goldBanner}>
            <Ionicons name="diamond-outline" size={18} color={colors.primary.gold} />
            <Text style={styles.goldBannerText}>
              {loan.GrossWeight ?? '—'} gross weight • {loan.NetWeight ?? '—'} net weight  
            </Text>
          </View>
          <View style={styles.divider} />
          <Row label="Gold Rate" value={`₹${loan.GoldRate ?? '—'}/g` + ' '} />
          <View style={styles.rowDivider} />
          <Row label="Gold Value " value={`₹ ${goldAmt.toLocaleString('en-IN') + ' '}`} />
          <View style={styles.rowDivider} />
          <Row label="Eligible Amount" value={`₹${eligible.toLocaleString('en-IN') + ' '}`} />
          <View style={styles.rowDivider} />
          <Row label="Scheme" value={loan.Scheme ?? '—'} />
        </View>

        {/* Loan Info */}
        <Text style={styles.sectionTitle}>Loan Information  </Text>
        <View style={styles.card}>
          <Row label="Branch" value={loan.BranchName ?? '—'} />
          <View style={styles.rowDivider} />
          <Row label="Loan Date" value={loan.LoanDate ?? '—'} />
          <View style={styles.rowDivider} />
          <Row label="Pay Frequency" value={loan.PayFrequency ? `${loan.PayFrequency} days` : '—'} />
          <View style={styles.rowDivider} />
          <Row label="Min Interest Days" value={String(loan.MinIntdays ?? '—')} />
          {loan.Wallet && loan.Wallet !== '0' ? (
            <>
              <View style={styles.rowDivider} />
              <Row label="Wallet Balance" value={`₹${loan.Wallet}`} />
            </>
          ) : null}
        </View>

        {/* Payment Breakdown — only meaningful for open loans */}
        {isOpen && (
          <>
            <Text style={styles.sectionTitle}>Payment Breakdown  </Text>
            <View style={styles.card}>
              <Row label="Principal Pending" value={pending > 0 ? `₹${pending.toLocaleString('en-IN')}` : '—'} />
              <View style={styles.rowDivider} />
              <Row label="Interest Amount" value={interest > 0 ? `₹${interest.toLocaleString('en-IN')}` : '—'} />
              <View style={styles.rowDivider} />
              <Row label="Interest Due Days" value={String(loan.IntDuedays ?? 0)} />
              {notice > 0 ? (
                <>
                  <View style={styles.rowDivider} />
                  <Row label="Notice Amount" value={`₹${notice.toLocaleString('en-IN')}`} />
                </>
              ) : null}
              {otherCharges > 0 ? (
                <>
                  <View style={styles.rowDivider} />
                  <Row label="Other Charges" value={`₹${otherCharges.toLocaleString('en-IN')}`} />
                </>
              ) : null}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Due  </Text>
                <Text style={styles.totalValue}>
                  {totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN') + '   '}` : `₹${(pending + interest + notice + otherCharges).toLocaleString('en-IN') + ' '}`}  
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Payment Receipts */}
        {loanReceipts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Payment Receipts  </Text>
            <View style={styles.card}>
              {loanReceipts.map((p: OfflinePayment, idx: number) => (
                <View key={p.ID}>
                  {idx > 0 && <View style={styles.rowDivider} />}
                  <View style={styles.receiptItem}>
                    <View style={styles.receiptLeft}>
                      <View style={styles.receiptIconWrap}>
                        <Ionicons name="receipt-outline" size={16} color={colors.primary.gold} />
                      </View>
                      <View>
                        <Text style={styles.receiptNo}>{p.ReceiptNo}  </Text>
                        <Text style={styles.receiptMeta}>{p.Date} · {p.PaidBy}</Text>
                      </View>
                    </View>
                    <View style={styles.receiptRight}>
                      <Text style={styles.receiptAmt}>₹{parseFloat(p.Amount || '0').toLocaleString('en-IN')}  </Text>
                      {p.URL ? (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(p.URL)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="open-outline" size={16} color={colors.primary.gold} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: spacing[6] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[3] },
  errorTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral[700] },
  backBtnAlt: { backgroundColor: colors.primary.gold, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: 12 },
  backBtnAltText: { color: colors.white, fontWeight: '700' },

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

  scroll: { paddingHorizontal: spacing[5], paddingTop: spacing[2] },

  heroCard: {
    backgroundColor: colors.primary.gold,
    borderRadius: 24, padding: spacing[5],
    marginBottom: spacing[4], overflow: 'hidden',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  heroDecor: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60, right: -40,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[4] },
  heroLoanNo: { fontSize: 20, fontWeight: '800', color: colors.white },
  heroBranch: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  badge: { paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: 8 },
  badgeOpen: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeClosed: { backgroundColor: 'rgba(0,0,0,0.15)' },
  badgeText: { fontSize: 12, fontWeight: '800' },
  badgeTextOpen: { color: colors.white },
  badgeTextClosed: { color: 'rgba(255,255,255,0.85)' },
  heroAmtLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  heroAmt: { fontSize: 34, fontWeight: '800', color: colors.white, marginBottom: spacing[4] },
  heroStatsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 14, padding: spacing[3] },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 14, fontWeight: '800', color: colors.white },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[5], backgroundColor: colors.primary.dark,
    borderRadius: 16, paddingVertical: spacing[4],
    marginBottom: spacing[5],
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  payBtnText: { fontSize: 15, fontWeight: '800', color: colors.white },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.neutral[400], letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing[2], marginTop: spacing[1] },

  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: '#EDE8D8',
    marginBottom: spacing[5],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
    overflow: 'hidden',
  },
  goldBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: '#FFF8E7', paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  goldBannerText: { fontSize: 13, fontWeight: '600', color: colors.primary.dark },
  divider: { height: 1, backgroundColor: '#F0EBD8' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  rowLabel: { fontSize: 13, color: colors.neutral[500] },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.neutral[800], maxWidth: '55%', textAlign: 'right' },
  rowValueHighlight: { color: colors.primary.gold },
  rowDivider: { height: 1, backgroundColor: '#F5F1E8', marginHorizontal: spacing[4] },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary.gold },

  receiptItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  receiptLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  receiptIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#FFF8E7', justifyContent: 'center', alignItems: 'center',
  },
  receiptNo: { fontSize: 13, fontWeight: '700', color: colors.neutral[800] },
  receiptMeta: { fontSize: 11, color: colors.neutral[400], marginTop: 2 },
  receiptRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  receiptAmt: { fontSize: 14, fontWeight: '800', color: colors.neutral[900] },
});
