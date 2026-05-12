import { View, Text, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Loader, EmptyState, Button } from '@/components';
import { colors, spacing } from '@/theme';
import { useProfile } from '@/hooks';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] }}>
          <EmptyState
            title="Error Loading Profile"
            description="Failed to load your profile information. Please try again."
            actionLabel="Retry"
            onAction={() => router.replace('/profile')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing[6] }}>
        <View style={{ marginBottom: spacing[6] }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.neutral[900], marginBottom: spacing[1] }}>
            Profile  
          </Text>
          <Text style={{ fontSize: 16, color: colors.neutral[600] }}>
            Manage your account information
          </Text>
        </View>

        <Card variant="elevated" style={{ marginBottom: spacing[6], padding: spacing[5] }}>
          <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary.gold,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing[3],
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.white }}>
                {profile.Name?.charAt(0)|| 'U'}  
              </Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.neutral[900] }}>
              {profile.Name}    
            </Text>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>
              {profile.Email}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={{ marginBottom: spacing[3] }}
          >
            <Text style={{ fontSize: 16, color: colors.primary.gold, fontWeight: '600' }}>
              Edit Profile  
            </Text>
          </TouchableOpacity>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Personal Information  
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Mobile Number</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.MobileNo}  
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Date of Birth</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.DOB || 'Not provided'}  
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Age</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.Age || 'Not provided'}  
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Address</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900], textAlign: 'right', flex: 1, marginLeft: spacing[2] }}>
              {profile.Address || 'Not provided'}  
            </Text>
          </View>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Location  
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>City</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.City || 'Not provided'}  
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>State</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.State || 'Not provided'}  
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Pincode</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[900] }}>
              {profile.Pincode || 'Not provided'}  
            </Text>
          </View>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Account Actions  
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Pressable
            onPress={() => router.push('/profile/change-password')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Change Password</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing[3] }} />
          <Pressable
            onPress={() => router.push('/profile/settings')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Settings</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing[3] }} />
          <Pressable
            onPress={() => router.push('/profile/info')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] }}
          >
            <Text style={{ fontSize: 16, color: colors.neutral[900] }}>Info & Support</Text>
            <Text style={{ fontSize: 16, color: colors.primary.gold }}>→</Text>
          </Pressable>
        </Card>

        <Button
          title="Logout"
          variant="outline"
          onPress={() => {
            router.replace('/(auth)/login');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
