import express from 'express';
import authRoutes from './auth.routes.js';
import loanRoutes from './loan.routes.js';
import accountRoutes from './account.routes.js';
import paymentRoutes from './payment.routes.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * API routes - matching legacy backend endpoints exactly
 * No /api prefix - endpoints match legacy backend 1:1
 */
router.use(authRoutes);
router.use(loanRoutes);
router.use(accountRoutes);
router.use(paymentRoutes);

export default router;
