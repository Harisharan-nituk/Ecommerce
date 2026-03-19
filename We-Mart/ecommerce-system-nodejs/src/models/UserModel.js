// Use MongoDB model by default, can switch to MySQL later
const USE_MONGODB = process.env.USE_MONGODB !== 'false';

if (USE_MONGODB) {
  // Use MongoDB with Mongoose
  module.exports = require('./UserModelMongo');
} else {
  // Use MySQL (original implementation)
  const dbManager = require('../config/database');
  const { hashPassword, verifyPassword, encrypt, decrypt } = require('../utils/encryption');
  const logger = require('../utils/logger');

  class UserModel {
    /**
     * Create a new user
     */
    async createUser(userData) {
      const mysql = dbManager.getMySQL();
      
      try {
        const hashedPassword = await hashPassword(userData.password);
        const encryptedEmail = encrypt(userData.email);
        const encryptedPhone = userData.phone ? encrypt(userData.phone) : null;

        const [result] = await mysql.query(
          `INSERT INTO tbl_users 
           (email, password, phone, first_name, last_name, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            encryptedEmail,
            hashedPassword,
            encryptedPhone,
            userData.first_name,
            userData.last_name,
            userData.status || 'active'
          ]
        );

        return result.insertId;
      } catch (error) {
        logger.error('Create user error:', error);
        throw error;
      }
    }

    /**
     * Authenticate user
     */
    async authenticateUser(email, password) {
      const mysql = dbManager.getMySQL();
      
      try {
        // Get all users and decrypt to find match
        const [users] = await mysql.query(
          'SELECT id, email, password, phone, first_name, last_name, status, is_login, failed_login_attempts FROM tbl_users'
        );

        let user = null;
        for (const u of users) {
          const decryptedEmail = decrypt(u.email);
          if (decryptedEmail === email) {
            user = u;
            break;
          }
        }

        if (!user) {
          return null;
        }

        // Check account lockout
        if (user.failed_login_attempts >= 5) {
          throw new Error('Account locked due to too many failed login attempts');
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          // Increment failed attempts
          await mysql.query(
            'UPDATE tbl_users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
            [user.id]
          );
          return null;
        }

        // Reset failed attempts on successful login
        await mysql.query(
          'UPDATE tbl_users SET failed_login_attempts = 0, is_login = 1, last_login_time = NOW() WHERE id = ?',
          [user.id]
        );

        return {
          id: user.id,
          email: decrypt(user.email),
          phone: user.phone ? decrypt(user.phone) : null,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status
        };
      } catch (error) {
        logger.error('Authenticate user error:', error);
        throw error;
      }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
      const mysql = dbManager.getMySQL();
      
      try {
        const [users] = await mysql.query(
          'SELECT id, email, phone, first_name, last_name, status, created_at FROM tbl_users WHERE id = ?',
          [userId]
        );

        if (!users || users.length === 0) {
          return null;
        }

        const user = users[0];
        return {
          id: user.id,
          email: decrypt(user.email),
          phone: user.phone ? decrypt(user.phone) : null,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
          created_at: user.created_at
        };
      } catch (error) {
        logger.error('Get user error:', error);
        throw error;
      }
    }

    /**
     * Update user login status
     */
    async updateLoginStatus(userId, isLogin) {
      const mysql = dbManager.getMySQL();
      
      try {
        await mysql.query(
          'UPDATE tbl_users SET is_login = ? WHERE id = ?',
          [isLogin ? 1 : 0, userId]
        );
        return true;
      } catch (error) {
        logger.error('Update login status error:', error);
        throw error;
      }
    }

    /**
     * Get user roles
     */
    async getUserRoles(userId) {
      const mysql = dbManager.getMySQL();
      
      try {
        const [roles] = await mysql.query(
          `SELECT r.id, r.name, r.description 
           FROM tbl_roles r
           INNER JOIN tbl_user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = ?`,
          [userId]
        );

        return roles;
      } catch (error) {
        logger.error('Get user roles error:', error);
        throw error;
      }
    }

    /**
     * Get user permissions
     */
    async getUserPermissions(userId) {
      const mysql = dbManager.getMySQL();
      
      try {
        // Check if super admin
        const [superAdmin] = await mysql.query(
          `SELECT r.id FROM tbl_roles r
           INNER JOIN tbl_user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = ? AND r.name = ?`,
          [userId, 'Super Admin']
        );

        if (superAdmin && superAdmin.length > 0) {
          // Return all permissions for super admin
          const [allPermissions] = await mysql.query(
            'SELECT name FROM tbl_permissions'
          );
          return allPermissions.map(p => p.name);
        }

        // Get user permissions
        const [permissions] = await mysql.query(
          `SELECT DISTINCT p.name FROM tbl_permissions p
           INNER JOIN tbl_role_permissions rp ON p.id = rp.permission_id
           INNER JOIN tbl_user_roles ur ON rp.role_id = ur.role_id
           WHERE ur.user_id = ?`,
          [userId]
        );

        return permissions.map(p => p.name);
      } catch (error) {
        logger.error('Get user permissions error:', error);
        throw error;
      }
    }
  }

  module.exports = new UserModel();
}
