import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * Payment routes - matching legacy backend endpoints exactly
 */
router.post('/GeneratePaymentToken', paymentController.generatePaymentToken);
router.post('/MyPaymentHistory', paymentController.getOnlinePaymentHistory);
router.post('/OfflinePaymentHistory', paymentController.getOfflinePaymentHistory);

export default router;
