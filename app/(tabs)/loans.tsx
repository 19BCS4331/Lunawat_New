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

export default function LoansScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('open');
  const [refreshing, setRefreshing] = useState(false);
  const { data: loans, isLoading, error, refetch } = useMyLoans();

  const openLoans = loans?.filter((l: Loan) => l.LoanStatus === 'Open') ?? [];
  const closedLoans = loans?.filter((l: Loan) => l.LoanStatus === 'Closed') ?? [];
  const displayed = activeTab === 'open' ? openLoans : closedLoans;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('loans.title')}</Text>
        <Text style={styles.headerSub}>{loans?.length ?? 0} {t('loans.totalAccounts')}</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'open' && styles.tabActive]}
          onPress={() => setActiveTab('open')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>
            {t('loans.tabActive')} ({openLoans.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'closed' && styles.tabActive]}
          onPress={() => setActiveTab('closed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'closed' && styles.tabTextActive]}>
            {t('loans.tabClosed')} ({closedLoans.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.warning} />
          <Text style={styles.errorText}>{t('loans.failedToLoad')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
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
          {displayed.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={44} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'open' ? t('loans.noActiveLoans') : t('loans.noClosedLoans')}
              </Text>
            </View>
          ) : (
            displayed.map((loan: Loan) => {
              const isOpen = loan.LoanStatus === 'Open';
              const pending = parseSafe(loan.PendingLoanAmount);
              const loanAmt = parseSafe(loan.LoanAmount);
              const interest = parseSafe(loan.IntAmount);
              const total = parseSafe(loan.TotalDueAmount as string);
              return (
                <TouchableOpacity
                  key={loan.ID}
                  style={styles.card}
                  onPress={() => router.push(`/loans/${loan.ID}`)}
                  activeOpacity={0.82}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.loanNo}>{loan.LoanNo}</Text>
                      {loan.BranchName ? <Text style={styles.branch}>{loan.BranchName}</Text> : null}
                    </View>
                    <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                      <Text style={[styles.badgeText, isOpen ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                        {isOpen ? t('loans.statusOpen') : t('loans.statusClosed')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>{t('loans.loanAmount')}</Text>
                      <Text style={styles.statValue}>₹{loanAmt.toLocaleString('en-IN')}</Text>
                    </View>
                    {isOpen ? (
                      <>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loans.pending')}</Text>
                          <Text style={[styles.statValue, { color: colors.warning }]}>
                            {pending > 0 ? `₹${pending.toLocaleString('en-IN')}` : '—'}
                          </Text>
                        </View>
                        <View style={styles.stat}>
                          <Text style={styles.statLabel}>{t('loans.interest')}</Text>
                          <Text style={styles.statValue}>
                            {interest > 0 ? `₹${interest.toLocaleString('en-IN')}` : '—'}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.stat}>
                        <Text style={styles.statLabel}>{t('loans.netPaid')}</Text>
                        <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                          {loan.NetPaid ? `₹${loan.NetPaid}` : `₹${loanAmt.toLocaleString('en-IN')}`}
                        </Text>
                      </View>
                    )}
                  </View>

                  {(loan.GrossWeight || loan.LoanDate) ? (
                    <View style={styles.footer}>
                      {loan.GrossWeight ? (
                        <Text style={styles.footerText}>{t('loans.gold')}: {loan.GrossWeight} • ₹{loan.GoldRate}/g</Text>
                      ) : null}
                      <Text style={styles.footerText}>{loan.LoanDate}</Text>
                    </View>
                  ) : null}

                  {isOpen && total > 0 ? (
                    <View style={styles.totalDue}>
                      <Text style={styles.totalDueLabel}>{t('loans.totalDue')}</Text>
                      <Text style={styles.totalDueValue}>₹{total.toLocaleString('en-IN')}</Text>
                    </View>
                  ) : null}

                  <View style={styles.arrowRow}>
                    <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: spacing[4] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3] },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.neutral[900] },
  headerSub: { fontSize: 13, color: colors.neutral[500], marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: spacing[4],
  },
  tab: { flex: 1, paddingVertical: spacing[2], alignItems: 'center', borderRadius: 11 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.neutral[500] },
  tabTextActive: { color: colors.primary.dark },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[3] },
  errorText: { fontSize: 15, color: colors.neutral[700], fontWeight: '600' },
  retryBtn: { backgroundColor: colors.primary.gold, paddingHorizontal: spacing[6], paddingVertical: spacing[2], borderRadius: 10 },
  retryText: { color: colors.white, fontWeight: '700' },
  list: { paddingHorizontal: spacing[5] },
  emptyCard: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[3] },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.neutral[500] },
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    padding: spacing[4], marginBottom: spacing[3],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1 },
  loanNo: { fontSize: 15, fontWeight: '800', color: colors.neutral[900] },
  branch: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  badge: { paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: 6 },
  badgeOpen: { backgroundColor: '#E8F5E9' },
  badgeClosed: { backgroundColor: colors.neutral[100] },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextOpen: { color: '#2E7D32' },
  badgeTextClosed: { color: colors.neutral[600] },
  divider: { height: 1, backgroundColor: '#F0EBD8', marginVertical: spacing[3] },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: colors.neutral[500], marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.neutral[800] },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: spacing[3], paddingTop: spacing[2],
    borderTopWidth: 1, borderTopColor: '#F0EBD8',
  },
  footerText: { fontSize: 11, color: colors.neutral[400] },
  totalDue: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: spacing[3],
    backgroundColor: '#FFF8E7', borderRadius: 10,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
  },
  totalDueLabel: { fontSize: 12, fontWeight: '600', color: colors.primary.dark },
  totalDueValue: { fontSize: 14, fontWeight: '800', color: colors.primary.dark },
  arrowRow: { alignItems: 'flex-end', marginTop: spacing[2] },
});
