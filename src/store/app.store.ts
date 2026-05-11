import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from '@/types';
import i18n from '@/localization/i18n.config';

interface AppStore extends AppState {
  setLanguage: (language: 'en' | 'hi' | 'mr') => void;
  setOnboarded: (onboarded: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: 'en',
      isOnboarded: false,
      notificationsEnabled: true,
      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
