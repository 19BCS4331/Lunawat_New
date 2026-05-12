import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Axios instance for communicating with the legacy backend.
 * 
 * IMPORTANT: We use rejectUnauthorized: false to bypass SSL certificate verification
 * for the legacy backend. This is ONLY for the gateway-to-backend communication
 * and does NOT affect public client connections.
 * 
 * This is necessary because the legacy backend uses older SSL/TLS configurations
 * that are incompatible with some Android devices. The gateway acts as a modern
 * HTTPS-compatible intermediary.
 */
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const legacyApiClient = axios.create({
  baseURL: process.env.LEGACY_API_BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
legacyApiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Gateway → Legacy Request:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Gateway → Legacy Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
legacyApiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Gateway ← Legacy Response:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('❌ Gateway ← Legacy Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });
    return Promise.reject(error);
  }
);

export default legacyApiClient;
