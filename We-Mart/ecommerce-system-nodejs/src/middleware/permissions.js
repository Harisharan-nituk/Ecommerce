const userModel = require('../models/UserModel');
const logger = require('../utils/logger');

/**
 * Check if user has required permission
 * Permissions are fetched from database based on roles in JWT
 */
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userId = req.user.id;

      // Get user roles from JWT (already decoded in auth middleware)
      const roles = req.user.roles || [];

      // Check if user is super admin (from roles in JWT - fast check)
      if (roles.includes('Super Admin')) {
        // Super admin has all permissions - no DB query needed
        return next();
      }

      // Fetch permissions from database based on roles
      // This ensures permissions are always up-to-date from DB
      const permissions = await userModel.getUserPermissions(userId);

      // Check if user has the required permission
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermission,
          userPermissions: permissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has any of the required permissions
 */
const hasAnyPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userId = req.user.id;
      const roles = req.user.roles || [];

      // Check if user is super admin
      if (roles.includes('Super Admin')) {
        return next();
      }

      // Fetch permissions from database
      const permissions = await userModel.getUserPermissions(userId);

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(perm => 
        permissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Check if user has specific role
 */
const hasRole = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const roles = req.user.roles || [];

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => 
        roles.includes(role)
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role access',
          required: requiredRoles,
          userRoles: roles
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

/**
 * Check if user is Super Admin
 */
const isSuperAdmin = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const roles = req.user.roles || [];

      if (!roles.includes('Super Admin')) {
        return res.status(403).json({
          success: false,
          message: 'Super Admin access required'
        });
      }

      next();
    } catch (error) {
      logger.error('Super Admin check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Access check failed'
      });
    }
  };
};

module.exports = {
  hasPermission,
  hasAnyPermission,
  hasRole,
  isSuperAdmin
};
