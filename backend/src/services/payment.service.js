import { proxyRequest } from '../utils/proxy.util.js';

/**
 * Payment service for legacy backend endpoints.
 * Note: Service paths match mobile app endpoints exactly
 */
export const paymentService = {
  /**
   * Generate payment token
   */
  async generatePaymentToken(data) {
    return await proxyRequest('/GeneratePaymentToken', data);
  },

  /**
   * Get online payment history
   */
  async getOnlinePaymentHistory(data) {
    return await proxyRequest('/MyPaymentHistory', data);
  },

  /**
   * Get offline payment history
   */
  async getOfflinePaymentHistory(data) {
    return await proxyRequest('/OfflinePaymentHistory', data);
  },
};
