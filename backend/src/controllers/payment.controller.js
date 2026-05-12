import { paymentService } from '../services/payment.service.js';

/**
 * Payment controller.
 */
export const paymentController = {
  /**
   * POST /api/generate-payment-token
   */
  async generatePaymentToken(req, res, next) {
    try {
      const response = await paymentService.generatePaymentToken(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/online-payment-history
   */
  async getOnlinePaymentHistory(req, res, next) {
    try {
      const response = await paymentService.getOnlinePaymentHistory(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/offline-payment-history
   */
  async getOfflinePaymentHistory(req, res, next) {
    try {
      const response = await paymentService.getOfflinePaymentHistory(req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
};
