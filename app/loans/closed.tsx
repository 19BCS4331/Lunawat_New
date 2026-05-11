import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Loader, EmptyState } from '@/components';
import { colors, spacing } from '@/theme';
import { useMyLoans } from '@/hooks';
import type { Loan } from '@/types';

export default function ClosedLoansScreen() {
  const router = useRouter();
  const { data: loans, isLoading, error } = useMyLoans();
  const closedLoans = loans?.filter((loan: Loan) => loan.LoanStatus === 'Closed') || [];

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
            title="Error Loading Loans"
            description="Failed to load your loans. Please try again."
            actionLabel="Retry"
            onAction={() => router.replace('/loans/closed')}
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
            Closed Loans
          </Text>
          <Text style={{ fontSize: 16, color: colors.neutral[600] }}>
            {closedLoans.length} completed loan{closedLoans.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {closedLoans.length > 0 ? (
          closedLoans.map((loan: Loan) => (
            <Card
              key={loan.ID}
              variant="outlined"
              style={{ marginBottom: spacing[3], padding: spacing[4] }}
            >
              <Pressable onPress={() => router.push(`/loans/${loan.ID}`)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.neutral[900] }}>
                    {loan.LoanNo}
                  </Text>
                  <View style={{
                    paddingHorizontal: spacing[2],
                    paddingVertical: spacing[1],
                    borderRadius: 4,
                    backgroundColor: colors.neutral[100]
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.neutral[700]
                    }}>
                      {loan.LoanStatus}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Loan Amount</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
                    ₹{parseFloat(loan.LoanAmount || '0').toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                  <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Loan Date</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
                    {loan.LoanDate}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Final Paid</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success[700] }}>
                    ₹{parseFloat(loan.LoanAmount || '0').toLocaleString('en-IN')}
                  </Text>
                </View>
              </Pressable>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No Closed Loans"
            description="You don't have any completed loans yet."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
