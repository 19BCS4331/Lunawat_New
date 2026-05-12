import { proxyRequest } from '../utils/proxy.util.js';

/**
 * Loan service for legacy backend endpoints.
 * Note: Service paths match mobile app endpoints exactly
 */
export const loanService = {
  /**
   * Get user profile
   */
  async getProfile(data) {
    return await proxyRequest('/MyProfile', data);
  },

  /**
   * Get user's loans
   */
  async getMyLoans(data) {
    return await proxyRequest('/MyLoans', data);
  },

  /**
   * Get outstanding loans
   */
  async getOutstandingLoans(data) {
    return await proxyRequest('/OutstandingLoans', data);
  },
};
