import { secureStorage, mmkvStorage } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

export const storageConfig = {
  // Secure Storage (Sensitive Data)
  auth: {
    setAccessToken: (token: string) => secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
    getAccessToken: () => secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    setRefreshToken: (token: string) => secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
    getRefreshToken: () => secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    setUserId: (userId: string) => secureStorage.setItem(STORAGE_KEYS.USER_ID, userId),
    getUserId: () => secureStorage.getItem(STORAGE_KEYS.USER_ID),
    setBiometricEnabled: (enabled: boolean) => secureStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, String(enabled)),
    getBiometricEnabled: async () => {
      const value = await secureStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    },
    setPin: (pin: string) => secureStorage.setItem(STORAGE_KEYS.PIN, pin),
    getPin: () => secureStorage.getItem(STORAGE_KEYS.PIN),
    clearAuth: () => secureStorage.clearAll(),
  },

  // AsyncStorage (Non-Sensitive Data)
  app: {
    setLanguage: (language: string) => mmkvStorage.setItem(STORAGE_KEYS.LANGUAGE, language),
    getLanguage: () => mmkvStorage.getItem(STORAGE_KEYS.LANGUAGE),
    setOnboarded: (onboarded: boolean) => mmkvStorage.setItem(STORAGE_KEYS.ONBOARDED, onboarded),
    getOnboarded: () => mmkvStorage.getBoolean(STORAGE_KEYS.ONBOARDED),
    setNotificationsEnabled: (enabled: boolean) => mmkvStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled),
    getNotificationsEnabled: () => mmkvStorage.getBoolean(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
    clearApp: () => mmkvStorage.clearAll(),
  },
};
