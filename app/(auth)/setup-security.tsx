import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useAuthStore } from '@/store';
import { biometricAuth } from '@/utils/biometric';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { useFocusEffect } from 'expo-router';
import { haptics } from '@/utils/haptics';
import { PressableScale } from '@/components/pressable-scale';

export default function SetupSecurityScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPinEnabled = useAuthStore((s) => s.isPinEnabled);
  const isBiometricEnabled = useAuthStore((s) => s.isBiometricEnabled);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const { alert, alertState } = useCustomAlert();

  const [checking, setChecking] = useState(true);
  const [bioAvailable, setBioAvailable] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        if (!isAuthenticated) {
          router.replace('/(auth)/login');
          return;
        }
        const hasBio = await biometricAuth.isAvailable();
        setBioAvailable(hasBio);

        // Only auto-skip if everything possible is already configured:
        // either biometrics is fully set, or PIN is set and no bio is available
        const fullyConfigured =
          (isBiometricEnabled && hasBio) ||
          (isPinEnabled && !hasBio);
        if (fullyConfigured) {
          router.replace('/(tabs)/dashboard');
          return;
        }

        setChecking(false);
      })();
    }, [isAuthenticated, isPinEnabled, isBiometricEnabled, router]),
  );

  const handleSetupPin = () => {
    router.push('/(auth)/setup-pin');
  };

  const handleEnableBiometric = async () => {
    if (!bioAvailable) {
      alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    try {
      const result = await biometricAuth.authenticate('Authenticate to enable biometric lock');
      if (result.success) {
        await biometricAuth.setBiometricEnabled(true);
        setBiometricEnabled(true);
        alert('Enabled', 'Biometric authentication has been enabled.', [
          { text: 'Continue', onPress: () => router.replace('/(tabs)/dashboard') },
        ]);
      } else {
        alert('Failed', result.error || 'Biometric authentication failed.');
      }
    } catch {
      alert('Error', 'Something went wrong. Please try again.');
    }
  };

  if (checking) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={40} color={colors.white} />
          </View>
          <Text style={styles.title}>  Secure Your Account  </Text>
          <Text style={styles.subtitle}>
            Add an extra layer of protection to keep your financial data safe.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* PIN Option — show as done if already set */}
          {isPinEnabled ? (
            <View style={[styles.optionCard, styles.optionCardDone]}>
              <View style={[styles.optionIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>PIN Set Up  </Text>
                <Text style={styles.optionBody}>Your 4-digit PIN is active.</Text>
              </View>
              <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
            </View>
          ) : (
            <PressableScale scale={0.98} style={styles.optionCard} onPress={() => { haptics.light(); handleSetupPin(); }}>
              <View style={[styles.optionIconWrap, { backgroundColor: '#FFF8E7' }]}>
                <Ionicons name="keypad" size={24} color={colors.primary.gold} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Set Up PIN  </Text>
                <Text style={styles.optionBody}>Use a 4-digit PIN to unlock the app quickly.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </PressableScale>
          )}

          {/* Biometric Option */}
          <PressableScale
            scale={0.98}
            style={[styles.optionCard, (!bioAvailable || !isPinEnabled) && styles.optionCardDisabled]}
            onPress={() => { haptics.light(); void handleEnableBiometric(); }}
            disabled={!bioAvailable || !isPinEnabled}
          >
            <View style={[styles.optionIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="finger-print" size={24} color="#4CAF50" />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Enable Biometric  </Text>
              <Text style={styles.optionBody}>
                {!bioAvailable
                  ? 'Biometric authentication is not available on this device.'
                  : !isPinEnabled
                  ? 'Set up a PIN first before enabling biometrics.'
                  : 'Use fingerprint or face recognition to unlock.'}
              </Text>
            </View>
            <Ionicons
              name={(!bioAvailable || !isPinEnabled) ? 'lock-closed' : 'chevron-forward'}
              size={20}
              color={(!bioAvailable || !isPinEnabled) ? colors.neutral[400] : colors.neutral[300]}
            />
          </PressableScale>
        </View>

        {/* Skip — only available after PIN is set */}
        {isPinEnabled && (
          <PressableScale scale={0.95} style={styles.skipBtn} onPress={() => { haptics.light(); router.replace('/(tabs)/dashboard'); }}>
            <Text style={styles.skipText}>Skip for now  </Text>
          </PressableScale>
        )}
      </View>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF5',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  options: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: '#EDE8D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  optionCardDisabled: {
    opacity: 0.7,
  },
  optionCardDone: {
    borderColor: '#A5D6A7',
    backgroundColor: '#F9FFF9',
  },
  optionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  optionBody: {
    fontSize: 13,
    color: colors.neutral[500],
    lineHeight: 18,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[400],
  },
});
