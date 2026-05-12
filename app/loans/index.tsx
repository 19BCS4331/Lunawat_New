import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useMyLoans } from '@/hooks';
import type { Loan } from '@/types';
import { useState } from 'react';

type Tab = 'open' | 'closed';

function parseSafe(val: string | number | undefined): number {
  if (!val || val === '-') return 0;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

export default function LoansIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('open');
  const [refreshing, setRefreshing] = useState(false);
  const { data: loans, isLoading, error, refetch } = useMyLoans();

  const openLoans = loans?.filter((l: Loan) => l.LoanStatus === 'Open') ?? [];
  const closedLoans = loans?.filter((l: Loan) => l.LoanStatus === 'Closed') ?? [];
  const displayed = activeTab === 'open' ? openLoans : closedLoans;

  const totalGoldWeight = openLoans.reduce((s: number, l: Loan) => {
    const w = parseFloat(String(l.GrossWeight ?? '0').replace(/[^0-9.]/g, ''));
    return s + (isNaN(w) ? 0 : w);
  }, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('loansIndex.title')}  </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{loans?.length ?? 0}  </Text>
          <Text style={styles.summaryLabel}>{t('loansIndex.total') + ' '}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>{openLoans.length}</Text>
          <Text style={styles.summaryLabel}>{t('loansIndex.active') + ' '}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{closedLoans.length}  </Text>
          <Text style={styles.summaryLabel}>{t('loansIndex.closed') + ' '}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {totalGoldWeight > 0 ? `${totalGoldWeight.toFixed(2)}g` + '  ' : '—'}  
          </Text>
          <Text style={styles.summaryLabel}>{t('loansIndex.goldActive') + ' '}</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'open' && styles.tabActive]}
          onPress={() => setActiveTab('open')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trending-up"
            size={14}
            color={activeTab === 'open' ? colors.primary.dark : colors.neutral[400]}
          />
          <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>
            {t('loansIndex.active') + ' '} ({openLoans.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'closed' && styles.tabActive]}
          onPress={() => setActiveTab('closed')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={activeTab === 'closed' ? colors.primary.dark : colors.neutral[400]}
          />
          <Text style={[styles.tabText, activeTab === 'closed' && styles.tabTextActive]}>
            {t('loansIndex.closed') + ' '} ({closedLoans.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
          <Text style={styles.loadingText}>{t('loansIndex.loading') + ' '}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.warning} />
          <Text style={styles.errorText}>{t('loansIndex.failedToLoad') + ' '}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
            <Text style={styles.retryText}>{t('common.retry') + ' '}  </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.gold}
              colors={[colors.primary.gold]}
            />
          }
        >
          {displayed.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-open-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'open' ? t('loansIndex.noActiveLoans') + ' ' : t('loansIndex.noClosedLoans') + ' '}  
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'open'
                  ? t('loansIndex.noActiveSubtitle') + ' '
                  : t('loansIndex.noClosedSubtitle') + ' '}
              </Text>
            </View>
          ) : (
            displayed.map((loan: Loan) => {
              const isOpen = loan.LoanStatus === 'Open';
              const loanAmt = parseSafe(loan.LoanAmount);
              const pending = parseSafe(loan.PendingLoanAmount);
              const interest = parseSafe(loan.IntAmount);
              const goldAmt = parseSafe(loan.GoldAmount);
              const eligible = parseSafe(loan.LoanEligibleAmount);

              return (
                <TouchableOpacity
                  key={loan.ID}
                  style={styles.card}
                  onPress={() => router.push(`/loans/${loan.ID}`)}
                  activeOpacity={0.82}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.loanNo}>{loan.LoanNo}  </Text>
                      <Text style={styles.branch}>{loan.BranchName ?? ''}</Text>
                    </View>
                    <View style={styles.cardHeaderRight}>
                      <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                        <Text style={[styles.badgeText, isOpen ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                          {isOpen ? t('loansIndex.statusOpen') + ' ' : t('loansIndex.statusClosed') + ' '}  
                        </Text>
                      </View>
                      <Text style={styles.scheme}>{loan.Scheme ?? ''}  </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Amount Row */}
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>{t('loansIndex.loanAmount')}</Text>
                      <Text style={styles.statValue}>₹{loanAmt.toLocaleString('en-IN')}  </Text>
                    </View>
                    {isOpen ? (
                      <>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loansIndex.pending')}</Text>
                          <Text style={[styles.statValue, { color: colors.warning }]}>
                            {pending > 0 ? `₹${pending.toLocaleString('en-IN')}` : '—'}
                          </Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loansIndex.interest')}</Text>
                          <Text style={styles.statValue}>
                            {interest > 0 ? `₹${interest.toLocaleString('en-IN')}` : '—'}  
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loansIndex.netPaid')}</Text>
                          <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                            {loan.NetPaid ? `₹${loan.NetPaid}` : `₹${loanAmt.toLocaleString('en-IN')}`}
                          </Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loansIndex.paidBy')}</Text>
                          <Text style={styles.statValue}>{loan.PaidBy ?? '—'}  </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Gold Row */}
                  <View style={styles.goldRow}>
                    <View style={styles.goldItem}>
                      <Ionicons name="diamond-outline" size={13} color={colors.primary.gold} />
                      <Text style={styles.goldText}>
                        {loan.GrossWeight ?? '—'} {t('loansIndex.gross')} • {loan.NetWeight ?? '—'} {t('loansIndex.net')}
                      </Text>
                    </View>
                    <Text style={styles.goldRate}>₹{loan.GoldRate ?? '—'}/g  </Text>
                  </View>

                  {/* Gold Value Row */}
                  <View style={styles.valueRow}>
                    <View style={styles.valueItem}>
                      <Text style={styles.valueLabel}>{t('loansIndex.goldValue')}</Text>
                      <Text style={styles.valueAmt}>₹{goldAmt.toLocaleString('en-IN')}  </Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text style={styles.valueLabel}>{t('loansIndex.eligible')}</Text>
                      <Text style={styles.valueAmt}>₹{eligible.toLocaleString('en-IN')}  </Text>
                    </View>
                    <View style={styles.valueItem}>
                      <Text style={styles.valueLabel}>{t('loansIndex.date')}</Text>
                      <Text style={styles.valueAmt}>{loan.LoanDate}  </Text>
                    </View>
                  </View>

                  {/* Pay button for open loans */}
                  {isOpen ? (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => router.push(`/payments/make-payment?loanId=${loan.ID}`)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="card-outline" size={15} color={colors.white} />
                      <Text style={styles.payBtnText}>{t('loansIndex.makePayment')}  </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.closedFooter}>
                      <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                      <Text style={styles.closedFooterText}>{t('loansIndex.loanClosed')}  </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
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
    backgroundColor: colors.primary.gold,
    borderRadius: 18, padding: spacing[4],
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  loanNo: { fontSize: 16, fontWeight: '800', color: colors.neutral[900] },
  branch: { fontSize: 12, color: colors.neutral[400], marginTop: 2 },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: 6 },
  badgeOpen: { backgroundColor: '#E8F5E9' },
  badgeClosed: { backgroundColor: colors.neutral[100] },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextOpen: { color: '#2E7D32' },
  badgeTextClosed: { color: colors.neutral[600] },
  scheme: { fontSize: 11, color: colors.neutral[400] },

  divider: { height: 1, backgroundColor: '#F0EBD8', marginVertical: spacing[3] },

  statsRow: { flexDirection: 'row', marginBottom: spacing[3] },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: colors.neutral[400], marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.neutral[800] },

  goldRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF8E7', borderRadius: 10,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    marginBottom: spacing[3],
  },
  goldItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  goldText: { fontSize: 12, color: colors.neutral[600], fontWeight: '500' },
  goldRate: { fontSize: 12, fontWeight: '700', color: colors.primary.dark },

  valueRow: { flexDirection: 'row', marginBottom: spacing[3] },
  valueItem: { flex: 1 },
  valueLabel: { fontSize: 10, color: colors.neutral[400], marginBottom: 2 },
  valueAmt: { fontSize: 12, fontWeight: '700', color: colors.neutral[700] },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: colors.primary.gold,
    borderRadius: 12, paddingVertical: spacing[3],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  payBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },

  closedFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: spacing[2],
    backgroundColor: '#E8F5E9', borderRadius: 10,
  },
  closedFooterText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
});
