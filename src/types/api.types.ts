// Authentication Types
export interface SendLoginOtpRequest {
  mobileNo: string;
}

export interface LoginWithOtpRequest {
  Email: string;
  OTP: string;
}

export interface LoginWithPasswordRequest {
  Email: string;
  Password: string;
}

export interface SendResetPasswordOtpRequest {
  MobileNo: string;
}

export interface ResetPasswordRequest {
  UserID: string;
  NewPassword: string;
}

export interface LoginResponse {
  AccessToken: string;
  UserID: string;
}

export interface ResetPasswordOtpResponse {
  OTP: string;
  ID: string;
}

// Profile Types
export interface MyProfileRequest {
  UserID: string;
  Token: string;
}

export interface UserProfile {
  Email: string | null;
  ProfileImage: string | null;
  Name: string;
  MobileNo: string;
  Age: string;
  DOB: string;
  Address: string;
  City: string | null;
  State: string;
  Pincode: string;
  UCID?: string;
  ActiveFrom?: string;
}

// Loan Types
export interface LoanRequest {
  UserID: string;
  Token: string;
}

export interface Loan {
  ID: string;
  LoanNo: string;
  LoanAmount: string;
  LoanDate: string;
  LoanStatus: 'Open' | 'Closed';
  PendingLoanAmount: string;
  IntAmount: string;
  IntDuedays: string;
  TotalDueAmount: string;
  NoticeAmount: string;
  OtherCharges: string;
  PayFrequency: string;
  MinIntdays: string;
  // Additional fields from real API response
  BranchID?: number;
  BranchName?: string;
  GoldAmount?: string;
  GoldRate?: string;
  GrossWeight?: string;
  NetWeight?: string;
  NetPaid?: string;
  Scheme?: string;
  Wallet?: string;
  PaidBy?: string;
  LoanEligibleAmount?: string;
}

// Payment Types
export interface GeneratePaymentTokenRequest {
  LoanID: string;
  UserID: string;
  LoanNo: string;
  amount: string;
  Token: string;
}

export interface PaymentTokenResponse {
  merchantId: string;
  bdorderid: string;
  token: string;
}

export interface PaymentHistoryRequest {
  UserID: string;
  Token: string;
}

export interface OnlinePayment {
  ID: number | string;
  LoanID: number | string;
  LoanNo: string;
  Amount: string;
  Status: string;
  Date: string;
  CreatedOn?: string;
  Mode?: string;
  Name?: string;
  OrderID?: string;
  PartyID?: number | string;
  ResponseCode: string;
  TransactionRefID?: string | null;
  TransactionNote?: string;
  UPIID?: string | null;
  parsedResponseCode?: TransactionDetails | null;
}

export interface OfflinePayment {
  ID: string;
  LoanID: string;
  LoanNo: string;
  Amount: string;
  Date: string;
  PaidBy: string;
  PaymentReferenceNo: string;
  ReceiptNo: string;
  URL: string;
}

export interface TransactionDetails {
  mercid?: string;
  transaction_date?: string;
  amount?: string;
  charge_amount?: string;
  surcharge?: string;
  discount?: string;
  orderid?: string;
  transactionid?: string;
  bank_ref_no?: string;
  bankid?: string;
  payment_method_type?: string;
  payment_category?: string;
  txn_process_type?: string;
  auth_status?: string;
  transaction_error_code?: string;
  transaction_error_type?: string;
  transaction_error_desc?: string;
  currency?: string;
  ru?: string;
  objectid?: string;
  itemcode?: string;
  additional_info?: Record<string, string>;
}

// Account Types
export interface ChangePasswordRequest {
  UserID: string;
  Old: string;
  New: string;
  Token: string;
}

export interface ValidateTokenRequest {
  UserID: string;
  Token: string;
}

export interface TokenValidationResponse {
  Status: 'Valid' | 'Invalid';
}

export interface VersionResponse {
  Status: string;
  Version: string;
  UpdateMessage: string;
}

// Common Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: ApiError;
};
