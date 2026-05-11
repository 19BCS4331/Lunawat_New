import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState } from '@/types';

interface AuthStore extends AuthState {
  setAuth: (accessToken: string, userId: string) => void;
  clearAuth: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setPin: (pin: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      accessToken: null,
      refreshToken: null,
      isBiometricEnabled: false,
      isPinEnabled: false,
      pin: null,
      setAuth: (accessToken, userId) =>
        set({
          isAuthenticated: true,
          accessToken,
          userId,
        }),
      clearAuth: () =>
        set({
          isAuthenticated: false,
          userId: null,
          accessToken: null,
          refreshToken: null,
        }),
      setBiometricEnabled: (enabled) => set({ isBiometricEnabled: enabled }),
      setPinEnabled: (enabled) => set({ isPinEnabled: enabled }),
      setPin: (pin) => set({ pin }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
