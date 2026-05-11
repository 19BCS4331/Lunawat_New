import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { colors, spacing } from '@/theme';
import Constants from 'expo-constants';

export default function InfoScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const { alert, alertState } = useCustomAlert();

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      alert('Error', 'Failed to open link');
    }
  };

  const handleContactUs = () => {
    // TODO: Implement contact us functionality
    alert('Contact Us', 'Email: support@lunawat.com\nPhone: +91 1234567890');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing[6] }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: spacing[4] }}>
          <Text style={{ fontSize: 16, color: colors.primary.gold, fontWeight: '600' }}>
            ← Back
          </Text>
        </Pressable>

        <View style={{ marginBottom: spacing[6] }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900], marginBottom: spacing[1] }}>
            Info & Support
          </Text>
          <Text style={{ fontSize: 16, color: colors.neutral[600] }}>
            App information and help
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Legal
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Pressable
            onPress={() => handleOpenLink('https://lunawat.com/terms')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Terms & Conditions</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing[3] }} />
          <Pressable
            onPress={() => handleOpenLink('https://lunawat.com/privacy')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Privacy Policy</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Support
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Pressable
            onPress={handleContactUs}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Contact Us</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing[3] }} />
          <Pressable
            onPress={() => handleOpenLink('https://lunawat.com/faq')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>FAQ</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          App Information
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>App Version</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {appVersion}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Build Number</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {Constants.nativeAppVersion || '1'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Platform</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {Constants.platform?.ios ? 'iOS' : 'Android'}
            </Text>
          </View>
        </Card>

        <Text style={{ fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginTop: spacing[4] }}>
          © {new Date().getFullYear()} Lunawat Finance. All rights reserved.
        </Text>
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}
