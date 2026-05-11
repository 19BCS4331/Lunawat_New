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
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { pinManager } from '@/utils/pin';
import { useAuthStore } from '@/store';
import { useCustomAlert, CustomAlert } from '@/components/alert';

const PIN_LENGTH = 4;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

type Step = 'enter' | 'confirm';

export default function SetupPinScreen() {
  const router = useRouter();
  const setPinEnabled = useAuthStore((s) => s.setPinEnabled);
  const { alert, alertState } = useCustomAlert();

  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKey = useCallback((key: string) => {
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
        // Auto-advance after slight delay so last dot fills in visually
        setTimeout(() => handleComplete(next), 120);
      }
      return next;
    });
  }, [step, firstPin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async (enteredPin: string) => {
    if (step === 'enter') {
      setFirstPin(enteredPin);
      setPin('');
      setStep('confirm');
      return;
    }

    // Confirm step
    if (enteredPin !== firstPin) {
      Vibration.vibrate(400);
      setError('PINs do not match. Please try again.');
      setPin('');
      setStep('enter');
      setFirstPin('');
      return;
    }

    setLoading(true);
    try {
      const success = await pinManager.setupPin(enteredPin);
      if (success) {
        setPinEnabled(true);
        alert('PIN Set', 'Your PIN has been set successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        setError('Failed to save PIN. Please try again.');
        setPin('');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  }, [step, firstPin, setPinEnabled, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={36} color={colors.white} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{step === 'enter' ? 'Create PIN' : 'Confirm PIN'}</Text>
        <Text style={styles.subtitle}>
          {step === 'enter'
            ? 'Enter a 4-digit PIN to secure your app'
            : 'Re-enter your PIN to confirm'}
        </Text>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step === 'enter' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
        </View>

        {/* PIN dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < pin.length && styles.dotFilled]}
            />
          ))}
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={14} color="#B71C1C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Keypad */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.gold} style={{ marginTop: spacing[8] }} />
        ) : (
          <View style={styles.keypad}>
            {KEYS.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.key, key === '' && styles.keyEmpty]}
                    onPress={() => handleKey(key)}
                    activeOpacity={key === '' ? 1 : 0.65}
                    disabled={key === ''}
                  >
                    {key === '⌫' ? (
                      <Ionicons name="backspace-outline" size={22} color={colors.neutral[700]} />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F1E8', justifyContent: 'center', alignItems: 'center' },

  body: { flex: 1, alignItems: 'center', paddingTop: spacing[6], paddingHorizontal: spacing[6] },

  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[5],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.neutral[900], marginBottom: spacing[1] },
  subtitle: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: spacing[4] },

  stepRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[6] },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.neutral[200] },
  stepDotActive: { backgroundColor: colors.primary.gold, width: 24 },

  dotsRow: { flexDirection: 'row', gap: spacing[4], marginBottom: spacing[3] },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: colors.neutral[300],
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: colors.primary.gold, borderColor: colors.primary.gold },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[2] },
  errorText: { fontSize: 13, color: '#B71C1C' },

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
});
