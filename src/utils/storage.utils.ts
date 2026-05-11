import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Secure storage for sensitive data
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async deleteItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async clearAll(): Promise<void> {
    // SecureStore doesn't have a clearAll, so we need to delete keys individually
    const keys = [
      'access_token',
      'refresh_token',
      'user_id',
      'biometric_enabled',
      'pin_hash',
    ];
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  },
};

// AsyncStorage for non-sensitive app preferences (works in Expo Go)
export const mmkvStorage = {
  async setItem(key: string, value: string | number | boolean): Promise<void> {
    await AsyncStorage.setItem(key, String(value));
  },

  async getItem(key: string): Promise<string | undefined> {
    const val = await AsyncStorage.getItem(key);
    return val ?? undefined;
  },

  async getNumber(key: string): Promise<number | undefined> {
    const val = await AsyncStorage.getItem(key);
    if (val === null) return undefined;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? undefined : parsed;
  },

  async getBoolean(key: string): Promise<boolean | undefined> {
    const val = await AsyncStorage.getItem(key);
    if (val === null) return undefined;
    return val === 'true';
  },

  async deleteItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};
