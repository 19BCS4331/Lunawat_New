import express from 'express';
import { loanController } from '../controllers/loan.controller.js';

const router = express.Router();

/**
 * Loan routes - matching legacy backend endpoints exactly
 */
router.post('/MyProfile', loanController.getProfile);
router.post('/MyLoans', loanController.getMyLoans);
router.post('/OutstandingLoans', loanController.getOutstandingLoans);

export default router;
