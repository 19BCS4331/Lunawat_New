import express from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Authentication routes - matching legacy backend endpoints exactly
 */
router.post('/SendLoginOtp', authController.sendLoginOtp);
router.post('/CustomerLogin', authController.loginWithOtp);
router.post('/CustomerLogin', authController.loginWithPassword);
router.post('/SendResetPasswordOTP', authController.sendResetPasswordOtp);
router.post('/ResetPassword', authController.resetPassword);
router.post('/auth/refresh-token', authController.refreshToken);

export default router;
