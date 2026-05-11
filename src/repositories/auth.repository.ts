import { authService } from '@/services';
import { secureStorage } from '@/utils';

export const authRepository = {
  async sendLoginOtp(mobileNo: string): Promise<{ otp: string; message: string }> {
    const response = await authService.sendLoginOtp({ mobileNo });
    
    // Check for error responses
    if (response === 'Invalid User' || response.includes('Invalid') || response.includes('Error')) {
      throw new Error(response);
    }
    
    // Parse the response which is in format "123456:OTP sent successfully"
    const [otp, message] = response.split(':');
    return { otp: otp || '', message: message || 'OTP sent successfully' };
  },

  async loginWithOtp(email: string, otp: string): Promise<{ accessToken: string; userId: string }> {
    const response = await authService.loginWithOtp({ Email: email, OTP: otp });
    
    // Store tokens securely
    await secureStorage.setItem('access_token', response.AccessToken);
    await secureStorage.setItem('user_id', response.UserID);
    
    return {
      accessToken: response.AccessToken,
      userId: response.UserID,
    };
  },

  async loginWithPassword(email: string, password: string): Promise<{ accessToken: string; userId: string }> {
    const response = await authService.loginWithPassword({ Email: email, Password: password });
    
    // Store tokens securely
    await secureStorage.setItem('access_token', response.AccessToken);
    await secureStorage.setItem('user_id', response.UserID);
    
    return {
      accessToken: response.AccessToken,
      userId: response.UserID,
    };
  },

  async sendResetPasswordOtp(mobileNo: string): Promise<{ otp: string; userId: string }> {
    const response = await authService.sendResetPasswordOtp({ MobileNo: mobileNo });
    return {
      otp: response.OTP,
      userId: response.ID,
    };
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await authService.resetPassword({ UserID: userId, NewPassword: newPassword });
  },

  async logout(): Promise<void> {
    await secureStorage.clearAll();
  },

  async getAccessToken(): Promise<string | null> {
    return await secureStorage.getItem('access_token');
  },

  async getUserId(): Promise<string | null> {
    return await secureStorage.getItem('user_id');
  },
};
