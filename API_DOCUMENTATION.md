# API Documentation

**Base URL:** `https://myloan.slunawat.com/LoanAPI`

**Timeout:** 30 seconds

**Content-Type:** `application/json`

---

## Authentication Endpoints

### 1. Send Login OTP

**Endpoint:** `POST /SendLoginOtp`

**Description:** Sends OTP to user's phone number for login authentication.

**Request Body:**
```typescript
{
  mobileNo: string  // 10-digit mobile number
}
```

**Response:** `string` (OTP value)

**Example:**
```javascript
// Request
{
  mobileNo: "9876543210"
}

// Response
"123456:OTP sent successfully"
```

---

### 2. Customer Login (Phone + OTP)

**Endpoint:** `POST /CustomerLogin`

**Description:** Authenticates user using phone number and OTP.

**Request Body:**
```typescript
{
  Email: string,  // Mobile number or email
  OTP: string     // OTP received
}
```

**Response:**
```typescript
{
  AccessToken: string,
  UserID: string
}
```

**Example:**
```javascript
// Request
{
  Email: "9876543210",
  OTP: "123456"
}

// Response
{
  AccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  UserID: "12345"
}
```

---

### 3. Customer Login (Email + Password)

**Endpoint:** `POST /CustomerLogin`

**Description:** Authenticates user using email and password.

**Request Body:**
```typescript
{
  Email: string,    // User's email address
  Password: string  // User's password
}
```

**Response:**
```typescript
{
  AccessToken: string,
  UserID: string
}
```

**Example:**
```javascript
// Request
{
  Email: "user@example.com",
  Password: "password123"
}

// Response
{
  AccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  UserID: "12345"
}
```

---

### 4. Send Reset Password OTP

**Endpoint:** `POST /SendResetPasswordOTP`

**Description:** Sends OTP to user's phone or email for password reset.

**Request Body:**
```typescript
{
  MobileNo: string  // 10-digit mobile number or email
}
```

**Response:**
```typescript
{
  OTP: string,  // OTP value
  ID: string    // User ID
}
```

**Error Responses:**
- `"Invalid User"` - User doesn't exist
- `"Failed to send OTP."` - OTP sending failed
- `"No Access Permission"` - Account doesn't have mobile app access

**Example:**
```javascript
// Request
{
  MobileNo: "9876543210"
}

// Response
{
  OTP: "654321",
  ID: "12345"
}
```

---

### 5. Reset Password

**Endpoint:** `POST /ResetPassword`

**Description:** Resets user's password after OTP verification.

**Request Body:**
```typescript
{
  UserID: string,        // User ID received from OTP endpoint
  NewPassword: string    // New password
}
```

**Response:** `string`

**Success Response:** `"Success"`
**Error Response:** `"Invalid User"`

**Example:**
```javascript
// Request
{
  UserID: "12345",
  NewPassword: "newPassword123"
}

// Response
"Success"
```

---

## Loan Data Endpoints

### 6. Get User Profile

**Endpoint:** `POST /MyProfile`

**Description:** Fetches user's profile information.

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:**
```typescript
{
  Email: string,
  ProfileImage: string | null,
  Name: string,
  MobileNo: string,
  Age: string,
  DOB: string,
  Address: string,
  City: string,
  State: string,
  Pincode: string
}
```

**Error Response:** `"Invalid Token"` (if logged in from another device)

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  Email: "user@example.com",
  ProfileImage: "https://example.com/profile.jpg",
  Name: "John Doe",
  MobileNo: "9876543210",
  Age: "30",
  DOB: "1994-01-15",
  Address: "123 Main Street",
  City: "Mumbai",
  State: "Maharashtra",
  Pincode: "400001"
}
```

---

### 7. Get All Loans

**Endpoint:** `POST /MyLoans`

**Description:** Fetches all user loans (both open and closed).

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:** Array of Loan objects

```typescript
{
  ID: string,
  LoanNo: string,
  LoanAmount: string,
  LoanDate: string,
  LoanStatus: string,  // "Open" or "Closed"
  PendingLoanAmount: string,
  IntAmount: string,
  IntDuedays: string,
  TotalDueAmount: string,
  NoticeAmount: string,
  OtherCharges: string,
  PayFrequency: string,
  MinIntdays: string
}
```

**Error Response:** Array with first item containing `Status: "Invalid Token"`

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
[
  {
    ID: "1",
    LoanNo: "LN001",
    LoanAmount: "100000",
    LoanDate: "2023-01-15",
    LoanStatus: "Open",
    PendingLoanAmount: "75000",
    IntAmount: "5000",
    IntDuedays: "30",
    TotalDueAmount: "80000",
    NoticeAmount: "0",
    OtherCharges: "500",
    PayFrequency: "30",
    MinIntdays: "15"
  },
  {
    ID: "2",
    LoanNo: "LN002",
    LoanAmount: "50000",
    LoanDate: "2022-05-20",
    LoanStatus: "Closed",
    LoanAmount: "50000",
    LoanDate: "2022-05-20",
    LoanStatus: "Closed",
    PendingLoanAmount: "0",
    IntAmount: "0",
    IntDuedays: "0",
    TotalDueAmount: "0",
    NoticeAmount: "0",
    OtherCharges: "0",
    PayFrequency: "30",
    MinIntdays: "15"
  }
]
```

---

### 8. Get Outstanding Loans

**Endpoint:** `POST /OutstandingLoans`

**Description:** Fetches loans with outstanding payments.

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:** Array of Outstanding Loan objects

```typescript
{
  ID: string,
  LoanNo: string,
  LoanAmount: string,
  LoanDate: string,
  LoanStatus: string,
  PendingLoanAmount: string,
  IntAmount: string,
  IntDuedays: string,
  TotalDueAmount: string,
  NoticeAmount: string,
  OtherCharges: string,
  PayFrequency: string,
  MinIntdays: string
}
```

**Error Response:** Array with first item containing `Status: "Invalid Token"`

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
[
  {
    ID: "1",
    LoanNo: "LN001",
    LoanAmount: "100000",
    LoanDate: "2023-01-15",
    LoanStatus: "Open",
    PendingLoanAmount: "75000",
    IntAmount: "5000",
    IntDuedays: "30",
    TotalDueAmount: "80000",
    NoticeAmount: "0",
    OtherCharges: "500",
    PayFrequency: "30",
    MinIntdays: "15"
  }
]
```

---

## Payment Endpoints

### 9. Generate Payment Token

**Endpoint:** `POST /GeneratePaymentToken`

**Description:** Generates BillDesk payment token for processing payment.

**Request Body:**
```typescript
{
  LoanID: string,    // Loan ID
  UserID: string,    // User ID from login
  LoanNo: string,    // Loan number
  amount: string,    // Payment amount
  Token: string      // Access token from login
}
```

**Response:**
```typescript
{
  merchantId: string,
  bdorderid: string,
  token: string
}
```

**Example:**
```javascript
// Request
{
  LoanID: "1",
  UserID: "12345",
  LoanNo: "LN001",
  amount: "5000",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  merchantId: "BILLDESK_MERCHANT_ID",
  bdorderid: "BD123456789",
  token: "billdesk_payment_token"
}
```

---

### 10. Get Online Payment History

**Endpoint:** `POST /MyPaymentHistory`

**Description:** Fetches online payment history for the user.

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:** Array of Payment objects

```typescript
{
  ID: string,
  LoanNo: string,
  Amount: string,
  Status: string,
  Date: string,
  ResponseCode: string  // JSON string containing transaction details
}
```

**ResponseCode JSON Structure:**
```typescript
{
  transaction_id: string,
  transaction_date: string,
  transaction_status: string,
  payment_mode: string
}
```

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
[
  {
    ID: "1",
    LoanNo: "LN001",
    Amount: "5000",
    Status: "Success",
    Date: "2024-01-15T10:30:00",
    ResponseCode: '{"transaction_id":"TXN123456","transaction_date":"2024-01-15T10:30:00","transaction_status":"success","payment_mode":"UPI"}'
  }
]
```

---

### 11. Get Offline Payment History

**Endpoint:** `POST /OfflinePaymentHistory`

**Description:** Fetches offline/in-person payment history for the user.

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:** Array of Offline Payment objects

```typescript
{
  ID: string,
  LoanNo: string,
  Amount: string,
  Status: string,
  Date: string,
  PaidBy: string
}
```

**Error Response:** Array with first item containing `Status: "Invalid Token"`

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
[
  {
    ID: "1",
    LoanNo: "LN001",
    Amount: "2000",
    Status: "Success",
    Date: "2024-01-10",
    PaidBy: "Cash"
  }
]
```

---

## Account Management Endpoints

### 12. Change Password

**Endpoint:** `POST /ChangePassword`

**Description:** Changes user's password with OTP verification.

**Request Body:**
```typescript
{
  UserID: string,    // User ID from login
  Old: string,       // Old password (currently not used)
  New: string,       // New password
  Token: string      // Access token from login
}
```

**Response:** `string`

**Success Response:** `"Success"`
**Error Responses:** 
- `"Invalid Token"` - Token expired or invalid
- `"Old Password Entered Is Incorrect"` - Old password mismatch

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Old: "",
  New: "newPassword123",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
"Success"
```

---

### 13. Validate Current Token

**Endpoint:** `POST /GetCurrentToken`

**Description:** Validates if the current token is still valid.

**Request Body:**
```typescript
{
  UserID: string,  // User ID from login
  Token: string   // Access token from login
}
```

**Response:**
```typescript
{
  Status: string  // "Valid" or "Invalid"
}
```

**Example:**
```javascript
// Request
{
  UserID: "12345",
  Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  Status: "Valid"
}
```

---

## App Update Endpoint

### 14. Get Latest App Version

**Endpoint:** `POST /GetLatestVersion`

**Description:** Fetches the latest app version available for update.

**Request Body:** None (empty body)

**Response:**
```typescript
{
  Status: string,          // "Success" or error status
  Version: string,         // Latest version number
  UpdateMessage: string    // Update message to display to user
}
```

**Example:**
```javascript
// Request
{}

// Response
{
  Status: "Success",
  Version: "3.1",
  UpdateMessage: "A new version is available with bug fixes and improvements."
}
```

---

## Error Handling

All endpoints may return the following error responses:

### Network Errors
- **Status:** Network Error
- **Description:** Unable to reach the server (check internet connection)

### Timeout Errors
- **Status:** Request Timeout
- **Description:** Request took longer than 30 seconds

### Invalid Token
- **Status:** Invalid Token
- **Description:** Token is expired or user logged in from another device
- **Action:** Clear stored token and redirect to login

### Server Errors
- **Status:** 500 Internal Server Error
- **Description:** Server-side error occurred

---

## Notes

1. **Token Management:** All authenticated endpoints require a valid token. Tokens should be stored securely and refreshed when expired.

2. **Token Expiry:** If an endpoint returns "Invalid Token", the user should be logged out and redirected to the login screen.

3. **Data Types:** All numeric values are returned as strings from the API and should be parsed as needed.

4. **Date Format:** Dates are returned in ISO 8601 format (YYYY-MM-DDTHH:mm:ss).

5. **Payment Calculation:** Payment amounts must be in multiples of 10 with a minimum of Rs. 100.

6. **BillDesk Integration:** The payment token endpoint is specifically designed for BillDesk payment gateway integration.

7. **Rate Limiting:** OTP endpoints have a 45-second cooldown before resending.

8. **Security:** Always use HTTPS for all API calls. Never expose tokens in client-side logs.

---

## TypeScript Type Definitions

```typescript
// API Response Types
interface LoginResponse {
  AccessToken: string;
  UserID: string;
}

interface OTPResponse {
  OTP: string;
  ID: string;
}

interface UserProfile {
  Email: string;
  ProfileImage: string | null;
  Name: string;
  MobileNo: string;
  Age: string;
  DOB: string;
  Address: string;
  City: string;
  State: string;
  Pincode: string;
}

interface Loan {
  ID: string;
  LoanNo: string;
  LoanAmount: string;
  LoanDate: string;
  LoanStatus: string;
  PendingLoanAmount: string;
  IntAmount: string;
  IntDuedays: string;
  TotalDueAmount: string;
  NoticeAmount: string;
  OtherCharges: string;
  PayFrequency: string;
  MinIntdays: string;
}

interface PaymentTokenResponse {
  merchantId: string;
  bdorderid: string;
  token: string;
}

interface Payment {
  ID: string;
  LoanNo: string;
  Amount: string;
  Status: string;
  Date: string;
  ResponseCode: string;
}

interface OfflinePayment {
  ID: string;
  LoanNo: string;
  Amount: string;
  Status: string;
  Date: string;
  PaidBy: string;
}

interface VersionResponse {
  Status: string;
  Version: string;
  UpdateMessage: string;
}

interface TokenValidationResponse {
  Status: string;
}
```

---

**Last Updated:** May 9, 2026

**API Version:** 1.0
