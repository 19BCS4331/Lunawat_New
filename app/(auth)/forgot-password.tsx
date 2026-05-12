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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { useSendLoginOtpForm } from '@/validation';
import { colors, spacing } from '@/theme';
import type { SendLoginOtpForm } from '@/validation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useSendResetPasswordOtp } from '@/hooks';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useSendLoginOtpForm();
  const sendResetPasswordOtpMutation = useSendResetPasswordOtp();

  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [inputMode, setInputMode] = useState<'mobile' | 'email'>('mobile');

  const onSubmit = async (data: SendLoginOtpForm) => {
    const value = inputMode === 'mobile' ? data.mobileNo : data.email;
    
    if (!value || value.length === 0) {
      const field = inputMode === 'mobile' ? 'mobileNo' : 'email';
      setError(field, { message: inputMode === 'mobile' ? t('loginScreen.enter10DigitNumber') + ' ' : t('loginScreen.enterEmail') + ' ' });
      return;
    }

    // Validate format based on mode
    if (inputMode === 'mobile' && !/^[0-9]{10}$/.test(value)) {
      setError('mobileNo', { message: t('loginScreen.enter10DigitNumber') + ' ' });
      return;
    }

    if (inputMode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('email', { message: t('loginScreen.enterEmail') + ' ' });
      return;
    }

    try {
      const result = await sendResetPasswordOtpMutation.mutateAsync(value);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { 
          mobileNo: value,
          userId: result.userId,
          flow: 'reset-password',
        },
      });
    } catch (error) {
      const field = inputMode === 'mobile' ? 'mobileNo' : 'email';
      const errorMessage = (error as Error).message;
      
      if (errorMessage === 'Invalid User' || errorMessage.includes('Invalid')) {
        setError(field, { message: t('loginScreen.invalidUser') + ' ' });
      } else {
        setError(field, { message: t('forgotPassword.sendOtpFailed') + ' ' });
      }
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleModeChange = (mode: 'mobile' | 'email') => {
    setInputMode(mode);
    reset({ mobileNo: '', email: '' });
  };

  return (
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

          {/* Language Switch Button */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="language-outline" size={18} color={colors.primary.dark} />
            <Text style={styles.langBtnText}>{language.toUpperCase() + ' '}</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
          </TouchableOpacity>

          {/* Header / Brand */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Image source={require('../../assets/SLF_New_Logo_PNG.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.brandName}>S Lunawat Finance   </Text>
            <Text style={styles.brandTagline}>Your Trusted Lending Partner   </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('forgotPassword.title') + ' '}</Text>
            <Text style={styles.cardSubtitle}>{t('forgotPassword.subtitle') + ' '}</Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeOption, inputMode === 'mobile' && styles.modeOptionActive]}
                onPress={() => handleModeChange('mobile')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeOptionText, inputMode === 'mobile' && styles.modeOptionTextActive]}>
                  {t('loginScreen.mobile') + ' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeOption, inputMode === 'email' && styles.modeOptionActive]}
                onPress={() => handleModeChange('email')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeOptionText, inputMode === 'email' && styles.modeOptionTextActive]}>
                  {t('loginScreen.email') + ' '}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mobile Input */}
            {inputMode === 'mobile' && (
              <Controller
                control={control}
                name="mobileNo"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>{t('loginScreen.mobileNumber') + ' '}</Text>
                    <View style={[styles.inputContainer, !!errors.mobileNo && styles.inputContainerError]}>
                      <Text style={styles.inputPrefix}>+91 </Text>
                      <View style={styles.inputDivider} />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('loginScreen.enter10DigitNumber') + ' '}
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        selectionColor={colors.primary.gold}
                      />
                    </View>
                    {!!errors.mobileNo && (
                      <Text style={styles.errorText}>{errors.mobileNo.message} </Text>
                    )}
                  </View>
                )}
              />
            )}

            {/* Email Input */}
            {inputMode === 'email' && (
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>{t('loginScreen.email') + ' '}</Text>
                    <View style={[styles.inputContainer, !!errors.email && styles.inputContainerError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('loginScreen.enterEmail') + ' '}
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        selectionColor={colors.primary.gold}
                      />
                    </View>
                    {!!errors.email && (
                      <Text style={styles.errorText}>{errors.email.message} </Text>
                    )}
                  </View>
                )}
              />
            )}

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.82}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('forgotPassword.sendOtp') + ' '}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {t('loginScreen.securedEncryption') + ' '}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language') + ' '}</Text>
            <View style={styles.langRow}>
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langChip, language === l && styles.langChipActive]}
                  onPress={() => handleLanguageChange(l)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.langChipText, language === l && styles.langChipTextActive]}>
                    {l.toUpperCase() + ' '}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFBF5',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    justifyContent: 'center',
  },

  // Decorative
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

  // Back Button
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },

  // Language Button
  langBtn: {
    position: 'absolute',
    top: spacing[8],
    right: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: '#F5F1E8',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.dark,
  },

  // Header / Brand
  logoImage:{
    width: 76,
    height: 76,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoMark: {
    marginBottom: spacing[4],
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: 0.3,
    marginBottom: spacing[1],
  },
  brandTagline: {
    fontSize: 13,
    color: colors.neutral[500],
    letterSpacing: 0.4,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: '#EDE8D8',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 16,
    marginBottom: spacing[6],
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: spacing[6],
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F1E8',
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing[5],
  },
  modeOption: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: 10,
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  modeOptionTextActive: {
    color: colors.primary.gold,
  },

  // Input
  inputWrapper: {
    marginBottom: spacing[5],
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[500],
    marginBottom: spacing[2],
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    height: 56,
    paddingHorizontal: spacing[4],
  },
  inputContainerFocused: {
    borderColor: colors.primary.gold,
    backgroundColor: '#FFFEF9',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[600],
    marginRight: spacing[2],
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral[300],
    marginRight: spacing[3],
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary.gold,
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: spacing[5],
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.4,
  },

  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.neutral[400],
    letterSpacing: 0.4,
  },

  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing[6],
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
  },
  langChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 12,
    backgroundColor: '#F5F1E8',
    minWidth: 50,
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: colors.primary.gold,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  langChipTextActive: {
    color: colors.white,
  },
});
