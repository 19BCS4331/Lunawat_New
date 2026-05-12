/**
 * Centralized error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle Axios errors from legacy backend
  if (err.response) {
    // Legacy backend responded with error status
    return res.status(err.response.status).json({
      error: err.response.data || 'Legacy backend error',
      status: err.response.status,
    });
  }

  if (err.request) {
    // Request was made but no response received
    return res.status(503).json({
      error: 'Legacy backend unavailable',
      message: 'Could not reach the legacy backend server',
    });
  }

  // Other errors
  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};
