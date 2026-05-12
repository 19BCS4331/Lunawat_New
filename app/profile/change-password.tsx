import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button, Input } from '@/components';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radii } from '@/theme';
import { useSendResetPasswordOtp, useChangePassword } from '@/hooks';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const sendOTP = useSendResetPasswordOtp();
  const changePassword = useChangePassword();
  const { alert, alertState } = useCustomAlert();

  const [step, setStep] = useState<'send-otp' | 'verify-otp' | 'new-password'>('send-otp');
  const [mobileNo, setMobileNo] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async () => {
    if (!mobileNo || mobileNo.length !== 10) {
      alert(t('changePassword.alertInvalidMobile') + ' ', t('changePassword.alertInvalidMobileBody') + ' ');
      return;
    }

    try {
      await sendOTP.mutateAsync(mobileNo);
      setStep('verify-otp');
    } catch (error) {
      alert(t('changePassword.alertSendOtpFailed'), t('changePassword.alertSendOtpFailedBody'));
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert(t('changePassword.alertInvalidOtp'), t('changePassword.alertInvalidOtpBody'));
      return;
    }

    try {
      // OTP verification happens implicitly during password reset
      setStep('new-password');
    } catch (error) {
      alert(t('changePassword.alertOtpInvalid'), t('changePassword.alertOtpInvalidBody'));
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert(t('changePassword.alertPasswordLength'), t('changePassword.alertPasswordLengthBody'));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t('changePassword.alertPasswordMismatch'), t('changePassword.alertPasswordMismatchBody'));
      return;
    }

    try {
      await changePassword.mutateAsync({
        oldPassword: otp,
        newPassword,
      });
      alert(t('changePassword.alertSuccess'), t('changePassword.alertSuccessBody'), [
        { text: t('changePassword.alertOk'), onPress: () => router.back() }
      ]);
    } catch (error) {
      alert(t('changePassword.alertChangeFailed'), t('changePassword.alertChangeFailedBody'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Decorative circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={36} color={colors.white} />
          </View>
          <Text style={styles.title}>{t('changePassword.title') + ' '}  </Text>
          <Text style={styles.subtitle}>{t('changePassword.subtitle') + ' '}  </Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step === 'send-otp' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'verify-otp' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'new-password' && styles.stepDotActive]} />
        </View>

        {step === 'send-otp' && (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.stepTitle}>{t('changePassword.step1Title')}  </Text>
            <Input
              label={t('changePassword.mobileNumber')}
              placeholder={t('changePassword.mobileNumberPlaceholder')}
              value={mobileNo}
              onChangeText={setMobileNo}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Button
              title={t('changePassword.sendOtp') + ' '}
              onPress={handleSendOTP}
              loading={sendOTP.isPending}
              style={{ marginTop: spacing[4] }}
            />
          </Card>
        )}

        {step === 'verify-otp' && (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.stepTitle}>{t('changePassword.step2Title')}  </Text>
            <Text style={styles.infoText}>
              {t('changePassword.otpSentTo', { mobile: mobileNo })}
            </Text>
            <Input
              label={t('changePassword.otp')}
              placeholder={t('changePassword.otpPlaceholder')}
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            <Button
              title={t('changePassword.verifyOtp') + ' '}
              onPress={handleVerifyOTP}
              loading={false}
              style={{ marginTop: spacing[4] }}
            />
            <TouchableOpacity
              onPress={() => setStep('send-otp')}
              style={styles.linkBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>{t('changePassword.changeMobileNumber') + ' '}  </Text>
            </TouchableOpacity>
          </Card>
        )}

        {step === 'new-password' && (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.stepTitle}>{t('changePassword.step3Title')}  </Text>
            <Input
              label={t('changePassword.newPassword')}
              placeholder={t('changePassword.newPasswordPlaceholder')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Input
              label={t('changePassword.confirmPassword')}
              placeholder={t('changePassword.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <Button
              title={t('changePassword.changePasswordBtn') + '  '}
              onPress={handleChangePassword}
              loading={changePassword.isPending}
              style={{ marginTop: spacing[4] }}
            />
          </Card>
        )}
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
  },
  circleTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.primary.gold,
    opacity: 0.12,
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary.orange,
    opacity: 0.07,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    marginBottom: spacing[4],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
    justifyContent: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },
  stepDotActive: {
    backgroundColor: colors.primary.gold,
    width: 24,
  },
  card: {
    marginBottom: spacing[6],
    padding: spacing[5],
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#EDE8D8',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  infoText: {
    fontSize: 14,
    color: colors.neutral[600],
    marginBottom: spacing[4],
  },
  linkBtn: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.primary.gold,
    fontWeight: '600',
  },
});
