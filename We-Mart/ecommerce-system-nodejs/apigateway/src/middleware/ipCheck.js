const IPWhitelist = require('../models/IPWhitelist');
const IPBlacklist = require('../models/IPBlacklist');
const { getClientIP, isIPBlocked, isIPAllowed } = require('../utils/ipUtils');
const config = require('../config/app');
const logger = require('../utils/logger');

/**
 * Check IP whitelist and blacklist
 */
async function checkIPAccess(req, res, next) {
  try {
    const clientIP = getClientIP(req);

    // Check blacklist first
    if (config.security.ipBlacklistEnabled) {
      // Check config blacklist
      if (isIPBlocked(clientIP, config.security.blockedIPs)) {
        logger.warn(`Blocked request from blacklisted IP: ${clientIP}`);
        return res.status(403).json({
          success: false,
          message: 'IP address is blocked',
          ip: clientIP
        });
      }

      // Check database blacklist
      try {
        const blacklistEntries = await IPBlacklist.findAll({
          where: { enabled: true }
        });

        for (const entry of blacklistEntries) {
          if (isIPBlocked(clientIP, [entry.ipAddress])) {
            // Check if block has expired
            if (entry.blockedUntil && new Date(entry.blockedUntil) < new Date()) {
              continue; // Block expired
            }

            logger.warn(`Blocked request from blacklisted IP: ${clientIP} (${entry.reason})`);
            return res.status(403).json({
              success: false,
              message: 'IP address is blocked',
              reason: entry.reason,
              ip: clientIP
            });
          }
        }
      } catch (error) {
        logger.error('Database blacklist check failed:', error);
        // Continue if database check fails
      }
    }

    // Check whitelist if enabled
    if (config.security.ipWhitelistEnabled) {
      // Check config whitelist
      if (!isIPAllowed(clientIP, config.security.allowedIPs)) {
        logger.warn(`Blocked request from non-whitelisted IP: ${clientIP}`);
        return res.status(403).json({
          success: false,
          message: 'IP address not whitelisted',
          ip: clientIP
        });
      }

      // Check database whitelist
      try {
        const whitelistEntries = await IPWhitelist.findAll({
          where: { enabled: true }
        });

        if (whitelistEntries.length > 0) {
          let isWhitelisted = false;
          for (const entry of whitelistEntries) {
            if (isIPAllowed(clientIP, [entry.ipAddress])) {
              isWhitelisted = true;
              break;
            }
          }

          if (!isWhitelisted) {
            logger.warn(`Blocked request from non-whitelisted IP: ${clientIP}`);
            return res.status(403).json({
              success: false,
              message: 'IP address not whitelisted',
              ip: clientIP
            });
          }
        }
      } catch (error) {
        logger.error('Database whitelist check failed:', error);
        // Continue if database check fails
      }
    }

    // Attach IP to request
    req.clientIP = clientIP;
    next();
  } catch (error) {
    logger.error('IP check error:', error);
    // Allow request if check fails (fail open)
    next();
  }
}

module.exports = checkIPAccess;

