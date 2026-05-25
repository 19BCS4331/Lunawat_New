import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useMyLoans, useProfile } from '@/hooks';
import type { Loan } from '@/types';
import { useState } from 'react';
import { SkeletonDashboard } from '@/components/skeleton';
import { PressableScale } from '@/components/pressable-scale';
import { haptics } from '@/utils/haptics';

function parsePendingAmount(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '-') return 0;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function formatINR(val: number): string {
  return '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

function LoanCard({ loan, onPress }: LoanCardProps) {
  const { t } = useTranslation();
  const isOpen = loan.LoanStatus === 'Open';
  const pending = parsePendingAmount(loan.PendingLoanAmount);
  const loanAmt = parsePendingAmount(loan.LoanAmount);
  const interest = parsePendingAmount(loan.IntAmount);

  return (
    <PressableScale
      style={styles.loanCard}
      onPress={() => { haptics.light(); onPress(); }}
      scale={0.98}
    >
      <View style={styles.loanCardHeader}>
        <View>
          <Text style={styles.loanNo}>{loan.LoanNo}        </Text>
          {loan.BranchName ? (
            <Text style={styles.loanBranch}>{loan.BranchName}     </Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
          <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
            {isOpen ? t('dashboard.statusOpen')+ ' ' : t('dashboard.statusClosed') + ' '}
          </Text>
        </View>
      </View>

      <View style={styles.loanDivider} />

      <View style={styles.loanRow}>
        <View style={styles.loanStat}>
          <Text style={styles.loanStatLabel}>{t('dashboard.loanAmount')}</Text>
          <Text style={styles.loanStatValue}>{formatINR(loanAmt) + ' '}        </Text>
        </View>
        {isOpen ? (
          <View style={styles.loanStat}>
            <Text style={styles.loanStatLabel}>{t('dashboard.pending')}</Text>
            <Text style={[styles.loanStatValue, styles.loanStatPending]}>
              {pending > 0 ? formatINR(pending) + ' ' : '—'}
            </Text>
          </View>
        ) : (
          <View style={styles.loanStat}>
            <Text style={styles.loanStatLabel}>{t('dashboard.netPaid')}</Text>
            <Text style={[styles.loanStatValue, styles.loanStatPaid]}>
              {loan.NetPaid ? `₹${loan.NetPaid}`+ ' ' : formatINR(loanAmt) + ' '}
            </Text>
          </View>
        )}
        {isOpen && interest > 0 ? (
          <View style={styles.loanStat}>
            <Text style={styles.loanStatLabel}>{t('dashboard.interest')}</Text>
            <Text style={styles.loanStatValue}>{formatINR(interest) + ' '} </Text>
          </View>
        ) : null}
      </View>

      {loan.GrossWeight ? (
        <View style={styles.loanGoldRow}>
          <Text style={styles.loanGoldText}>
            {t('dashboard.gold') + ' '}: {loan.GrossWeight}  •  {t('dashboard.rate') + ' '}: ₹{loan.GoldRate}
          </Text>
          <Text style={styles.loanDateText}>{loan.LoanDate}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: loans, isLoading, error, refetch } = useMyLoans();
  const { data: profile } = useProfile();

  const openLoans = loans?.filter((l: Loan) => l.LoanStatus === 'Open') ?? [];
  const totalOutstanding = openLoans.reduce(
    (sum: number, l: Loan) => sum + parsePendingAmount(l.PendingLoanAmount),
    0,
  );
  // const totalInterest = openLoans.reduce(
  //   (sum: number, l: Loan) => sum + parsePendingAmount(l.IntAmount),
  //   0,
  // );
  const closedCount = loans?.filter((l: Loan) => l.LoanStatus === 'Closed')?.length ?? 0;

  const quickActions = [
    { id: 'pay', icon: 'card' as const, label: t('dashboard.payNow'), onPress: () => { haptics.light(); router.push('/payments/make-payment'); } },
    { id: 'loans', icon: 'document-text' as const, label: t('dashboard.myLoans'), onPress: () => { haptics.light(); router.push('/loans'); } },
    { id: 'history', icon: 'receipt' as const, label: t('dashboard.history'), onPress: () => { haptics.light(); router.push('/payments/history'); } },
    { id: 'profile', icon: 'person-circle' as const, label: t('dashboard.profile'), onPress: () => { haptics.light(); router.push('/(tabs)/profile'); } },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SkeletonDashboard />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
          <Text style={styles.errorTitle}>{t('dashboard.unableToLoad')}</Text>
          <Text style={styles.errorSubtitle}>{t('dashboard.checkConnection')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>{t('dashboard.retry') + ' '}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
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
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('dashboard.greeting')}  </Text>
            <Text style={styles.userName}>{profile?.Name ?? t('dashboard.customerName')}   </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            {profile?.ProfileImage ? (
              <Image source={{ uri: profile.ProfileImage }} style={styles.avatarImage} />
            ) : profile?.Name ? (
              <Text style={styles.avatarText}>{profile.Name.charAt(0).toUpperCase()}  </Text>
            ) : (
              <Ionicons name="person" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecorCircle} />
          <Text style={styles.heroLabel}>{t('dashboard.totalOutstanding')}  </Text>
          <Text style={styles.heroAmount}>{formatINR(totalOutstanding)}  </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{openLoans.length}  </Text>
              <Text style={styles.heroStatLabel}>{t('dashboard.activeLoans')}  </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{closedCount}  </Text>
              <Text style={styles.heroStatLabel}>{t('dashboard.closedLoans')}  </Text>
            </View>
            {/* <View style={styles.heroStatDivider} /> */}
            {/* <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatINR(totalInterest)}</Text>
              <Text style={styles.heroStatLabel}>Interest Due</Text>
            </View> */}
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}  </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <PressableScale
              key={a.id}
              style={styles.actionCard}
              onPress={a.onPress}
              scale={0.94}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name={a.icon} size={22} color={colors.primary.dark} />
              </View>
              <Text style={styles.actionLabel}>{a.label} </Text>
            </PressableScale>
          ))}
        </View>

        {/* ── Recent Loans ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentLoans') + ' '}</Text>
          <TouchableOpacity onPress={() => router.push('/loans')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>{t('dashboard.viewAll') + ' '}</Text>
          </TouchableOpacity>
        </View>

        {openLoans.length > 0 ? (
          openLoans.slice(0, 4).map((loan: Loan) => (
            <LoanCard
              key={loan.ID}
              loan={loan}
              onPress={() => { haptics.light(); router.push(`/loans/${loan.ID}`); }}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={44} color={colors.neutral[300]} style={{ marginBottom: spacing[3] }} />
            <Text style={styles.emptyTitle}>{t('dashboard.noLoansFound') + ' '}</Text>
            <Text style={styles.emptySubtitle}>{t('dashboard.noLoansSubtitle') + ' '}</Text>
          </View>
        )}

        <View style={{ height: spacing[4] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  scroll: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },

  // Loading / Error
  loadingText: { marginTop: spacing[3], fontSize: 14, color: colors.neutral[500] },
  errorTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[800], marginBottom: spacing[2] },
  errorSubtitle: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: spacing[5] },
  retryButton: {
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing[8], paddingVertical: spacing[3],
    borderRadius: 12,
  },
  retryButtonText: { fontWeight: '700', color: colors.white, fontSize: 15 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing[5],
  },
  greeting: { fontSize: 13, color: colors.neutral[500], fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', color: colors.neutral[900], marginTop: 2 },
  avatarButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.white },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },

  // Hero Card
  heroCard: {
    backgroundColor: colors.primary.gold,
    borderRadius: 24, padding: spacing[5],
    marginBottom: spacing[6],
    overflow: 'hidden',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 14,
  },
  heroDecorCircle: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: spacing[1] },
  heroAmount: {
    fontSize: 36, fontWeight: '800', color: colors.white,
    marginBottom: spacing[5], letterSpacing: -0.5,
  },
  heroStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: spacing[3],
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 15, fontWeight: '800', color: colors.white },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  actionCard: {
    flex: 1, alignItems: 'center', marginHorizontal: 4,
    backgroundColor: colors.white, borderRadius: 16,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  actionIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[2],
  },
  actionLabel: { fontSize: 11, fontWeight: 'bold', color: colors.neutral[700], textAlign: 'center' },

  // Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing[3],
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.neutral[900], marginBottom: spacing[3] },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.primary.gold },

  // Loan Card
  loanCard: {
    backgroundColor: colors.white, borderRadius: 18,
    padding: spacing[4], marginBottom: spacing[3],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  loanCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loanNo: { fontSize: 15, fontWeight: '800', color: colors.neutral[900] },
  loanBranch: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing[2], paddingVertical: 3,
    borderRadius: 6,
  },
  statusOpen: { backgroundColor: '#E8F5E9' },
  statusClosed: { backgroundColor: colors.neutral[100] },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOpen: { color: '#2E7D32' },
  statusTextClosed: { color: colors.neutral[600] },
  loanDivider: { height: 1, backgroundColor: '#F0EBD8', marginVertical: spacing[3] },
  loanRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loanStat: { flex: 1 },
  loanStatLabel: { fontSize: 11, color: colors.neutral[500], marginBottom: 2 },
  loanStatValue: { fontSize: 14, fontWeight: '700', color: colors.neutral[800] },
  loanStatPending: { color: colors.warning },
  loanStatPaid: { color: '#2E7D32' },
  loanGoldRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1, borderTopColor: '#F0EBD8',
  },
  loanGoldText: { fontSize: 11, color: colors.neutral[500] },
  loanDateText: { fontSize: 11, color: colors.neutral[400] },

  // Empty state
  emptyCard: {
    backgroundColor: colors.white, borderRadius: 18,
    padding: spacing[8], alignItems: 'center',
    borderWidth: 1, borderColor: '#EDE8D8',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800], marginBottom: spacing[1] },
  emptySubtitle: { fontSize: 13, color: colors.neutral[500], textAlign: 'center' },
});
