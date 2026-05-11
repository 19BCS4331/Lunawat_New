import { apiClient } from '@/api';
import type { LoanRequest, UserProfile, Loan } from '@/types';

export const loanService = {
  async getProfile(data: LoanRequest): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/MyProfile', data);
    return response.data;
  },

  async getMyLoans(data: LoanRequest): Promise<Loan[]> {
    const response = await apiClient.post<Loan[]>('/MyLoans', data);
    return response.data;
  },

  async getOutstandingLoans(data: LoanRequest): Promise<Loan[]> {
    const response = await apiClient.post<Loan[]>('/OutstandingLoans', data);
    return response.data;
  },
};
