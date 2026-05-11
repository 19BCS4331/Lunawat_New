import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export class BiometricAuth {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      if (__DEV__) {
        console.error('Biometric availability check failed:', error);
      }
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  static async getBiometricType(): Promise<BiometricType> {
    try {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'facial';
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
      }
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'iris';
      }
      
      return 'none';
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to get biometric type:', error);
      }
      return 'none';
    }
  }

  /**
   * Authenticate user using biometrics
   */
  static async authenticate(
    promptMessage: string = 'Authenticate to continue'
  ): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available or not enrolled',
          biometricType: await this.getBiometricType(),
        };
      }

      const biometricType = await this.getBiometricType();

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: Platform.OS === 'android',
      });

      if (result.success) {
        return {
          success: true,
          biometricType,
        };
      }

      return {
        success: false,
        error: result.error || 'Authentication failed',
        biometricType,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Biometric authentication failed:', error);
      }
      return {
        success: false,
        error: 'Biometric authentication error',
      };
    }
  }

  /**
   * Save biometric enabled preference
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    const { secureStorage } = await import('./storage.utils');
    await secureStorage.setItem('biometric_enabled', enabled.toString());
  }

  /**
   * Check if biometric is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    const { secureStorage } = await import('./storage.utils');
    const enabled = await secureStorage.getItem('biometric_enabled');
    return enabled === 'true';
  }

  /**
   * Get localized biometric name
   */
  static getBiometricName(type: BiometricType): string {
    switch (type) {
      case 'facial':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  }
}

export const biometricAuth = BiometricAuth;
