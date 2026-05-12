import { proxyRequest } from '../utils/proxy.util.js';

/**
 * Account service for legacy backend endpoints.
 * Note: Service paths match mobile app endpoints exactly
 */
export const accountService = {
  /**
   * Change password
   */
  async changePassword(data) {
    return await proxyRequest('/ChangePassword', data);
  },

  /**
   * Validate token
   */
  async validateToken(data) {
    return await proxyRequest('/GetCurrentToken', data);
  },

  /**
   * Get latest app version
   */
  async getLatestVersion() {
    return await proxyRequest('/GetLatestVersion', {});
  },
};
