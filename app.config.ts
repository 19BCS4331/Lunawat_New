import { type ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lunawat Finance',
  slug: 'lunawat-finance',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'lunawat',
  icon: './assets/SLF_New_Logo_PNG.png',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.slunawat',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsagePermission: 'Allow $(PRODUCT_NAME) to access your camera',
      NSMicrophoneUsagePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
    },
  },
  android: {
    package: 'com.slunawat',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/SLF_New_Logo_PNG.png',
      backgroundColor: '#FDFBF5',
    },
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
    [
      'expo-splash-screen',
      {
        image: './assets/SLF_New_Logo_PNG.png',
        imageWidth: 200,
        backgroundColor: '#FDFBF5',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '7eda4f92-2d1e-4266-9fef-9822b2abb9c2',
    },
    API_BASE_URL: process.env.API_BASE_URL || 'https://lunawat-new-853454096741.asia-south1.run.app',
    ENV: process.env.ENV || 'development',
  },
  runtimeVersion: '1.0.0',
});
