import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { pinManager } from '@/utils/pin';
import { biometricAuth } from '@/utils/biometric';
import { useCustomAlert, CustomAlert } from '@/components/alert';

const PIN_LENGTH = 4;

// Rows when biometric is also available
const KEYS_WITH_BIO = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['bio', '0', '⌫'],
];

// Rows when only PIN (no bio key shown, empty placeholder instead)
const KEYS_PIN_ONLY = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

type AuthMode =
  | 'loading'      // Determining what's available — show spinner
  | 'bio-only'     // Only biometrics enabled — no keypad, just bio button
  | 'pin-only'     // Only PIN enabled — no bio button
  | 'pin-and-bio'; // Both enabled — show keypad + bio button

export default function VerifyPinScreen() {
  const router = useRouter();
  const { alert, alertState } = useCustomAlert();

  const [mode, setMode] = useState<AuthMode>('loading');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [bioError, setBioError] = useState('');

  const triggerBiometric = useCallback(async () => {
    setBioError('');
    const result = await biometricAuth.authenticate('Verify your identity to continue');
    if (result.success) {
      router.replace('/(tabs)/dashboard');
    } else if (result.error && result.error !== 'UserCancel' && result.error !== 'user_cancel') {
      setBioError('Biometric failed. Try again or use your PIN.');
    }
  }, [router]);

  useEffect(() => {
    void (async () => {
      const [attempts, available, bioEnabled, pinEnabled] = await Promise.all([
        pinManager.getRemainingAttempts(),
        biometricAuth.isAvailable(),
        biometricAuth.isBiometricEnabled(),
        pinManager.isPinEnabled(),
      ]);

      setRemainingAttempts(attempts);

      const bioReady = available && bioEnabled;

      if (pinEnabled) {
        setMode(bioReady ? 'pin-and-bio' : 'pin-only');
      } else if (bioReady) {
        setMode('bio-only');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async (enteredPin: string) => {
    setVerifying(true);
    try {
      const success = await pinManager.verifyPin(enteredPin);
      if (success) {
        router.replace('/(tabs)/dashboard');
      } else {
        Vibration.vibrate(400);
        const attempts = await pinManager.getRemainingAttempts();
        setRemainingAttempts(attempts);
        if (attempts <= 0) {
          alert(
            'Too Many Attempts',
            'Your PIN has been cleared for security. Please log in again.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
          );
        } else {
          setError(`Incorrect PIN. ${attempts} attempt${attempts === 1 ? '' : 's'} remaining.`);
          setPin('');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
      setPin('');
    } finally {
      setVerifying(false);
    }
  }, [router, alert]);

  const handleKey = useCallback((key: string) => {
    if (key === 'bio') { void triggerBiometric(); return; }
    if (key === '') return;
    setError('');

    if (key === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }

    setPin((p) => {
      if (p.length >= PIN_LENGTH) return p;
      const next = p + key;
      if (next.length === PIN_LENGTH) {
        setTimeout(() => handleComplete(next), 120);
      }
      return next;
    });
  }, [triggerBiometric, handleComplete]);

  // ── Loading state — fully opaque, no UI flash ──
  if (mode === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Bio-only mode — fingerprint prompt, no keypad ──
  if (mode === 'bio-only') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <Ionicons name="finger-print" size={40} color={colors.white} />
          </View>
          <Text style={styles.title}>Verify Identity   </Text>
          <Text style={styles.subtitle}>Tap the button below to authenticate</Text>

          {!!bioError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={14} color="#B71C1C" />
              <Text style={styles.errorText}>{bioError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.bioBtn}
            onPress={() => void triggerBiometric()}
            activeOpacity={0.8}
          >
            <Ionicons name="finger-print" size={28} color={colors.white} />
            <Text style={styles.bioBtnText}>Use Biometrics  </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Use a different account</Text>
          </TouchableOpacity>
        </View>
        {alertState && <CustomAlert {...alertState} />}
      </SafeAreaView>
    );
  }

  // ── PIN mode (pin-only or pin-and-bio) ──
  const keys = mode === 'pin-and-bio' ? KEYS_WITH_BIO : KEYS_PIN_ONLY;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={36} color={colors.white} />
        </View>

        <Text style={styles.title}>Enter PIN  </Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>

        {/* Error / attempts */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={14} color="#B71C1C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!error && remainingAttempts < 5 && (
          <Text style={styles.attemptsText}>{remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining</Text>
        )}
        {!!bioError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={14} color="#B71C1C" />
            <Text style={styles.errorText}>{bioError}</Text>
          </View>
        )}

        {/* Keypad */}
        {verifying ? (
          <ActivityIndicator size="large" color={colors.primary.gold} style={{ marginTop: spacing[8] }} />
        ) : (
          <View style={styles.keypad}>
            {keys.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => {
                  const isBio = key === 'bio';
                  const isEmpty = key === '';
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[styles.key, isEmpty && styles.keyEmpty]}
                      onPress={() => handleKey(key)}
                      activeOpacity={isEmpty ? 1 : 0.65}
                      disabled={isEmpty}
                    >
                      {key === '⌫' ? (
                        <Ionicons name="backspace-outline" size={22} color={colors.neutral[700]} />
                      ) : isBio ? (
                        <Ionicons name="finger-print" size={26} color={colors.primary.gold} />
                      ) : !isEmpty ? (
                        <Text style={styles.keyText}>{key}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Use a different account</Text>
        </TouchableOpacity>
      </View>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6] },

  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[5],
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.neutral[900], marginBottom: spacing[1] },
  subtitle: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: spacing[6] },

  dotsRow: { flexDirection: 'row', gap: spacing[4], marginBottom: spacing[3] },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: colors.neutral[300],
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: colors.primary.dark, borderColor: colors.primary.dark },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[2] },
  errorText: { fontSize: 13, color: '#B71C1C' },
  attemptsText: { fontSize: 12, color: colors.neutral[400], marginBottom: spacing[2] },

  keypad: { marginTop: spacing[6], width: '100%', maxWidth: 300 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  keyText: { fontSize: 22, fontWeight: '700', color: colors.neutral[900] },

  bioBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing[8], paddingVertical: spacing[4],
    borderRadius: 16, marginTop: spacing[6],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  bioBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },

  logoutBtn: { marginTop: spacing[8] },
  logoutText: { fontSize: 13, color: colors.neutral[400], textDecorationLine: 'underline' },
});
