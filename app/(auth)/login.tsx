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
import { useSendLoginOtp } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, reset } = useSendLoginOtpForm();
  const [focused, setFocused] = useState(false);
  const sendOtpMutation = useSendLoginOtp();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [inputMode, setInputMode] = useState<'mobile' | 'email'>('mobile');

  const onSubmit = async (data: SendLoginOtpForm) => {
    const value = inputMode === 'mobile' ? data.mobileNo : data.email;
    
    if (!value || value.length === 0) {
      const field = inputMode === 'mobile' ? 'mobileNo' : 'email';
      setError(field, { message: inputMode === 'mobile' ? t('loginScreen.enter10DigitNumber') : t('loginScreen.enterEmail') });
      return;
    }

    // Validate format based on mode
    if (inputMode === 'mobile' && !/^[0-9]{10}$/.test(value)) {
      setError('mobileNo', { message: t('loginScreen.enter10DigitNumber') });
      return;
    }

    if (inputMode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('email', { message: t('loginScreen.enterEmail') });
      return;
    }

    try {
      await sendOtpMutation.mutateAsync(value);
      router.push({ pathname: '/(auth)/otp-login', params: { mobileNo: value } });
    } catch (error) {
      const field = inputMode === 'mobile' ? 'mobileNo' : 'email';
      const errorMessage = (error as Error).message;
      
      if (errorMessage === 'Invalid User' || errorMessage.includes('Invalid')) {
        setError(field, { message: t('loginScreen.invalidUser') });
      } else {
        setError(field, { message: t('loginScreen.sendOtpFailed') });
      }
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleModeChange = (mode: 'mobile' | 'email') => {
    setInputMode(mode);
    // Clear both inputs when switching modes
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
            <Text style={styles.langBtnText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>

          {/* Header / Brand */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Image source={require('../../assets/SLF_New_Logo_PNG.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.brandName}>S Lunawat Finance</Text>
            <Text style={styles.brandTagline}>Your Trusted Lending Partner</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('loginScreen.welcomeBack')}</Text>
            <Text style={styles.cardSubtitle}>
              {inputMode === 'mobile' ? t('loginScreen.enterMobile') : t('loginScreen.enterEmail')}
            </Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeOption, inputMode === 'mobile' && styles.modeOptionActive]}
                onPress={() => handleModeChange('mobile')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeOptionText, inputMode === 'mobile' && styles.modeOptionTextActive]}>
                  {t('loginScreen.mobile')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeOption, inputMode === 'email' && styles.modeOptionActive]}
                onPress={() => handleModeChange('email')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeOptionText, inputMode === 'email' && styles.modeOptionTextActive]}>
                  {t('loginScreen.email')}
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
                    <Text style={styles.inputLabel}>{t('loginScreen.mobileNumber')}</Text>
                    <View style={[styles.inputContainer, focused && styles.inputContainerFocused, !!errors.mobileNo && styles.inputContainerError]}>
                      <Text style={styles.inputPrefix}>+91</Text>
                      <View style={styles.inputDivider} />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('loginScreen.enter10DigitNumber')}
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => { setFocused(false); onBlur(); }}
                        selectionColor={colors.primary.gold}
                      />
                    </View>
                    {!!errors.mobileNo && (
                      <Text style={styles.errorText}>{errors.mobileNo.message}</Text>
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
                    <Text style={styles.inputLabel}>{t('loginScreen.email')}</Text>
                    <View style={[styles.inputContainer, focused && styles.inputContainerFocused, !!errors.email && styles.inputContainerError]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('loginScreen.enterEmail')}
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => { setFocused(false); onBlur(); }}
                        selectionColor={colors.primary.gold}
                      />
                    </View>
                    {!!errors.email && (
                      <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />
            )}

            {/* OTP Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.82}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>{t('loginScreen.sendOtp')}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('loginScreen.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Password Login */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/password-login')}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryButtonText}>{t('loginScreen.loginWithPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {t('loginScreen.securedEncryption')}
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
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            <View style={styles.langRow}>
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langChip, language === l && styles.langChipActive]}
                  onPress={() => handleLanguageChange(l)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.langChipText, language === l && styles.langChipTextActive]}>
                    {l.toUpperCase()}
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
    // width: 76,
    // height: 76,
    // borderRadius: 22,
    // backgroundColor: colors.primary.gold,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginBottom: spacing[4],
    // shadowColor: colors.primary.gold,
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.45,
    // shadowRadius: 20,
    // elevation: 14,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.dark,
    marginRight: spacing[2],
  },
  inputDivider: {
    width: 1.5,
    height: 22,
    backgroundColor: colors.neutral[200],
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

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    fontSize: 13,
    color: colors.neutral[400],
    marginHorizontal: spacing[3],
  },

  secondaryButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary.gold,
    backgroundColor: colors.primary.light,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.dark,
    letterSpacing: 0.2,
  },

  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.neutral[400],
    letterSpacing: 0.4,
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
