import '../global.css';
import '@/localization/i18n.config'; // initialize i18next at app startup
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { QueryProvider } from '@/hooks';
import { useAuthStore, useAppStore } from '@/store';
import { pinManager } from '@/utils/pin';
import { biometricAuth } from '@/utils/biometric';
import i18n from '@/localization/i18n.config';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function AppGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initAuthFromSecureStore = useAuthStore((s) => s.initAuthFromSecureStore);
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const language = useAppStore((s) => s.language);
  const prevAppStateRef = useRef(AppState.currentState);
  const hasInitializedRef = useRef(false);

  // Sync persisted language to i18next on every mount / language change
  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  // Initial routing + auth/onboarding state changes only.
  // segments is intentionally omitted from deps so normal navigation
  // within the app does NOT re-trigger the gate.
  useEffect(() => {
    void (async () => {
      // Hydrate auth state from SecureStore only once on cold boot
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        await initAuthFromSecureStore();
      }
      await SplashScreen.hideAsync();

      const inAuth = segments[0] === '(auth)';
      const onOnboarding = segments[0] === 'onboarding';

      // Onboarding gate — show on first cold start
      if (!isOnboarded && !onOnboarding) {
        router.replace('/onboarding');
        return;
      }

      if (!isAuthenticated) {
        if (!inAuth && !onOnboarding) router.replace('/(auth)/login');
        return;
      }

      // Authenticated — check PIN / biometric gate
      const [pinEnabled, bioEnabled, bioAvailable] = await Promise.all([
        pinManager.isPinEnabled(),
        biometricAuth.isBiometricEnabled(),
        biometricAuth.isAvailable(),
      ]);

      const needsGate = pinEnabled || (bioEnabled && bioAvailable);
      const onVerifyPin = segments[0] === '(auth)' && (segments as string[])[1] === 'verify-pin';
      const onSetupSecurity = segments[0] === '(auth)' && (segments as string[])[1] === 'setup-security';
      const onLogin = segments[0] === '(auth)' && (segments as string[])[1] === 'login';

      if (needsGate && !onVerifyPin && !onSetupSecurity && !inAuth) {
        router.replace('/(auth)/verify-pin');
      } else if (inAuth && onLogin) {
        router.replace('/(tabs)/dashboard');
      }
    })();
  }, [isAuthenticated, isOnboarded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Background → foreground: always re-show verify-pin gate
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const prevState = prevAppStateRef.current;
      prevAppStateRef.current = nextAppState;

      if (prevState.match(/inactive|background/) && nextAppState === 'active') {
        if (!isAuthenticated) return;

        const [pinEnabled, bioEnabled, bioAvailable] = await Promise.all([
          pinManager.isPinEnabled(),
          biometricAuth.isBiometricEnabled(),
          biometricAuth.isAvailable(),
        ]);

        const needsGate = pinEnabled || (bioEnabled && bioAvailable);
        const onVerifyPin = segments[0] === '(auth)' && (segments as string[])[1] === 'verify-pin';
        const onSetupPin = segments[0] === '(auth)' && (segments as string[])[1] === 'setup-pin';
        const onSetupSecurity = segments[0] === '(auth)' && (segments as string[])[1] === 'setup-security';

        if (needsGate && !onVerifyPin && !onSetupPin && !onSetupSecurity) {
          router.replace('/(auth)/verify-pin');
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AppGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="loans" options={{ headerShown: false }} />
          <Stack.Screen name="payments" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
