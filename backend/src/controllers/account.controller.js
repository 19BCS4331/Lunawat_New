import { accountService } from '../services/account.service.js';

/**
 * Account controller.
 */
export const accountController = {
  /**
   * POST /api/change-password
   */
  async changePassword(req, res, next) {
    try {
      const response = await accountService.changePassword(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/validate-token
   */
  async validateToken(req, res, next) {
    try {
      const response = await accountService.validateToken(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/latest-version
   */
  async getLatestVersion(req, res, next) {
    try {
      const response = await accountService.getLatestVersion();
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
};
