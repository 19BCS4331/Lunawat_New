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
import { useOnlinePaymentHistory, useOfflinePaymentHistory } from '@/hooks';
import type { OnlinePayment, OfflinePayment } from '@/types';
import { useState } from 'react';

type Tab = 'online' | 'offline';

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('online');
  const [refreshing, setRefreshing] = useState(false);

  const { data: online, isLoading: onlineLoading, refetch: refetchOnline } = useOnlinePaymentHistory();
  const { data: offline, isLoading: offlineLoading, refetch: refetchOffline } = useOfflinePaymentHistory();

  const isLoading = onlineLoading || offlineLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOnline(), refetchOffline()]);
    setRefreshing(false);
  };

  const displayed = activeTab === 'online' ? (online ?? []) : (offline ?? []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('payments.title') + ' '}</Text>
        <TouchableOpacity
          style={styles.makePayBtn}
          onPress={() => router.push('/payments/make-payment')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.makePayText}>{t('payments.payNow') + ' '}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.primary.gold} />
          <Text style={styles.summaryCount}>{online?.length ?? 0}  </Text>
          <Text style={styles.summaryLabel}>{t('payments.online') + '  '}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="cash-outline" size={20} color={colors.neutral[600]} />
          <Text style={styles.summaryCount}>{offline?.length ?? 0}  </Text>
          <Text style={styles.summaryLabel}>{t('payments.offline') + '  '}</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'online' && styles.tabActive]}
          onPress={() => setActiveTab('online')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'online' && styles.tabTextActive]}>
            {t('payments.tabOnline') + ' '} ({online?.length ?? 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offline' && styles.tabActive]}
          onPress={() => setActiveTab('offline')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'offline' && styles.tabTextActive]}>
            {t('payments.tabOffline') + ' '} ({offline?.length ?? 0})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
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
              <Ionicons name="receipt-outline" size={44} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>{activeTab === 'online' ? t('payments.noOnlinePayments') + ' ' : t('payments.noOfflinePayments') + ' '}</Text>
            </View>
          ) : activeTab === 'online' ? (
            (displayed as OnlinePayment[]).map((p) => {
              const isSuccess = p.Status?.toLowerCase() === 'success';
              const txn = p.parsedResponseCode;
              const mode = (p.Mode ?? txn?.payment_method_type ?? '').toUpperCase();
              const refId = p.TransactionRefID ?? txn?.transactionid ?? txn?.bank_ref_no ?? null;
              return (
                <View key={p.ID} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconWrap, isSuccess ? styles.iconSuccess : styles.iconFail]}>
                      <Ionicons
                        name={isSuccess ? 'checkmark-circle' : 'close-circle'}
                        size={22}
                        color={isSuccess ? '#2E7D32' : colors.error}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardLoanNo}>{p.LoanNo}  </Text>
                      <Text style={styles.cardDate}>{p.Date}{mode ? ` • ${mode}` : ''}  </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.cardAmount}>₹{parseFloat(p.Amount || '0').toLocaleString('en-IN')}  </Text>
                      <View style={[styles.statusBadge, isSuccess ? styles.statusSuccess : styles.statusFail]}>
                        <Text style={[styles.statusText, isSuccess ? styles.statusTextSuccess : styles.statusTextFail]}>
                          {isSuccess ? t('payments.statusSuccess') + ' ' : t('payments.statusFailed') + ' '}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {refId ? (
                    <Text style={styles.refId} numberOfLines={1}>{t('payments.ref')}: {refId}  </Text>
                  ) : null}
                </View>
              );
            })
          ) : (
            (displayed as OfflinePayment[]).map((p) => (
              <View key={p.ID} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconWrap, styles.iconOffline]}>
                    <Ionicons name="cash-outline" size={22} color={colors.neutral[600]} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLoanNo}>{p.LoanNo}  </Text>
                    <Text style={styles.cardDate}>{p.Date} • {p.PaidBy}  </Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardAmount}>₹{parseFloat(p.Amount || '0').toLocaleString('en-IN')}  </Text>
                    {p.ReceiptNo ? (
                      <View style={styles.statusBadge}>
                        <Text style={styles.receiptText}>{p.ReceiptNo}  </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: spacing[4] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3],
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.neutral[900] },
  makePayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: 22,
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  makePayText: { fontSize: 13, fontWeight: '700', color: colors.white },
  summaryRow: {
    flexDirection: 'row', gap: spacing[3],
    marginHorizontal: spacing[5], marginBottom: spacing[3],
  },
  summaryCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16,
    padding: spacing[4], alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  summaryCount: { fontSize: 22, fontWeight: '800', color: colors.neutral[900] },
  summaryLabel: { fontSize: 11, color: colors.neutral[500], fontWeight: '600' },
  tabRow: {
    flexDirection: 'row', marginHorizontal: spacing[5],
    backgroundColor: colors.neutral[100], borderRadius: 14,
    padding: 4, marginBottom: spacing[4],
  },
  tab: { flex: 1, paddingVertical: spacing[2], alignItems: 'center', borderRadius: 11 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.neutral[500] },
  tabTextActive: { color: colors.primary.dark },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: spacing[5] },
  emptyCard: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[3] },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.neutral[500] },
  card: {
    backgroundColor: colors.white, borderRadius: 16,
    padding: spacing[4], marginBottom: spacing[3],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconSuccess: { backgroundColor: '#E8F5E9' },
  iconFail: { backgroundColor: '#FFEBEE' },
  iconOffline: { backgroundColor: colors.neutral[100] },
  cardInfo: { flex: 1 },
  cardLoanNo: { fontSize: 14, fontWeight: '700', color: colors.neutral[900] },
  cardDate: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { fontSize: 15, fontWeight: '800', color: colors.neutral[900] },
  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: 5 },
  statusSuccess: { backgroundColor: '#E8F5E9' },
  statusFail: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextSuccess: { color: '#2E7D32' },
  statusTextFail: { color: colors.error },
  receiptText: { fontSize: 10, fontWeight: '600', color: colors.neutral[500] },
  refId: { fontSize: 11, color: colors.neutral[400], marginTop: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: '#F0EBD8' },
});
