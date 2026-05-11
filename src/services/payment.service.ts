import { apiClient } from '@/api';
import type {
  GeneratePaymentTokenRequest,
  PaymentHistoryRequest,
  PaymentTokenResponse,
  OnlinePayment,
  OfflinePayment,
} from '@/types';

export const paymentService = {
  async generatePaymentToken(data: GeneratePaymentTokenRequest): Promise<PaymentTokenResponse> {
    const response = await apiClient.post<PaymentTokenResponse>('/GeneratePaymentToken', data);
    return response.data;
  },

  async getOnlinePaymentHistory(data: PaymentHistoryRequest): Promise<OnlinePayment[]> {
    const response = await apiClient.post<OnlinePayment[]>('/MyPaymentHistory', data);
    return response.data;
  },

  async getOfflinePaymentHistory(data: PaymentHistoryRequest): Promise<OfflinePayment[]> {
    const response = await apiClient.post<OfflinePayment[]>('/OfflinePaymentHistory', data);
    return response.data;
  },
};
