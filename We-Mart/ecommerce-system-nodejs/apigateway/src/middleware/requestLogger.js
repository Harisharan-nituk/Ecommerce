const { v4: uuidv4 } = require('uuid');
const ApiLog = require('../models/ApiLog');
const { getClientIP } = require('../utils/ipUtils');
const logger = require('../utils/logger');

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  // Generate request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: getClientIP(req),
    userAgent: req.get('user-agent')
  });

  // Capture original send function
  const originalSend = res.send;
  const originalJson = res.json;

  // Override send to capture response
  res.send = function (body) {
    logResponse(req, res, body);
    return originalSend.call(this, body);
  };

  res.json = function (body) {
    logResponse(req, res, JSON.stringify(body));
    return originalJson.call(this, body);
  };

  next();
}

/**
 * Log response to database
 */
async function logResponse(req, res, responseBody) {
  try {
    const responseTime = Date.now() - req.startTime;
    const clientIP = getClientIP(req);

    // Truncate response body if too long
    let truncatedResponse = null;
    if (responseBody) {
      const responseStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
      truncatedResponse = responseStr.length > 1000 
        ? responseStr.substring(0, 1000) + '...' 
        : responseStr;
    }

    // Sanitize request body
    let sanitizedBody = null;
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyCopy = { ...req.body };
      // Remove sensitive fields
      ['password', 'token', 'secret', 'key', 'credit_card', 'cvv'].forEach(field => {
        if (bodyCopy[field]) {
          bodyCopy[field] = '***REDACTED***';
        }
      });
      sanitizedBody = JSON.stringify(bodyCopy);
    }

    // Save to database
    try {
      await ApiLog.create({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        ipAddress: clientIP,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || null,
        statusCode: res.statusCode,
        responseTime,
        requestBody: sanitizedBody,
        responseBody: truncatedResponse,
        error: res.error || null
      });
    } catch (error) {
      logger.error('Failed to save API log to database:', error);
      // Continue even if logging fails
    }

    // Log to console
    logger.info('Request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error('Request logging error:', error);
  }
}

module.exports = requestLogger;

