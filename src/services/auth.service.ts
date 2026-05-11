import { apiClient } from '@/api';
import type {
  SendLoginOtpRequest,
  LoginWithOtpRequest,
  LoginWithPasswordRequest,
  SendResetPasswordOtpRequest,
  ResetPasswordRequest,
} from '@/types';

export const authService = {
  async sendLoginOtp(data: SendLoginOtpRequest): Promise<string> {
    const response = await apiClient.post<string>('/SendLoginOtp', data);
    return response.data;
  },

  async loginWithOtp(data: LoginWithOtpRequest): Promise<{ AccessToken: string; UserID: string }> {
    const response = await apiClient.post<{ AccessToken: string; UserID: string }>('/CustomerLogin', data);
    return response.data;
  },

  async loginWithPassword(data: LoginWithPasswordRequest): Promise<{ AccessToken: string; UserID: string }> {
    const response = await apiClient.post<{ AccessToken: string; UserID: string }>('/CustomerLogin', data);
    return response.data;
  },

  async sendResetPasswordOtp(data: SendResetPasswordOtpRequest): Promise<{ OTP: string; ID: string }> {
    const response = await apiClient.post<{ OTP: string; ID: string }>('/SendResetPasswordOTP', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<string> {
    const response = await apiClient.post<string>('/ResetPassword', data);
    return response.data;
  },
};
