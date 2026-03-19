const RateLimit = require('../models/RateLimit');
const NodeCache = require('node-cache');
const config = require('../config/app');
const logger = require('../utils/logger');
const { getClientIP } = require('../utils/ipUtils');

// In-memory cache for rate limiting (fallback)
const rateLimitCache = new NodeCache({ stdTTL: 900, checkperiod: 60 });

/**
 * Database-based rate limiter
 */
async function databaseRateLimiter(req, res, next) {
  try {
    if (!config.rateLimit.enabled) {
      return next();
    }

    const route = req.route || { path: req.path };
    const routePath = route.path || req.path;
    const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${getClientIP(req)}`;
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.rateLimit.windowMs);
    const windowEnd = new Date(now.getTime() + config.rateLimit.windowMs);

    // Get route-specific limits
    const routeLimit = route.rateLimitMax || config.rateLimit.max;
    const routeWindow = route.rateLimitWindow || config.rateLimit.windowMs;

    try {
      // Check if identifier is blocked
      const blocked = await RateLimit.findOne({
        where: {
          identifier,
          blocked: true
        }
      });

      if (blocked && blocked.blockedUntil && new Date(blocked.blockedUntil) > now) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. You are temporarily blocked.',
          retryAfter: Math.ceil((new Date(blocked.blockedUntil) - now) / 1000)
        });
      }

      // Get or create rate limit record
      let rateLimit = await RateLimit.findOne({
        where: {
          identifier,
          route: routePath,
          windowStart: {
            [require('sequelize').Op.lte]: now
          },
          windowEnd: {
            [require('sequelize').Op.gte]: now
          }
        }
      });

      if (!rateLimit) {
        // Create new rate limit record
        rateLimit = await RateLimit.create({
          identifier,
          route: routePath,
          count: 1,
          windowStart: now,
          windowEnd: new Date(now.getTime() + routeWindow)
        });
      } else {
        // Check if window expired
        if (new Date(rateLimit.windowEnd) < now) {
          // Reset window
          rateLimit.count = 1;
          rateLimit.windowStart = now;
          rateLimit.windowEnd = new Date(now.getTime() + routeWindow);
          await rateLimit.save();
        } else {
          // Increment count
          rateLimit.count += 1;
          await rateLimit.save();
        }
      }

      // Check if limit exceeded
      if (rateLimit.count > routeLimit) {
        // Block identifier temporarily
        const blockUntil = new Date(now.getTime() + (routeWindow * 2));
        await RateLimit.update(
          {
            blocked: true,
            blockedUntil: blockUntil
          },
          {
            where: { identifier }
          }
        );

        logger.warn(`Rate limit exceeded for ${identifier} on ${routePath}`);
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          limit: routeLimit,
          window: routeWindow,
          retryAfter: Math.ceil(routeWindow / 1000)
        });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', routeLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, routeLimit - rateLimit.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(new Date(rateLimit.windowEnd).getTime() / 1000));

      next();
    } catch (error) {
      logger.error('Database rate limiter error:', error);
      // Fallback to memory-based rate limiting
      return memoryRateLimiter(req, res, next);
    }
  } catch (error) {
    logger.error('Rate limiter error:', error);
    next();
  }
}

/**
 * Memory-based rate limiter (fallback)
 */
function memoryRateLimiter(req, res, next) {
  try {
    if (!config.rateLimit.enabled) {
      return next();
    }

    const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${getClientIP(req)}`;
    const cacheKey = `ratelimit:${identifier}:${req.path}`;

    const current = rateLimitCache.get(cacheKey) || { count: 0, resetTime: Date.now() + config.rateLimit.windowMs };

    // Check if window expired
    if (current.resetTime < Date.now()) {
      current.count = 0;
      current.resetTime = Date.now() + config.rateLimit.windowMs;
    }

    current.count += 1;
    rateLimitCache.set(cacheKey, current, Math.ceil(config.rateLimit.windowMs / 1000));

    if (current.count > config.rateLimit.max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        limit: config.rateLimit.max,
        retryAfter: Math.ceil((current.resetTime - Date.now()) / 1000)
      });
    }

    res.setHeader('X-RateLimit-Limit', config.rateLimit.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.rateLimit.max - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));

    next();
  } catch (error) {
    logger.error('Memory rate limiter error:', error);
    next();
  }
}

/**
 * Route-specific rate limiter
 */
function createRateLimiter(route) {
  return async (req, res, next) => {
    req.route = route;
    if (config.rateLimit.storeType === 'database') {
      return databaseRateLimiter(req, res, next);
    } else {
      return memoryRateLimiter(req, res, next);
    }
  };
}

module.exports = {
  databaseRateLimiter,
  memoryRateLimiter,
  createRateLimiter
};

