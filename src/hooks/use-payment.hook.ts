import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentRepository } from '@/repositories';
import { queryKeys } from '@/hooks/query-keys';

export const useGeneratePaymentToken = () => {
  return useMutation({
    mutationFn: ({ loanId, loanNo, amount }: { loanId: string; loanNo: string; amount: string }) =>
      paymentRepository.generatePaymentToken(loanId, loanNo, amount),
  });
};

export const useOnlinePaymentHistory = () => {
  return useQuery({
    queryKey: queryKeys.payments.online(),
    queryFn: () => paymentRepository.getOnlinePaymentHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOfflinePaymentHistory = () => {
  return useQuery({
    queryKey: queryKeys.payments.offline(),
    queryFn: () => paymentRepository.getOfflinePaymentHistory(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
