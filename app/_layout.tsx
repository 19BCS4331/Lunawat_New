import '../global.css';
import '@/localization/i18n.config'; // initialize i18next at app startup
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryProvider } from '@/hooks';
import { useAuthStore, useAppStore } from '@/store';
import { pinManager } from '@/utils/pin';
import { biometricAuth } from '@/utils/biometric';
import i18n from '@/localization/i18n.config';

SplashScreen.preventAutoHideAsync();

function AppGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const language = useAppStore((s) => s.language);

  // Sync persisted language to i18next on every mount / language change
  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    void (async () => {
      await SplashScreen.hideAsync();

      const inAuth = segments[0] === '(auth)';

      if (!isAuthenticated) {
        if (!inAuth) router.replace('/(auth)/login');
        return;
      }

      // Authenticated — check PIN / biometric gate
      const [pinEnabled, bioEnabled, bioAvailable] = await Promise.all([
        pinManager.isPinEnabled(),
        biometricAuth.isBiometricEnabled(),
        biometricAuth.isAvailable(),
      ]);

      const needsGate = pinEnabled || (bioEnabled && bioAvailable);
      // Only show gate when navigating INTO the app from a cold start
      // (not if already sitting on verify-pin)
      const onVerifyPin = segments[0] === '(auth)' && (segments as string[])[1] === 'verify-pin';

      if (needsGate && !onVerifyPin && !inAuth) {
        router.replace('/(auth)/verify-pin');
      } else if (!inAuth) {
        // Already authenticated and no gate needed — stay
      } else if (inAuth && !onVerifyPin) {
        router.replace('/(tabs)/dashboard');
      }
    })();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AppGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="loans" options={{ headerShown: false }} />
        <Stack.Screen name="payments" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryProvider>
  );
}
