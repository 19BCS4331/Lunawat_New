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

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['bio', '0', '⌫'],
];

export default function VerifyPinScreen() {
  const router = useRouter();
  const { alert, alertState } = useCustomAlert();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const [attempts, available, bioEnabled] = await Promise.all([
        pinManager.getRemainingAttempts(),
        biometricAuth.isAvailable(),
        biometricAuth.isBiometricEnabled(),
      ]);
      setRemainingAttempts(attempts);
      setBiometricAvailable(available && bioEnabled);
      // Auto-prompt biometric on open if available
      if (available && bioEnabled) {
        triggerBiometric();
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerBiometric = useCallback(async () => {
    const result = await biometricAuth.authenticate('Verify your identity to continue');
    if (result.success) {
      router.replace('/(tabs)/dashboard');
    }
  }, [router]);

  const handleComplete = useCallback(async (enteredPin: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [router]);

  const handleKey = useCallback((key: string) => {
    if (key === 'bio') { triggerBiometric(); return; }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        {/* Icon */}
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

        {/* Keypad */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.gold} style={{ marginTop: spacing[8] }} />
        ) : (
          <View style={styles.keypad}>
            {KEYS.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => {
                  const isBio = key === 'bio';
                  const isEmpty = key === '';
                  const showBio = isBio && biometricAvailable;
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[styles.key, (isEmpty || (isBio && !biometricAvailable)) && styles.keyEmpty]}
                      onPress={() => handleKey(key)}
                      activeOpacity={(isEmpty || (isBio && !biometricAvailable)) ? 1 : 0.65}
                      disabled={isEmpty || (isBio && !biometricAvailable)}
                    >
                      {key === '⌫' ? (
                        <Ionicons name="backspace-outline" size={22} color={colors.neutral[700]} />
                      ) : showBio ? (
                        <Ionicons name="finger-print" size={26} color={colors.primary.gold} />
                      ) : !isBio && !isEmpty ? (
                        <Text style={styles.keyText}>{key}  </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Logout link */}
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

  logoutBtn: { marginTop: spacing[8] },
  logoutText: { fontSize: 13, color: colors.neutral[400], textDecorationLine: 'underline' },
});
