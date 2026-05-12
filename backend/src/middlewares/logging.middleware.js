/**
 * Request logging middleware.
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  console.log('📥 Incoming Request:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('📤 Outgoing Response:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
