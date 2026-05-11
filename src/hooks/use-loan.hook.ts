import { useQuery } from '@tanstack/react-query';
import { loanRepository } from '@/repositories';
import { queryKeys } from '@/hooks/query-keys';

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.loans.profile(),
    queryFn: () => loanRepository.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMyLoans = () => {
  return useQuery({
    queryKey: queryKeys.loans.all(),
    queryFn: () => loanRepository.getMyLoans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOutstandingLoans = () => {
  return useQuery({
    queryKey: queryKeys.loans.outstanding(),
    queryFn: () => loanRepository.getOutstandingLoans(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
