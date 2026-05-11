import { accountService } from '@/services';
import { secureStorage } from '@/utils';

export const accountRepository = {
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      throw new Error('User not authenticated');
    }

    await accountService.changePassword({
      UserID: userId,
      Old: oldPassword,
      New: newPassword,
      Token: token,
    });
  },

  async validateToken(): Promise<boolean> {
    const userId = await secureStorage.getItem('user_id');
    const token = await secureStorage.getItem('access_token');
    
    if (!userId || !token) {
      return false;
    }

    try {
      const response = await accountService.validateToken({ UserID: userId, Token: token });
      return response.Status === 'Valid';
    } catch {
      return false;
    }
  },

  async getLatestVersion(): Promise<{ status: string; version: string; updateMessage: string }> {
    const response = await accountService.getLatestVersion();
    return {
      status: response.Status,
      version: response.Version,
      updateMessage: response.UpdateMessage,
    };
  },
};
