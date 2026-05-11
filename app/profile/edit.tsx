import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Loader, Button, Input } from '@/components';
import { useCustomAlert, CustomAlert } from '@/components/alert';
import { colors, spacing } from '@/theme';
import { useProfile } from '@/hooks';
import { useState, useEffect } from 'react';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { alert, alertState } = useCustomAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.Name || '');
      setEmail(profile.Email || '');
      setMobileNo(profile.MobileNo || '');
      setDob(profile.DOB || '');
      setAddress(profile.Address || '');
      setCity(profile.City || '');
      setState(profile.State || '');
      setPincode(profile.Pincode || '');
    }
  }, [profile]);

  const handleSubmit = async () => {
    // TODO: Implement update profile mutation
    alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </View>
      </SafeAreaView>
    );
  }

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
            Edit Profile
          </Text>
          <Text style={{ fontSize: 16, color: colors.neutral[600] }}>
            Update your personal information
          </Text>
        </View>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mobile Number"
            placeholder="Enter mobile number"
            value={mobileNo}
            onChangeText={setMobileNo}
            keyboardType="phone-pad"
            editable={false}
          />
          <Input
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            value={dob}
            onChangeText={setDob}
          />
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing[4] }}>
          Address
        </Text>

        <Card variant="outlined" style={{ marginBottom: spacing[6], padding: spacing[4] }}>
          <Input
            label="Address"
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
          <Input
            label="City"
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
          />
          <Input
            label="State"
            placeholder="Enter state"
            value={state}
            onChangeText={setState}
          />
          <Input
            label="Pincode"
            placeholder="Enter pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            maxLength={6}
          />
        </Card>

        <Button
          title="Save Changes"
          onPress={handleSubmit}
        />
      </ScrollView>

      {alertState && <CustomAlert {...alertState} />}
    </SafeAreaView>
  );
}
