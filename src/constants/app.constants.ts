export const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'https://myloan.slunawat.com/LoanAPI';
export const ENV = Constants.expoConfig?.extra?.ENV || 'development';

import Constants from 'expo-constants';

export const API_TIMEOUT = 60000; // 60 seconds

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  PIN: 'pin_hash',
  LANGUAGE: 'app_language',
  ONBOARDED: 'onboarded',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
} as const;

export const PAYMENT_CONFIG = {
  MIN_AMOUNT: 100,
  AMOUNT_MULTIPLE: 10,
  MIN_INTEREST_DAYS: 15,
  RETURN_URL: 'https://myloan.slunawat.com/MyLoans/PGResponse',
  FLOW_TYPE: 'payments',
  CHILD_WINDOW: false,
} as const;

export const LOAN_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
} as const;

export const PAYMENT_STATUS = {
  SUCCESS: 'Success',
  PENDING: 'Pending',
  FAILED: 'Failed',
} as const;
