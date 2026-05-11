import { useMutation, useQuery } from '@tanstack/react-query';
import { authRepository } from '@/repositories';
import { queryKeys } from '@/hooks/query-keys';

export const useSendLoginOtp = () => {
  return useMutation({
    mutationFn: (mobileNo: string) => authRepository.sendLoginOtp(mobileNo),
  });
};

export const useLoginWithOtp = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authRepository.loginWithOtp(email, otp),
  });
};

export const useLoginWithPassword = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authRepository.loginWithPassword(email, password),
  });
};

export const useSendResetPasswordOtp = () => {
  return useMutation({
    mutationFn: (mobileNo: string) => authRepository.sendResetPasswordOtp(mobileNo),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      authRepository.resetPassword(userId, newPassword),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authRepository.logout(),
  });
};

export const useAuthStatus = () => {
  return useQuery({
    queryKey: queryKeys.auth.status(),
    queryFn: async () => {
      const token = await authRepository.getAccessToken();
      const userId = await authRepository.getUserId();
      return { isAuthenticated: !!token && !!userId, userId };
    },
    staleTime: Infinity,
  });
};
