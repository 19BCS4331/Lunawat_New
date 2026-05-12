import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useProfile } from '@/hooks';
import { useAuthStore } from '@/store';
import { secureStorage } from '@/utils';
import { queryClient } from '@/hooks/query-client';
import { useCustomAlert, CustomAlert } from '@/components/alert';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuRow {
  id: string;
  icon: IoniconName;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: profile, isLoading } = useProfile();
  const { alert, alertState } = useCustomAlert();

  const handleLogout = () => {
    alert(
      t('profile.alertLogoutTitle'),
      t('profile.alertLogoutBody'),
      [
        { text: t('profile.alertCancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await secureStorage.deleteItem('access_token');
            await secureStorage.deleteItem('user_id');
            clearAuth();
            queryClient.clear();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  const menuGroups: { title: string; rows: MenuRow[] }[] = [
    {
      title: t('profile.account'),
      rows: [
        {
          id: 'change-password',
          icon: 'lock-closed-outline',
          label: t('profile.changePassword'),
          sub: t('profile.changePasswordSub'),
          onPress: () => router.push('/profile/change-password'),
        },
        {
          id: 'settings',
          icon: 'settings-outline',
          label: t('profile.settings'),
          sub: t('profile.settingsSub'),
          onPress: () => router.push('/profile/settings'),
        },
      ],
    },
    {
      title: t('profile.loansPayments'),
      rows: [
        {
          id: 'my-loans',
          icon: 'document-text-outline',
          label: t('profile.myLoans'),
          sub: t('profile.myLoansSub'),
          onPress: () => router.push('/(tabs)/loans'),
        },
        {
          id: 'payment-history',
          icon: 'receipt-outline',
          label: t('profile.paymentHistory'),
          sub: t('profile.paymentHistorySub'),
          onPress: () => router.push('/payments/history'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : profile?.ProfileImage ? (
              <Image source={{ uri: profile.ProfileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLetter}>
                {(profile?.Name ?? 'U').charAt(0).toUpperCase()}  
              </Text>
            )}
          </View>
          {profile ? (
            <>
              <Text style={styles.profileName}>{profile.Name}  </Text>
              <Text style={styles.profileMobile}>{profile.MobileNo}</Text>
              {profile.City ? (
                <Text style={styles.profileCity}>
                  <Ionicons name="location-outline" size={12} color={colors.neutral[400]} /> {profile.City}, {profile.State}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.profileName}>{t('profile.customerName')}  </Text>
          )}
        </View>

        {/* Info Cards */}
        {profile ? (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="mail-outline" size={16} color={colors.primary.gold} />
              <Text style={styles.infoLabel}>{t('profile.email')}  </Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profile.Email || '—'}  </Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary.gold} />
              <Text style={styles.infoLabel}>{t('profile.dateOfBirth')}  </Text>
              <Text style={styles.infoValue}>{profile.DOB || '—'}  </Text>
            </View>
          </View>
        ) : null}

        {/* Menu Groups */}
        {menuGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}  </Text>
            <View style={styles.groupCard}>
              {group.rows.map((row, idx) => (
                <View key={row.id}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={row.onPress}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.menuIcon, row.danger && styles.menuIconDanger]}>
                      <Ionicons
                        name={row.icon}
                        size={18}
                        color={row.danger ? colors.error : colors.primary.dark}
                      />
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={[styles.menuLabel, row.danger && { color: colors.error }]}>
                        {row.label}
                      </Text>
                      {row.sub ? <Text style={styles.menuSub}>{row.sub}</Text> : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.neutral[300]} />
                  </TouchableOpacity>
                  {idx < group.rows.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}  </Text>
        </TouchableOpacity>

        <View style={{ height: spacing[6] }} />
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFBF5' },
  scroll: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },

  avatarSection: { alignItems: 'center', paddingVertical: spacing[6] },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[3],
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  avatarLetter: { fontSize: 34, fontWeight: '800', color: colors.white },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
  profileName: { fontSize: 22, fontWeight: '800', color: colors.neutral[900] },
  profileMobile: { fontSize: 14, color: colors.neutral[500], marginTop: 4 },
  profileCity: { fontSize: 13, color: colors.neutral[400], marginTop: 4 },

  infoRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[5] },
  infoCard: {
    flex: 1, backgroundColor: colors.white,
    borderRadius: 16, padding: spacing[4],
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    gap: 4,
  },
  infoLabel: { fontSize: 11, color: colors.neutral[400], fontWeight: '600', marginTop: 2 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.neutral[800] },

  group: { marginBottom: spacing[5] },
  groupTitle: { fontSize: 12, fontWeight: '700', color: colors.neutral[400], letterSpacing: 0.8, marginBottom: spacing[2], textTransform: 'uppercase' },
  groupCard: {
    backgroundColor: colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: '#EDE8D8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[4], gap: spacing[3],
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center', alignItems: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFEBEE' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.neutral[900] },
  menuSub: { fontSize: 12, color: colors.neutral[400], marginTop: 2 },
  rowDivider: { height: 1, backgroundColor: '#F5F0E8', marginLeft: spacing[4] + 38 + spacing[3] },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[2], paddingVertical: spacing[4],
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.error,
    backgroundColor: '#FFEBEE',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
});
