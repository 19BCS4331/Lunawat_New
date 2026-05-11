import { apiClient } from '@/api';
import type { ChangePasswordRequest, ValidateTokenRequest, VersionResponse } from '@/types';

export const accountService = {
  async changePassword(data: ChangePasswordRequest): Promise<string> {
    const response = await apiClient.post<string>('/ChangePassword', data);
    return response.data;
  },

  async validateToken(data: ValidateTokenRequest): Promise<{ Status: 'Valid' | 'Invalid' }> {
    const response = await apiClient.post<{ Status: 'Valid' | 'Invalid' }>('/GetCurrentToken', data);
    return response.data;
  },

  async getLatestVersion(): Promise<VersionResponse> {
    const response = await apiClient.post<VersionResponse>('/GetLatestVersion', {});
    return response.data;
  },
};
