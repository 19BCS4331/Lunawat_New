# Lunawat Finance API Gateway

A Node.js + Express API Gateway that proxies requests from the mobile app to the legacy IIS/ASP.NET backend.

## Purpose

This gateway solves TLS handshake failures on older Android devices by:
- Providing a modern HTTPS-compatible endpoint for the mobile app
- Proxying requests to the legacy backend with SSL certificate verification bypass
- Maintaining identical request/response behavior to the original APIs
- **Endpoints match legacy backend exactly - only base URL needs to change**

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
LEGACY_API_BASE_URL=https://myloan.slunawat.com
NODE_ENV=development
API_TIMEOUT=30000
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

**All endpoints match the legacy backend exactly - no path changes needed in the mobile app.**

### Health
- `GET /health` - Health check

### Authentication
- `POST /SendLoginOtp` - Send login OTP
- `POST /CustomerLogin` - Login with OTP or password
- `POST /SendResetPasswordOTP` - Send reset password OTP
- `POST /ResetPassword` - Reset password
- `POST /auth/refresh-token` - Refresh access token

### Loans
- `POST /MyProfile` - Get user profile
- `POST /MyLoans` - Get user's loans
- `POST /OutstandingLoans` - Get outstanding loans

### Account
- `POST /ChangePassword` - Change password
- `POST /GetCurrentToken` - Validate token
- `POST /GetLatestVersion` - Get latest app version

### Payments
- `POST /GeneratePaymentToken` - Generate payment token
- `POST /MyPaymentHistory` - Get online payment history
- `POST /OfflinePaymentHistory` - Get offline payment history

## Example Request

```bash
curl -X POST http://localhost:3000/SendLoginOtp \
  -H "Content-Type: application/json" \
  -d '{"mobileNo": "9773100410"}'
```

## Mobile App Configuration

**Simply change the base URL in the mobile app - no other code changes needed:**

```typescript
// src/constants/index.ts
export const API_BASE_URL = 'http://localhost:3000'; // Development
// export const API_BASE_URL = 'https://your-gateway-domain.com'; // Production
```

All endpoint paths remain exactly the same as the legacy backend.

## Security Notes

- SSL certificate verification is bypassed ONLY for gateway-to-backend communication
- Public client connections use standard HTTPS verification
- This is a temporary compatibility layer until the legacy backend is upgraded
