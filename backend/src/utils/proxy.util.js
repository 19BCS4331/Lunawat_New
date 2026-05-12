import legacyApiClient from '../config/axios.config.js';

/**
 * Reusable proxy utility for forwarding requests to the legacy backend.
 * 
 * @param {string} endpoint - The legacy backend endpoint path
 * @param {object} data - Request body data
 * @param {object} headers - Request headers
 * @param {string} method - HTTP method (default: 'POST')
 * @returns {Promise} Axios response
 */
export async function proxyRequest(endpoint, data, headers = {}, method = 'POST') {
  try {
    // Forward relevant headers from the mobile app to the legacy backend
    const forwardHeaders = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present (for authenticated requests)
    if (headers.authorization) {
      forwardHeaders.Authorization = headers.authorization;
    }

    const response = await legacyApiClient({
      method,
      url: endpoint,
      data,
      headers: forwardHeaders,
    });

    return response;
  } catch (error) {
    // Log detailed error information
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout:', endpoint);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused:', endpoint);
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 DNS resolution failed:', endpoint);
    } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('🔒 Certificate error:', endpoint);
    }

    throw error;
  }
}
