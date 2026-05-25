import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { useLoginWithOtpForm } from '@/validation';
import { colors, spacing } from '@/theme';
import { useLoginWithOtp, useSendLoginOtp } from '@/hooks';
import { useAuthStore } from '@/store';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/utils/haptics';
import { PressableScale } from '@/components/pressable-scale';

export default function OtpLoginScreen() {
  const router = useRouter();
  const { mobileNo } = useLocalSearchParams<{ mobileNo: string }>();
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useLoginWithOtpForm(mobileNo ?? '');
  const loginWithOtpMutation = useLoginWithOtp();
  const resendOtpMutation = useSendLoginOtp();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { alert, alertState } = useCustomAlert();

  const onSubmit = async () => {
    if (!mobileNo) return;
    handleSubmit(async (data) => {
      try {
        const result = await loginWithOtpMutation.mutateAsync({
          email: data.mobileNo,  // API uses "Email" field for mobile number
          otp: data.otp,
        });
        setAuth(result.accessToken, result.userId);
        router.replace('/(auth)/setup-security');
      } catch {
        setError('otp', { message: 'Invalid OTP. Please try again.' });
      }
    })();
  };

  const handleResend = async () => {
    if (!mobileNo) return;
    try {
      await resendOtpMutation.mutateAsync(mobileNo);
      alert('OTP Sent', `OTP resent to +91 ${mobileNo}`);
    } catch {
      alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#FFF9F0', '#FDFBF5', '#FFF8E7']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative circles */}
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Image source={require('../../assets/SLF_New_Logo_PNG.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.brandName}>S Lunawat Finance   </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back  </Text>
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Verify OTP  </Text>
            <Text style={styles.cardSubtitle}>
              Enter the OTP sent to{'\n'}
              <Text style={styles.mobileHighlight}>+91 {mobileNo} </Text>
            </Text>

            {/* OTP Input */}
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>One-Time Password  </Text>
                  <View style={[
                    styles.inputContainer,
                    !!errors.otp && styles.inputContainerError,
                  ]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.neutral[400]}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      selectionColor={colors.primary.gold}
                    />
                  </View>
                  {!!errors.otp && (
                    <Text style={styles.errorText}>{errors.otp.message} </Text>
                  )}
                </View>
              )}
            />

            {/* Verify Button */}
            <PressableScale
              scale={0.97}
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={() => { haptics.medium(); onSubmit(); }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Verify & Login  </Text>
              )}
            </PressableScale>

            {/* Resend */}
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendOtpMutation.isPending}
              activeOpacity={0.7}
              style={styles.resendButton}
            >
              {resendOtpMutation.isPending ? (
                <ActivityIndicator color={colors.primary.gold} size="small" />
              ) : (
                <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink}>Resend OTP  </Text></Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>Secured with 256-bit encryption  </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    justifyContent: 'center',
  },
  circleTopRight: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: colors.primary.gold, opacity: 0.12,
  },
  circleBottomLeft: {
    position: 'absolute', bottom: 20, left: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: colors.primary.orange, opacity: 0.07,
  },
  header: { alignItems: 'center', marginBottom: spacing[8] },
  logoImage:{
    width: 76,
    height: 76,
  },
  logoMark: {
    marginBottom: spacing[4],
  },
  logoLetter: { fontSize: 28, fontWeight: '800', color: colors.white, letterSpacing: 1 },
  brandName: { fontSize: 22, fontWeight: '800', color: colors.neutral[900], letterSpacing: 0.3 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28, padding: spacing[6],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12, shadowRadius: 28, elevation: 16,
    marginBottom: spacing[6],
  },
  backButton: { marginBottom: spacing[4] },
  backText: { fontSize: 15, color: colors.primary.gold, fontWeight: '600' },
  cardTitle: { fontSize: 24, fontWeight: '700', color: colors.neutral[900], marginBottom: spacing[1] },
  cardSubtitle: { fontSize: 14, color: colors.neutral[500], marginBottom: spacing[6], lineHeight: 22 },
  mobileHighlight: { fontWeight: '700', color: colors.neutral[900] },
  inputWrapper: { marginBottom: spacing[5] },
  inputLabel: {
    fontSize: 12, fontWeight: '700', color: colors.neutral[500],
    marginBottom: spacing[2], letterSpacing: 0.8, textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDFBF5', borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.neutral[200],
    height: 56, paddingHorizontal: spacing[4],
  },
  inputContainerFocused: {
    borderColor: colors.primary.gold, backgroundColor: '#FFFEF9',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  inputContainerError: { borderColor: colors.error },
  textInput: { flex: 1, fontSize: 20, color: colors.neutral[900], fontWeight: '600', letterSpacing: 6 },
  errorText: { fontSize: 12, color: colors.error, marginTop: spacing[1], marginLeft: spacing[1] },
  primaryButton: {
    backgroundColor: colors.primary.gold,
    borderRadius: 14, height: 56,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
    marginBottom: spacing[4],
  },
  primaryButtonDisabled: { opacity: 0.65 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: colors.white, letterSpacing: 0.4 },
  resendButton: { alignItems: 'center', paddingVertical: spacing[2] },
  resendText: { fontSize: 14, color: colors.neutral[500] },
  resendLink: { fontWeight: '700', color: colors.primary.gold },
  footerText: { textAlign: 'center', fontSize: 12, color: colors.neutral[400], letterSpacing: 0.4 },
});
