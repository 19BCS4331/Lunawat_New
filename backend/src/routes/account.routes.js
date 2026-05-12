import express from 'express';
import { accountController } from '../controllers/account.controller.js';

const router = express.Router();

/**
 * Account routes - matching legacy backend endpoints exactly
 */
router.post('/ChangePassword', accountController.changePassword);
router.post('/GetCurrentToken', accountController.validateToken);
router.post('/GetLatestVersion', accountController.getLatestVersion);

export default router;
