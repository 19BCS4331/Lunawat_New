// Navigation Types
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  loans: undefined;
  payments: undefined;
  profile: undefined;
  modal: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  'otp-login': { mobileNo: string };
  'password-login': undefined;
  'forgot-password': undefined;
  'verify-otp': { mobileNo: string; userId: string };
  'reset-password': { userId: string };
  'setup-pin': undefined;
  'verify-pin': undefined;
};

export type TabsParamList = {
  dashboard: undefined;
  loans: undefined;
  payments: undefined;
  profile: undefined;
};

// App State Types
export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isBiometricEnabled: boolean;
  isPinEnabled: boolean;
  pin: string | null;
}

export interface AppState {
  language: 'en' | 'hi' | 'mr';
  isOnboarded: boolean;
  notificationsEnabled: boolean;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaymentState {
  isProcessing: boolean;
  currentTransaction: string | null;
  pendingPayment: {
    loanId: string;
    amount: string;
    timestamp: number;
  } | null;
}
