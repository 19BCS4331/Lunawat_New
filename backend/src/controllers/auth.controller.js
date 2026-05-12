import { authService } from '../services/auth.service.js';

/**
 * Authentication controller.
 */
export const authController = {
  /**
   * POST /api/send-login-otp
   */
  async sendLoginOtp(req, res, next) {
    try {
      const response = await authService.sendLoginOtp(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/login-otp
   */
  async loginWithOtp(req, res, next) {
    try {
      const response = await authService.loginWithOtp(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/login-password
   */
  async loginWithPassword(req, res, next) {
    try {
      const response = await authService.loginWithPassword(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/send-reset-password-otp
   */
  async sendResetPasswordOtp(req, res, next) {
    try {
      const response = await authService.sendResetPasswordOtp(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const response = await authService.resetPassword(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const response = await authService.refreshToken(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
};
