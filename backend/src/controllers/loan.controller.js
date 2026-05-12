import { loanService } from '../services/loan.service.js';

/**
 * Loan controller.
 */
export const loanController = {
  /**
   * POST /api/profile
   */
  async getProfile(req, res, next) {
    try {
      const response = await loanService.getProfile(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/loans
   */
  async getMyLoans(req, res, next) {
    try {
      const response = await loanService.getMyLoans(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/outstanding-loans
   */
  async getOutstandingLoans(req, res, next) {
    try {
      const response = await loanService.getOutstandingLoans(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
};
