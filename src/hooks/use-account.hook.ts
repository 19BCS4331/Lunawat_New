import { useMutation, useQuery } from '@tanstack/react-query';
import { accountRepository } from '@/repositories';
import { queryKeys } from '@/hooks/query-keys';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      accountRepository.changePassword(oldPassword, newPassword),
  });
};

export const useValidateToken = () => {
  return useQuery({
    queryKey: queryKeys.account.validateToken(),
    queryFn: () => accountRepository.validateToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLatestVersion = () => {
  return useQuery({
    queryKey: queryKeys.account.latestVersion(),
    queryFn: () => accountRepository.getLatestVersion(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
