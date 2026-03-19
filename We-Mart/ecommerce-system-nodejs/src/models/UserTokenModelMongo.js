const jwt = require('jsonwebtoken');
const config = require('../config/app');
const logger = require('../utils/logger');
const UserToken = require('./mongoose/UserToken');

class UserTokenModelMongo {
  /**
   * Generate JWT token with roles only (permissions fetched from DB)
   */
  generateToken(userId, roles = []) {
    const payload = {
      userId,
      roles, // Only roles in JWT, permissions loaded from DB
      type: 'access'
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh'
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn
    });
  }

  /**
   * Add token to database
   */
  async addToken(userId, token, refreshToken = null) {
    try {
      // Extract last part of token as access_token (matching PHP pattern)
      const accessToken = token.split('.').pop();
      
      // Calculate expiry (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await UserToken.create({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        status: 'active',
        expires_at: expiresAt,
      });

      return { token, refreshToken };
    } catch (error) {
      logger.error('Add token error:', error);
      throw error;
    }
  }

  /**
   * Remove token (logout)
   */
  async removeToken(userId, token) {
    try {
      const accessToken = token.split('.').pop();
      
      await UserToken.updateOne(
        { user_id: userId, access_token: accessToken },
        { status: 'inactive', updated_at: new Date() }
      );

      return true;
    } catch (error) {
      logger.error('Remove token error:', error);
      throw error;
    }
  }

  /**
   * Remove all user tokens
   */
  async removeAllTokens(userId) {
    try {
      await UserToken.updateMany(
        { user_id: userId },
        { status: 'inactive', updated_at: new Date() }
      );

      return true;
    } catch (error) {
      logger.error('Remove all tokens error:', error);
      throw error;
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get existing active token
   */
  async getExistingActiveToken(userId) {
    try {
      const token = await UserToken.findOne({
        user_id: userId,
        status: 'active',
      }).sort({ created_at: -1 });

      if (!token) {
        return null;
      }

      return token.access_token;
    } catch (error) {
      logger.error('Get existing token error:', error);
      return null;
    }
  }

  /**
   * Verify token exists and is active
   */
  async verifyTokenExists(userId, token) {
    try {
      const accessToken = token.split('.').pop();
      
      const tokenDoc = await UserToken.findOne({
        user_id: userId,
        access_token: accessToken,
        status: 'active',
        expires_at: { $gt: new Date() },
      });

      return tokenDoc !== null;
    } catch (error) {
      logger.error('Verify token exists error:', error);
      return false;
    }
  }
}

module.exports = new UserTokenModelMongo();

