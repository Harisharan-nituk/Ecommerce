const { User, Role, Permission, UserRole, RolePermission } = require('./mongoose');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');
const { hashPassword, verifyPassword } = require('../utils/encryption');

/**
 * User Model using MongoDB with Mongoose ORM
 * Structure matches MySQL version for easy migration
 * Optimized: Permissions fetched from DB based on roles
 */
class UserModelMongo {
  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await hashPassword(userData.password);
      const encryptedEmail = encrypt(userData.email);
      const encryptedPhone = userData.phone ? encrypt(userData.phone) : null;
      
      const user = await User.createUser({
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || null,
        first_name: userData.first_name,
        last_name: userData.last_name,
        status: userData.status || 'active',
        is_email_verified: false,
        is_phone_verified: false,
      });

      return user._id.toString();
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    try {
      // Find user by email (decrypted)
      const user = await User.findByEmail(email);

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
        user.failed_login_attempts += 1;
        await user.save();
        return null;
      }

      // Reset failed attempts on successful login
      user.failed_login_attempts = 0;
      user.is_login = true;
      user.last_login_time = new Date();
      await user.save();

      return {
        id: user._id.toString(),
        email: user.getDecryptedEmail(),
        phone: user.getDecryptedPhone(),
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
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
    try {
      const user = await User.findById(userId);

      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.getDecryptedEmail(),
        phone: user.getDecryptedPhone(),
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        created_at: user.created_at,
      };
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.getDecryptedEmail(),
        phone: user.getDecryptedPhone(),
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        created_at: user.created_at,
      };
    } catch (error) {
      logger.error('Get user by email error:', error);
      throw error;
    }
  }

  /**
   * Update user login status
   */
  async updateLoginStatus(userId, isLogin) {
    try {
      await User.findByIdAndUpdate(userId, {
        is_login: isLogin,
        last_login_time: isLogin ? new Date() : null,
      });
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
    try {
      const userRoles = await UserRole.find({ user_id: userId })
        .populate('role_id', 'name description status');

      return userRoles.map(ur => ({
        id: ur.role_id._id.toString(),
        name: ur.role_id.name,
        description: ur.role_id.description,
      }));
    } catch (error) {
      logger.error('Get user roles error:', error);
      throw error;
    }
  }

  /**
   * Get user permissions from database based on roles
   * This is called after login and on permission checks
   * Permissions are NOT stored in JWT, always fetched from DB
   */
  async getUserPermissions(userId) {
    try {
      // Get user roles
      const userRoles = await UserRole.find({ user_id: userId })
        .populate('role_id', 'name');

      if (!userRoles || userRoles.length === 0) {
        return [];
      }

      const roleIds = userRoles.map(ur => ur.role_id._id);
      const roleNames = userRoles.map(ur => ur.role_id.name);

      // Check if user is super admin
      const isSuperAdmin = roleNames.includes('Super Admin');

      if (isSuperAdmin) {
        // Return all permissions for super admin
        const allPermissions = await Permission.find({ status: 'active' });
        return allPermissions.map(p => p.name);
      }

      // Get permissions for user's roles
      const rolePermissions = await RolePermission.find({
        role_id: { $in: roleIds },
      }).populate('permission_id', 'name status');

      // Filter only active permissions and extract names
      const permissions = rolePermissions
        .filter(rp => rp.permission_id.status === 'active')
        .map(rp => rp.permission_id.name);
      
      // Remove duplicates
      return [...new Set(permissions)];
    } catch (error) {
      logger.error('Get user permissions error:', error);
      throw error;
    }
  }

  /**
   * Get user permissions by role names (optimized for JWT roles)
   * Used when we only have role names from JWT
   */
  async getPermissionsByRoleNames(roleNames) {
    try {
      if (!roleNames || roleNames.length === 0) {
        return [];
      }

      // Check if super admin
      if (roleNames.includes('Super Admin')) {
        const allPermissions = await Permission.find({ status: 'active' });
        return allPermissions.map(p => p.name);
      }

      // Get roles by names
      const roles = await Role.find({ 
        name: { $in: roleNames },
        status: 'active'
      });

      if (!roles || roles.length === 0) {
        return [];
      }

      const roleIds = roles.map(r => r._id);

      // Get permissions for these roles
      const rolePermissions = await RolePermission.find({
        role_id: { $in: roleIds },
      }).populate('permission_id', 'name status');

      const permissions = rolePermissions
        .filter(rp => rp.permission_id.status === 'active')
        .map(rp => rp.permission_id.name);
      
      return [...new Set(permissions)];
    } catch (error) {
      logger.error('Get permissions by role names error:', error);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, roleId) {
    try {
      const userRole = await UserRole.findOne({
        user_id: userId,
        role_id: roleId,
      });

      if (userRole) {
        return userRole; // Already assigned
      }

      return await UserRole.create({
        user_id: userId,
        role_id: roleId,
      });
    } catch (error) {
      logger.error('Assign role error:', error);
      throw error;
    }
  }

  /**
   * Create or get role by name
   */
  async getOrCreateRole(roleName, description = null) {
    try {
      let role = await Role.findOne({ name: roleName });
      
      if (!role) {
        role = await Role.create({
          name: roleName,
          description: description || `${roleName} role`,
          status: 'active',
        });
      }

      return role;
    } catch (error) {
      logger.error('Get or create role error:', error);
      throw error;
    }
  }
}

module.exports = new UserModelMongo();
