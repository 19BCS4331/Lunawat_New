import { type ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lunawat Finance',
  slug: 'lunawat-finance',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'lunawat',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lunawat.finance',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsagePermission: 'Allow $(PRODUCT_NAME) to access your camera',
      NSMicrophoneUsagePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
    },
  },
  android: {
    package: 'com.lunawat.finance',
    versionCode: 1,
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'VIBRATE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    'expo-local-authentication',
  ],
  extra: {
    eas: {
      projectId: '7eda4f92-2d1e-4266-9fef-9822b2abb9c2',
    },
    API_BASE_URL: process.env.API_BASE_URL || 'https://myloan.slunawat.com/LoanAPI',
    ENV: process.env.ENV || 'development',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
