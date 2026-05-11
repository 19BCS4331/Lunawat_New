import axios, { AxiosError } from 'axios';

export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status?: number;
  details?: unknown;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Network error
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return {
          code: ApiErrorCode.TIMEOUT_ERROR,
          message: 'Request timeout. Please check your internet connection and try again.',
        };
      }
      return {
        code: ApiErrorCode.NETWORK_ERROR,
        message: 'Network error. Please check your internet connection.',
      };
    }

    // Server responded with error
    const { status, data } = axiosError.response;

    if (status === 401) {
      return {
        code: ApiErrorCode.INVALID_TOKEN,
        message: 'Session expired. Please login again.',
        status,
      };
    }

    if (status === 400) {
      return {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: extractErrorMessage(data) || 'Invalid request data.',
        status,
        details: data,
      };
    }

    if (status >= 500) {
      return {
        code: ApiErrorCode.SERVER_ERROR,
        message: 'Server error. Please try again later.',
        status,
      };
    }

    return {
      code: ApiErrorCode.UNKNOWN_ERROR,
      message: extractErrorMessage(data) || 'An unexpected error occurred.',
      status,
      details: data,
    };
  }

  // Non-axios errors
  return {
    code: ApiErrorCode.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  };
};

function extractErrorMessage(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const errorObj = data as { message?: string; error?: string };
    return errorObj.message || errorObj.error || '';
  }

  return '';
}

export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 2^attempt * 1000ms, max 10 seconds
  return Math.min(Math.pow(2, attempt) * 1000, 10000);
};

export const shouldRetry = (error: ApiError): boolean => {
  // Retry on network errors and 5xx server errors
  return (
    error.code === ApiErrorCode.NETWORK_ERROR ||
    error.code === ApiErrorCode.TIMEOUT_ERROR ||
    (error.status !== undefined && error.status >= 500)
  );
};
