const jwt = require('jsonwebtoken');
const config = require('../config/app');
const dbManager = require('../config/database');
const userModel = require('../models/UserModel');
const tokenModel = require('../models/UserTokenModel');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['x-auth-token'] || req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    // Extract token (handle "Bearer <token>" format)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database (works with both MongoDB and MySQL)
    const user = await userModel.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Verify token in database
    const tokenExists = await tokenModel.verifyTokenExists(user.id, token);

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user to request with roles from JWT
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      roles: decoded.roles || [] // Roles from JWT payload
    };
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-auth-token'] || req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await userModel.getUserById(decoded.userId);

        if (user && user.status === 'active') {
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
          };
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};

