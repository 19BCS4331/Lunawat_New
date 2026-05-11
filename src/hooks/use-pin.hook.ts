import { useState, useCallback, useEffect } from 'react';
import { pinManager } from '@/utils/pin';
import { secureStorage } from '@/utils/storage.utils';

interface UsePinReturn {
  isPinEnabled: boolean;
  hasPin: boolean;
  remainingAttempts: number;
  isLoading: boolean;
  setupPin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  enablePin: () => Promise<boolean>;
  disablePin: () => Promise<boolean>;
  clearPin: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export function usePin(): UsePinReturn {
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const [enabled, attempts] = await Promise.all([
        pinManager.isPinEnabled(),
        pinManager.getRemainingAttempts(),
      ]);
      
      const pinExists = await secureStorage.getItem('user_pin');
      
      setIsPinEnabled(enabled);
      setHasPin(!!pinExists);
      setRemainingAttempts(attempts);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to refresh PIN status:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const success = await pinManager.setupPin(pin);
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  const verifyPin = useCallback(async (pin: string) => {
    const success = await pinManager.verifyPin(pin);
    if (success) {
      await refreshStatus();
    } else {
      const attempts = await pinManager.getRemainingAttempts();
      setRemainingAttempts(attempts);
    }
    return success;
  }, [refreshStatus]);

  const changePin = useCallback(async (oldPin: string, newPin: string) => {
    const success = await pinManager.changePin(oldPin, newPin);
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  const enablePin = useCallback(async () => {
    const success = await pinManager.enablePin();
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  const disablePin = useCallback(async () => {
    const success = await pinManager.disablePin();
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  const clearPin = useCallback(async () => {
    const success = await pinManager.clearPin();
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    isPinEnabled,
    hasPin,
    remainingAttempts,
    isLoading,
    setupPin,
    verifyPin,
    changePin,
    enablePin,
    disablePin,
    clearPin,
    refreshStatus,
  };
}
