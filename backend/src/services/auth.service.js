import { proxyRequest } from '../utils/proxy.util.js';

/**
 * Authentication service for legacy backend endpoints.
 * Note: Service paths match mobile app endpoints exactly
 */
export const authService = {
  /**
   * Send login OTP to user's mobile or email
   */
  async sendLoginOtp(data) {
    return await proxyRequest('/SendLoginOtp', data);
  },

  /**
   * Login with OTP
   */
  async loginWithOtp(data) {
    return await proxyRequest('/CustomerLogin', data);
  },

  /**
   * Login with password
   */
  async loginWithPassword(data) {
    return await proxyRequest('/CustomerLogin', data);
  },

  /**
   * Send reset password OTP
   */
  async sendResetPasswordOtp(data) {
    return await proxyRequest('/SendResetPasswordOTP', data);
  },

  /**
   * Reset password
   */
  async resetPassword(data) {
    return await proxyRequest('/ResetPassword', data);
  },

  /**
   * Refresh token
   */
  async refreshToken(data) {
    return await proxyRequest('/auth/refresh-token', data);
  },
};
