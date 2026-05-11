import { paymentService } from '@/services';
import { secureStorage } from '@/utils';
import type {
  PaymentTokenResponse,
  OnlinePayment,
  OfflinePayment,
  TransactionDetails,
} from '@/types';

function parseTransactionDetails(responseCode: string): TransactionDetails | null {
  try {
    return JSON.parse(responseCode) as TransactionDetails;
  } catch {
    return null;
  }
}

export const paymentRepository = {
  async generatePaymentToken(
    loanId: string,
    loanNo: string,
    amount: string,
  ): Promise<PaymentTokenResponse> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await paymentService.generatePaymentToken({
      LoanID: loanId,
      UserID: userId,
      LoanNo: loanNo,
      amount,
      Token: token,
    });
    
    return response;
  },

  async getOnlinePaymentHistory(): Promise<OnlinePayment[]> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await paymentService.getOnlinePaymentHistory({ UserID: userId, Token: token });
    
    return response.map((payment) => ({
      ...payment,
      parsedResponseCode: parseTransactionDetails(payment.ResponseCode),
    }));
  },

  async getOfflinePaymentHistory(): Promise<OfflinePayment[]> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    const response = await paymentService.getOfflinePaymentHistory({ UserID: userId, Token: token });
    
    // Filter out error responses
    const firstPayment = response[0];
    if (firstPayment && 'Status' in firstPayment && firstPayment.Status === 'Invalid Token') {
      throw new Error('Invalid token');
    }
    
    return response;
  },
};
