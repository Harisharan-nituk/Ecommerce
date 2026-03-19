const dbManager = require('../config/database');
const logger = require('../utils/logger');

/**
 * Audit log middleware - logs user actions to MongoDB
 */
const auditLog = async (req, res, next) => {
  // Store original send function
  const originalSend = res.json;

  // Override json function to capture response
  res.json = function (data) {
    // Log after response is sent
    setImmediate(() => {
      logAuditEvent(req, res, data);
    });
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log audit event to MongoDB
 */
async function logAuditEvent(req, res, responseData) {
  try {
    const mongodb = dbManager.getMongoDB();
    if (!mongodb || !mongodb.isConnected()) {
      return; // MongoDB not available
    }

    const collection = mongodb.getCollection('audit_logs');
    if (!collection) {
      return;
    }

    const auditData = {
      user_id: req.user?.id || null,
      action: `${req.method} ${req.path}`,
      resource: req.originalUrl,
      method: req.method,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      request_body: sanitizeRequestBody(req.body),
      response_status: res.statusCode,
      response_success: responseData?.success || false,
      timestamp: new Date()
    };

    await collection.insertOne(auditData);
  } catch (error) {
    logger.error('Audit log error:', error);
    // Don't throw - audit logging shouldn't break the request
  }
}

/**
 * Sanitize request body - remove sensitive data
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card', 'cvv'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

module.exports = auditLog;

