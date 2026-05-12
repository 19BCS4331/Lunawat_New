import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/constants';
import { secureStorage } from '@/utils';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await secureStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log('🚀 API Request:', {
            url: API_BASE_URL + config.url,
            method: config.method,
            data: config.data,
            headers: config.headers,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (__DEV__) {
          console.error('❌ Response Error:', {
            url: originalRequest?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            const newToken = await this.refreshToken();
            
            if (newToken) {
              this.processQueue(null, newToken);
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // Refresh failed - clear tokens and redirect to login
            await this.handleAuthError();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private processQueue(error: unknown, token: string | null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const userId = await secureStorage.getItem('user_id');
      if (!userId) {
        return null;
      }

      // Call refresh token endpoint
      const response = await this.client.post('/auth/refresh-token', { userId });
      
      if (response.data?.accessToken) {
        const newToken = response.data.accessToken;
        await secureStorage.setItem('access_token', newToken);
        return newToken;
      }
      
      return null;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Token refresh failed:', error);
      }
      return null;
    }
  }

  private async handleAuthError(): Promise<void> {
    // Clear all auth data
    await secureStorage.deleteItem('access_token');
    await secureStorage.deleteItem('user_id');
    await secureStorage.deleteItem('refresh_token');
    
    // Clear auth store state
    // This would be handled by a navigation service or auth store
    // For now, we'll just clear the tokens
    
    // TODO: Navigate to login screen
    // This should be handled by the app's navigation logic
    if (__DEV__) {
      console.log('🔓 Auth error - clearing tokens and redirecting to login');
    }
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
