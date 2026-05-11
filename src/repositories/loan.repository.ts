import { loanService } from '@/services';
import { secureStorage } from '@/utils';
import type { UserProfile, Loan } from '@/types';

export const loanRepository = {
  async getProfile(): Promise<UserProfile> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await loanService.getProfile({ UserID: userId, Token: token });
    return response;
  },

  async getMyLoans(): Promise<Loan[]> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await loanService.getMyLoans({ UserID: userId, Token: token });
    
    // Filter out error responses
    const firstLoan = response[0];
    if (firstLoan && 'Status' in firstLoan && firstLoan.Status === 'Invalid Token') {
      throw new Error('Invalid token');
    }
    
    return response;
  },

  async getOutstandingLoans(): Promise<Loan[]> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await loanService.getOutstandingLoans({ UserID: userId, Token: token });
    
    // Filter out error responses
    const firstOutstanding = response[0];
    if (firstOutstanding && 'Status' in firstOutstanding && firstOutstanding.Status === 'Invalid Token') {
      throw new Error('Invalid token');
    }
    
    return response;
  },

  getOpenLoans(loans: Loan[]): Loan[] {
    return loans.filter((loan) => loan.LoanStatus === 'Open');
  },

  getClosedLoans(loans: Loan[]): Loan[] {
    return loans.filter((loan) => loan.LoanStatus === 'Closed');
  },
};
