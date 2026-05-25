import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/theme';
import { useBiometric, usePin } from '@/hooks';
import { mmkvStorage, secureStorage } from '@/utils';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { queryClient } from '@/hooks/query-client';
import { Ionicons } from '@expo/vector-icons';
import { biometricAuth } from '@/utils/biometric';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { useFocusEffect } from 'expo-router';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function SettingRow({
  icon, iconBg, title, subtitle, right, onPress, divider = true,
}: {
  icon: IoniconName; iconBg: string; title: string; subtitle?: string;
  right: React.ReactNode; onPress?: () => void; divider?: boolean;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <>
      <Wrapper style={s.row} onPress={onPress} activeOpacity={0.7}>
        <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={colors.white} />
        </View>
        <View style={s.rowText}>
          <Text style={s.rowTitle}>{title}  </Text>
          {!!subtitle && <Text style={s.rowSubtitle}>{subtitle}</Text>}
        </View>
        {right}
      </Wrapper>
      {divider && <View style={s.divider} />}
    </>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);
  const setPinEnabled = useAuthStore((s) => s.setPinEnabled);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const { alert, alertState } = useCustomAlert();

  const { isBiometricEnabled, toggleBiometric, checkAvailability, isAvailable, biometricType } = useBiometric();
  const { isPinEnabled, disablePin, refreshStatus: refreshPin } = usePin();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
    void (async () => {
      const notif = await mmkvStorage.getItem('notifications_enabled');
      if (notif !== undefined) setNotificationsEnabled(notif !== 'false');
    })();
  }, [checkAvailability]);

  useFocusEffect(
    useCallback(() => {
      void refreshPin();
    }, [refreshPin]),
  );

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    void mmkvStorage.setItem('notifications_enabled', value.toString());
  };

  const handleBiometricToggle = async () => {
    if (!isAvailable) {
      alert(t('settings.alertUnavailableTitle'), t('settings.alertUnavailableBody'));
      return;
    }
    const next = !isBiometricEnabled;
    if (next && !isPinEnabled) {
      alert('PIN Required', 'Please set up a PIN before enabling biometrics. This ensures you can always access the app if biometrics fails.');
      return;
    }
    setBioLoading(true);
    try {
      if (next) {
        const result = await biometricAuth.authenticate(t('settings.biometricPrompt'));
        if (!result.success) {
          alert(t('settings.alertAuthFailedTitle'), t('settings.alertAuthFailedBody'));
          setBioLoading(false);
          return;
        }
      }
      await toggleBiometric(next);
      setBiometricEnabled(next);
    } catch {
      alert(t('settings.alertErrorTitle'), t('settings.alertErrorBody'));
    } finally {
      setBioLoading(false);
    }
  };

  const handlePinToggle = async () => {
    if (isPinEnabled) {
      alert(t('settings.alertDisablePinTitle'), t('settings.alertDisablePinBody'), [
        { text: t('settings.alertCancel'), style: 'cancel' },
        {
          text: t('settings.alertDisable'), style: 'destructive',
          onPress: async () => {
            await disablePin();
            setPinEnabled(false);
            await refreshPin();
          },
        },
      ]);
    } else {
      router.push('/(auth)/setup-pin');
    }
  };

  const handleLogout = () => {
    alert(t('settings.alertLogoutTitle'), t('settings.alertLogoutBody'), [
      { text: t('settings.alertCancel'), style: 'cancel' },
      {
        text: t('settings.logout'), style: 'destructive',
        onPress: async () => {
          await secureStorage.deleteItem('access_token');
          await secureStorage.deleteItem('user_id');
          clearAuth();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const bioName = biometricAuth.getBiometricName(biometricType);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('settings.title')}  </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Preferences */}
        <Text style={s.sectionLabel}>{t('settings.preferences')}  </Text>
        <View style={s.card}>
          <SettingRow
            icon="language-outline" iconBg="#6366F1"
            title={t('settings.language')}
            subtitle={t('settings.languageSubtitle')}
            right={
              <View style={s.langRow}>
                {(['en', 'hi', 'mr'] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[s.langChip, language === l && s.langChipActive]}
                    onPress={() => handleLanguageChange(l)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.langChipText, language === l && s.langChipTextActive]}>
                      {l.toUpperCase() + ' '}  
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
          <SettingRow
            icon="notifications-outline" iconBg="#F59E0B"
            title={t('settings.notifications')}
            subtitle={t('settings.notificationsSubtitle')}
            divider={false}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.neutral[200], true: colors.primary.gold }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        {/* Security */}
        <Text style={s.sectionLabel}>{t('settings.security')}  </Text>
        <View style={s.card}>
          <SettingRow
            icon="finger-print" iconBg={isAvailable ? colors.primary.dark : colors.neutral[400]}
            title={isAvailable ? `${bioName} ${t('settings.biometricLogin')}` : t('settings.biometricLogin')}
            subtitle={isAvailable ? t('settings.biometricSubtitle') : t('settings.biometricUnavailable')}
            right={
              bioLoading
                ? <ActivityIndicator size="small" color={colors.primary.gold} />
                : (
                  <Switch
                    value={isBiometricEnabled}
                    onValueChange={handleBiometricToggle}
                    disabled={!isAvailable}
                    trackColor={{ false: colors.neutral[200], true: colors.primary.gold }}
                    thumbColor={colors.white}
                  />
                )
            }
          />
          <SettingRow
            icon="keypad-outline" iconBg={isPinEnabled ? '#10B981' : colors.neutral[400]}
            title={t('settings.pinLock')}
            subtitle={isPinEnabled ? t('settings.pinActive') : t('settings.pinInactive')}
            divider={false}
            right={
              <View style={s.pinRight}>
                {isPinEnabled && (
                  <View style={s.pinBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                    <Text style={s.pinBadgeText}>{t('settings.pinBadgeOn')}  </Text>
                  </View>
                )}
                <Switch
                  value={isPinEnabled}
                  onValueChange={handlePinToggle}
                  trackColor={{ false: colors.neutral[200], true: '#10B981' }}
                  thumbColor={colors.white}
                />
              </View>
            }
          />
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>{t('settings.account')}  </Text>
        <View style={s.card}>
          <SettingRow
            icon="key-outline" iconBg="#8B5CF6"
            title={t('settings.changePassword')} subtitle={t('settings.changePasswordSubtitle')}
            divider={false}
            onPress={() => router.push('/profile/change-password')}
            right={<Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />}
          />
        </View>

        {/* Legal & Support */}
        <Text style={s.sectionLabel}>{t('settings.legal')}  </Text>
        <View style={s.card}>
          <SettingRow
            icon="shield-checkmark-outline" iconBg="#0EA5E9"
            title={t('settings.privacyPolicy')}
            subtitle={t('settings.privacyPolicySubtitle')}
            onPress={() => void Linking.openURL('https://slunawat.com/home/privacypolicy')}
            right={<Ionicons name="open-outline" size={16} color={colors.neutral[400]} />}
          />
          <SettingRow
            icon="document-text-outline" iconBg="#6366F1"
            title={t('settings.termsConditions')}
            subtitle={t('settings.termsConditionsSubtitle')}
            onPress={() => void Linking.openURL('https://slunawat.com/home/terms')}
            right={<Ionicons name="open-outline" size={16} color={colors.neutral[400]} />}
          />
          <SettingRow
            icon="headset-outline" iconBg="#10B981"
            title={t('settings.support')}
            subtitle={t('settings.supportSubtitle')}
            divider={false}
            onPress={() => void Linking.openURL('https://slunawat.com/home/contact')}
            right={<Ionicons name="open-outline" size={16} color={colors.neutral[400]} />}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={s.logoutText}>{t('settings.logout')}  </Text>
        </TouchableOpacity>

        <View style={{ height: spacing[8] }} />
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  scroll: { paddingHorizontal: spacing[5] },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[4] },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F1E8', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral[900] },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.neutral[400], letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing[5], marginBottom: spacing[2] },

  card: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: '#EDE8D8',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    marginBottom: spacing[1],
  },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4], gap: spacing[3] },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.neutral[900] },
  rowSubtitle: { fontSize: 12, color: colors.neutral[400], marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F5F1E8', marginLeft: spacing[4] + 36 + spacing[3] },

  langRow: { flexDirection: 'row', gap: spacing[1] },
  langChip: { paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: 8, backgroundColor: '#F5F1E8' },
  langChipActive: { backgroundColor: colors.primary.gold },
  langChipText: { fontSize: 11, fontWeight: '700', color: colors.neutral[600] },
  langChipTextActive: { color: colors.white },

  pinRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  pinBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#D1FAE5', paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: 8 },
  pinBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2],
    marginTop: spacing[5], backgroundColor: '#FEF2F2',
    borderRadius: 16, paddingVertical: spacing[4],
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
