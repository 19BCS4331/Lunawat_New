import { useState, useCallback } from 'react';
import { biometricAuth, type BiometricAuthResult } from '@/utils/biometric';

interface UseBiometricReturn {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  isLoading: boolean;
  authenticate: (promptMessage?: string) => Promise<BiometricAuthResult>;
  checkAvailability: () => Promise<void>;
  isBiometricEnabled: boolean;
  toggleBiometric: (enabled: boolean) => Promise<void>;
}

export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  const checkAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const available = await biometricAuth.isAvailable();
      const type = await biometricAuth.getBiometricType();
      const enabled = await biometricAuth.isBiometricEnabled();
      
      setIsAvailable(available);
      setBiometricType(type);
      setIsBiometricEnabled(enabled);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to check biometric availability:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (promptMessage?: string) => {
    return await biometricAuth.authenticate(promptMessage);
  }, []);

  const toggleBiometric = useCallback(async (enabled: boolean) => {
    await biometricAuth.setBiometricEnabled(enabled);
    setIsBiometricEnabled(enabled);
  }, []);

  return {
    isAvailable,
    biometricType,
    isLoading,
    authenticate,
    checkAvailability,
    isBiometricEnabled,
    toggleBiometric,
  };
}
