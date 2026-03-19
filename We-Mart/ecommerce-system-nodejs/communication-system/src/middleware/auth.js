const jwt = require('jsonwebtoken');
const config = require('../config/app');
const logger = require('../utils/logger');

/**
 * Authentication middleware for Communication System
 * Validates JWT tokens from API Gateway or direct requests
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Attach user info to request
      req.user = {
        id: decoded.userId || decoded.id,
        iam_uuid: decoded.iam_uuid,
        email: decoded.email,
        roles: decoded.roles || [],
      };
      req.token = token;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = {
          id: decoded.userId || decoded.id,
          iam_uuid: decoded.iam_uuid,
          email: decoded.email,
          roles: decoded.roles || [],
        };
        req.token = token;
      } catch (error) {
        // Ignore errors for optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user has required role
 */
const hasRole = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const hasAnyRole = requiredRoles.some(role => 
      req.user.roles.includes(role) || req.user.roles.includes('Super Admin')
    );

    if (!hasAnyRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role',
        required: requiredRoles,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  hasRole,
};

