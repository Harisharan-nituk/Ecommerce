const userModel = require('../models/UserModel');
const tokenModel = require('../models/UserTokenModel');
const logger = require('../utils/logger');

class AuthController {
  /**
   * User registration
   */
  async register(req, res) {
    try {
      const { email, password, phone, first_name, last_name } = req.body;

      // Check if user already exists
      // Note: In production, add proper email uniqueness check

      const userId = await userModel.createUser({
        email,
        password,
        phone,
        first_name,
        last_name,
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { userId }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  /**
   * User login
   * JWT contains only roles, permissions fetched separately
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userModel.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Get user roles
      const roles = await userModel.getUserRoles(user.id);
      const roleNames = roles.map(r => r.name);

      // Generate token with only roles (not permissions - fetched separately)
      const token = tokenModel.generateToken(user.id, roleNames);
      const refreshToken = tokenModel.generateRefreshToken(user.id);

      // Save token
      await tokenModel.addToken(user.id, token, refreshToken);

      // Get permissions based on roles (from database)
      const permissions = await userModel.getUserPermissions(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone
          },
          token,
          refreshToken,
          roles: roleNames,
          permissions // Permissions sent in response, not in JWT
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error.message.includes('locked')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  /**
   * Get user permissions based on roles
   * Called after login to fetch permissions
   */
  async getPermissions(req, res) {
    try {
      const userId = req.user.id;
      
      // Get permissions from database based on user's roles
      const permissions = await userModel.getUserPermissions(userId);
      const roles = await userModel.getUserRoles(userId);

      res.json({
        success: true,
        data: {
          roles: roles.map(r => r.name),
          permissions
        }
      });
    } catch (error) {
      logger.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message
      });
    }
  }

  /**
   * User logout
   */
  async logout(req, res) {
    try {
      const userId = req.user.id;
      const token = req.token;

      await tokenModel.removeToken(userId, token);
      await userModel.updateLoginStatus(userId, false);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Validate token (for API Gateway)
   */
  async validateToken(req, res) {
    try {
      const authHeader = req.headers['x-auth-token'] || req.headers['authorization'];
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token required'
        });
      }

      const decoded = await tokenModel.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      const user = await userModel.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get roles from JWT
      const roles = decoded.roles || [];

      res.json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          roles
        }
      });
    } catch (error) {
      logger.error('Validate token error:', error);
      res.status(500).json({
        success: false,
        message: 'Token validation failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = await userModel.getUserById(req.user.id);
      const roles = await userModel.getUserRoles(req.user.id);
      const permissions = await userModel.getUserPermissions(req.user.id);

      res.json({
        success: true,
        data: {
          user,
          roles: roles.map(r => r.name),
          permissions
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
}

module.exports = new AuthController();
