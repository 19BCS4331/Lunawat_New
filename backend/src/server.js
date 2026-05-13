import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Start the API Gateway server.
 */
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Lunawat Finance API Gateway                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Legacy Backend: ${process.env.LEGACY_API_BASE_URL}`);
  console.log('');
  console.log('📡 Available endpoints (matching legacy backend exactly):');
  console.log('   GET  /health');
  console.log('   POST /SendLoginOtp');
  console.log('   POST /CustomerLogin');
  console.log('   POST /SendResetPasswordOTP');
  console.log('   POST /ResetPassword');
  console.log('   POST /auth/refresh-token');
  console.log('   POST /MyProfile');
  console.log('   POST /MyLoans');
  console.log('   POST /OutstandingLoans');
  console.log('   POST /ChangePassword');
  console.log('   POST /GetCurrentToken');
  console.log('   POST /GetLatestVersion');
  console.log('   POST /GeneratePaymentToken');
  console.log('   POST /MyPaymentHistory');
  console.log('   POST /OfflinePaymentHistory');
  console.log('');
  console.log('✨ Gateway ready to accept requests');
  console.log('Testing Cloud Run Deploy');
});
