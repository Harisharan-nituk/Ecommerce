const AllowedDomain = require('../models/AllowedDomain');
const config = require('../config/app');
const logger = require('../utils/logger');

/**
 * Check if origin domain is allowed
 */
async function checkAllowedDomain(req, res, next) {
  try {
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin) {
      // No origin header (e.g., direct API calls, Postman)
      return next();
    }

    // Parse origin
    let originUrl;
    try {
      originUrl = new URL(origin);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid origin header'
      });
    }

    const originDomain = `${originUrl.protocol}//${originUrl.host}`;

    // Check config first
    if (config.security.allowedDomains.length > 0) {
      const isAllowed = config.security.allowedDomains.some(domain => {
        return originDomain === domain || originDomain.startsWith(domain);
      });

      if (isAllowed) {
        return next();
      }
    }

    // Check database
    try {
      const allowedDomain = await AllowedDomain.findOne({
        where: {
          domain: originDomain,
          enabled: true
        }
      });

      if (allowedDomain) {
        return next();
      }
    } catch (error) {
      logger.error('Database check for allowed domain failed:', error);
      // Continue if database check fails
    }

    // Domain not allowed
    logger.warn(`Blocked request from unauthorized domain: ${originDomain}`);
    return res.status(403).json({
      success: false,
      message: 'Origin domain not allowed',
      origin: originDomain
    });
  } catch (error) {
    logger.error('Domain check error:', error);
    // Allow request if check fails (fail open)
    next();
  }
}

module.exports = checkAllowedDomain;

