// Use MongoDB model by default, can switch to MySQL later
const USE_MONGODB = process.env.USE_MONGODB !== 'false';

if (USE_MONGODB) {
  // Use MongoDB with Mongoose
  module.exports = require('./UserTokenModelMongo');
} else {
  // Use MySQL (original implementation)
  const jwt = require('jsonwebtoken');
  const config = require('../config/app');
  const dbManager = require('../config/database');
  const logger = require('../utils/logger');

  class UserTokenModel {
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
      const mysql = dbManager.getMySQL();
      
      try {
        // Extract last part of token as access_token (matching PHP pattern)
        const accessToken = token.split('.').pop();

        await mysql.query(
          `INSERT INTO tbl_user_tokens 
           (user_id, access_token, refresh_token, status, created_at, expires_at) 
           VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
          [userId, accessToken, refreshToken, 'active']
        );

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
      const mysql = dbManager.getMySQL();
      
      try {
        const accessToken = token.split('.').pop();
        
        await mysql.query(
          'UPDATE tbl_user_tokens SET status = ?, updated_at = NOW() WHERE user_id = ? AND access_token = ?',
          ['inactive', userId, accessToken]
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
      const mysql = dbManager.getMySQL();
      
      try {
        await mysql.query(
          'UPDATE tbl_user_tokens SET status = ?, updated_at = NOW() WHERE user_id = ?',
          ['inactive', userId]
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
      const mysql = dbManager.getMySQL();
      
      try {
        const [tokens] = await mysql.query(
          `SELECT access_token FROM tbl_user_tokens 
           WHERE user_id = ? AND status = ? 
           ORDER BY created_at DESC LIMIT 1`,
          [userId, 'active']
        );

        if (!tokens || tokens.length === 0) {
          return null;
        }

        return tokens[0].access_token;
      } catch (error) {
        logger.error('Get existing token error:', error);
        return null;
      }
    }
  }

  module.exports = new UserTokenModel();
}
