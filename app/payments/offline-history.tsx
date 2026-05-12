import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Loader, EmptyState } from '@/components';
import { colors, spacing } from '@/theme';
import { useOfflinePaymentHistory } from '@/hooks';
import type { OfflinePayment } from '@/types';

export default function OfflinePaymentHistoryScreen() {
  const router = useRouter();
  const { data: payments, isLoading, error } = useOfflinePaymentHistory();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] }}>
          <EmptyState
            title="Error Loading History"
            description="Failed to load offline payment history. Please try again."
            actionLabel="Retry"
            onAction={() => router.replace('/payments/offline-history')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing[6] }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ fontSize: 16, color: colors.primary.gold, fontWeight: '600' }}>
            ← Back  
          </Text>
        </Pressable>

        <View style={{ marginBottom: spacing[6] }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900], marginBottom: spacing[1] }}>
            Offline Payments  
          </Text>
          <Text style={{ fontSize: 16, color: colors.neutral[600] }}>
            {payments?.length || 0} transaction{payments?.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {payments && payments.length > 0 ? (
          payments.map((payment: OfflinePayment) => (
            <Card key={payment.ID} variant="outlined" style={{ marginBottom: spacing[3], padding: spacing[4] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.neutral[900] }}>
                  {payment.LoanNo}  
                </Text>
                <View
                  style={{
                    paddingHorizontal: spacing[2],
                    paddingVertical: spacing[1],
                    borderRadius: 4,
                    backgroundColor: colors.neutral[100],
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.neutral[700],
                    }}
                  >
                    {payment.PaidBy}  
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Amount</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
                  ₹{parseFloat(payment.Amount || '0').toLocaleString('en-IN')}  
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Date</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
                  {payment.Date}  
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Paid By</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
                  {payment.PaidBy}  
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No Offline Payments"
            description="You don't have any offline payment transactions."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
