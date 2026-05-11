import { secureStorage } from './storage.utils';

export class PinManager {
  private static readonly PIN_KEY = 'user_pin';
  private static readonly PIN_ENABLED_KEY = 'pin_enabled';
  private static readonly PIN_ATTEMPTS_KEY = 'pin_attempts';
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Set up a new PIN
   */
  static async setupPin(pin: string): Promise<boolean> {
    try {
      if (!this.validatePin(pin)) {
        return false;
      }

      await secureStorage.setItem(this.PIN_KEY, this.hashPin(pin));
      await secureStorage.setItem(this.PIN_ENABLED_KEY, 'true');
      await this.resetAttempts();
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to setup PIN:', error);
      }
      return false;
    }
  }

  /**
   * Verify the entered PIN
   */
  static async verifyPin(enteredPin: string): Promise<boolean> {
    try {
      const storedPin = await secureStorage.getItem(this.PIN_KEY);
      
      if (!storedPin) {
        return false;
      }

      const attempts = await this.getAttempts();
      
      if (attempts >= this.MAX_ATTEMPTS) {
        // Max attempts reached, reset PIN
        await this.clearPin();
        return false;
      }

      const isValid = this.hashPin(enteredPin) === storedPin;

      if (isValid) {
        await this.resetAttempts();
      } else {
        await this.incrementAttempts();
      }

      return isValid;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to verify PIN:', error);
      }
      return false;
    }
  }

  /**
   * Change the existing PIN
   */
  static async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      const isValid = await this.verifyPin(oldPin);
      
      if (!isValid) {
        return false;
      }

      if (!this.validatePin(newPin)) {
        return false;
      }

      await secureStorage.setItem(this.PIN_KEY, this.hashPin(newPin));
      await this.resetAttempts();
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to change PIN:', error);
      }
      return false;
    }
  }

  /**
   * Check if PIN is enabled
   */
  static async isPinEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(this.PIN_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to check PIN enabled status:', error);
      }
      return false;
    }
  }

  /**
   * Enable PIN lock
   */
  static async enablePin(): Promise<boolean> {
    try {
      const hasPin = await secureStorage.getItem(this.PIN_KEY);
      
      if (!hasPin) {
        return false;
      }

      await secureStorage.setItem(this.PIN_ENABLED_KEY, 'true');
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to enable PIN:', error);
      }
      return false;
    }
  }

  /**
   * Disable PIN lock
   */
  static async disablePin(): Promise<boolean> {
    try {
      await secureStorage.setItem(this.PIN_ENABLED_KEY, 'false');
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to disable PIN:', error);
      }
      return false;
    }
  }

  /**
   * Clear PIN (for security reset)
   */
  static async clearPin(): Promise<boolean> {
    try {
      await secureStorage.deleteItem(this.PIN_KEY);
      await secureStorage.deleteItem(this.PIN_ENABLED_KEY);
      await this.resetAttempts();
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to clear PIN:', error);
      }
      return false;
    }
  }

  /**
   * Get remaining attempts
   */
  static async getRemainingAttempts(): Promise<number> {
    const attempts = await this.getAttempts();
    return Math.max(0, this.MAX_ATTEMPTS - attempts);
  }

  /**
   * Validate PIN format
   */
  static validatePin(pin: string): boolean {
    // PIN must be 4 digits
    return /^\d{4}$/.test(pin);
  }

  /**
   * Hash PIN for secure storage
   * Note: This is a simple hash. In production, use proper encryption
   */
  private static hashPin(pin: string): string {
    // Simple hash for demonstration
    // In production, use proper encryption like crypto-js
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get current attempt count
   */
  private static async getAttempts(): Promise<number> {
    try {
      const attempts = await secureStorage.getItem(this.PIN_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment attempt count
   */
  private static async incrementAttempts(): Promise<void> {
    const attempts = await this.getAttempts();
    await secureStorage.setItem(this.PIN_ATTEMPTS_KEY, (attempts + 1).toString());
  }

  /**
   * Reset attempt count
   */
  private static async resetAttempts(): Promise<void> {
    await secureStorage.setItem(this.PIN_ATTEMPTS_KEY, '0');
  }
}

export const pinManager = PinManager;
