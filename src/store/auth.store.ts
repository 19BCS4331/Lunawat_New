import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthState } from '@/types';

const SECURE_KEYS = {
  accessToken: 'access_token',
  userId: 'user_id',
  refreshToken: 'refresh_token',
} as const;

interface AuthStore extends AuthState {
  setAuth: (accessToken: string, userId: string) => void;
  clearAuth: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  /** @deprecated – PIN must never be stored in state. Use pinManager (SecureStore). */
  setPin: (pin: string) => void;
  /** Call once on app launch to hydrate from SecureStore */
  initAuthFromSecureStore: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  isAuthenticated: false,
  userId: null,
  accessToken: null,
  refreshToken: null,
  isBiometricEnabled: false,
  isPinEnabled: false,
  pin: null,

  setAuth: (accessToken, userId) => {
    void SecureStore.setItemAsync(SECURE_KEYS.accessToken, accessToken);
    void SecureStore.setItemAsync(SECURE_KEYS.userId, userId);
    set({ isAuthenticated: true, accessToken, userId });
  },

  clearAuth: () => {
    void SecureStore.deleteItemAsync(SECURE_KEYS.accessToken);
    void SecureStore.deleteItemAsync(SECURE_KEYS.userId);
    void SecureStore.deleteItemAsync(SECURE_KEYS.refreshToken);
    set({
      isAuthenticated: false,
      userId: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  setBiometricEnabled: (enabled) => set({ isBiometricEnabled: enabled }),
  setPinEnabled: (enabled) => set({ isPinEnabled: enabled }),
  setPin: () => {
    if (__DEV__) console.warn('[AuthStore] setPin() is deprecated. Use pinManager from SecureStore.');
  },

  initAuthFromSecureStore: async () => {
    try {
      const [accessToken, userId] = await Promise.all([
        SecureStore.getItemAsync(SECURE_KEYS.accessToken),
        SecureStore.getItemAsync(SECURE_KEYS.userId),
      ]);
      if (accessToken && userId) {
        set({ isAuthenticated: true, accessToken, userId });
      } else {
        set({ isAuthenticated: false, accessToken: null, userId: null });
      }
    } catch (e) {
      if (__DEV__) console.error('[AuthStore] Failed to hydrate from SecureStore:', e);
      set({ isAuthenticated: false, accessToken: null, userId: null });
    }
  },
}));
