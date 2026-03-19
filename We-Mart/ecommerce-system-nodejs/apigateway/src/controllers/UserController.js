const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/encryption');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class UserController {
  /**
   * Create a new user with iam_uuid
   * iam_uuid is automatically generated for unique user identification
   */
  async createUser(req, res) {
    try {
      const {
        email,
        password,
        mobile_number,
        phone, // Accept phone as well
        role_id,
        first_name,
        last_name,
        user_name,
        emp_code,
        user_type,
      } = req.body;

      // Use mobile_number or phone (phone is mapped from frontend)
      const finalMobile = mobile_number || phone;

      // Validation - mobile_number is optional for registration
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Check if user already exists by email
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Check if user already exists by mobile (if provided)
      if (finalMobile) {
        const existingUserByMobile = await User.findByMobile(finalMobile);
        if (existingUserByMobile) {
          return res.status(400).json({
            success: false,
            message: 'User with this mobile number already exists',
          });
        }
      } else {
        // Mobile is optional for registration, but log a warning
        logger.warn('User registration without mobile number');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Get default Customer role if no role_id provided
      let defaultRoleId = role_id;
      if (!defaultRoleId) {
        try {
          const Role = require('../models/Role');
          const customerRole = await Role.findOne({ name: 'Customer' });
          if (customerRole) {
            defaultRoleId = customerRole._id;
          }
        } catch (error) {
          logger.warn('Could not find Customer role, creating user without role');
        }
      }

      // Create user with iam_uuid (automatically generated)
      const user = await User.createUser({
        email,
        password: hashedPassword,
        mobile_number: finalMobile || null,
        role_id: defaultRoleId || null,
        first_name: first_name || null,
        last_name: last_name || null,
        user_name: user_name || email.split('@')[0],
        emp_code: emp_code || null,
        user_type: user_type || 'customer',
        status: 'active',
      });

      logger.info(`User created: ${user.iam_uuid} (${email})`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id?.toString(),
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create user',
      });
    }
  }

  /**
   * Get user by IAM UUID (for reference - not used in createUser)
   */
  async getUserByIamUuid(req, res) {
    try {
      const { iam_uuid } = req.params;
      const user = await User.findOne({ iam_uuid }).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id?.toString(),
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Get user by email (for reference - not used in createUser)
   */
  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id?.toString(),
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Error getting user by email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Get user by mobile (for reference - not used in createUser)
   */
  async getUserByMobile(req, res) {
    try {
      const { mobile } = req.params;
      const user = await User.findByMobile(mobile);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id?.toString(),
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Error getting user by mobile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
      });
    }
  }

  /**
   * List users (for reference - not used in createUser)
   */
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 10, status, role_id } = req.query;
      const query = {};
      if (status) query.status = status;
      if (role_id) query.role_id = role_id;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [users, total] = await Promise.all([
        User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ created_at: -1 }),
        User.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          items: users.map(user => ({
            id: user._id.toString(),
            iam_uuid: user.iam_uuid,
            email: user.getDecryptedEmail(),
            mobile_number: user.getDecryptedMobile(),
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            role_id: user.role_id?.toString(),
            status: user.status,
            created_at: user.created_at,
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      logger.error('Error listing users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list users',
      });
    }
  }

  /**
   * Update user (for reference - not used in createUser)
   */
  async updateUser(req, res) {
    try {
      const { iam_uuid } = req.params;
      const updateData = req.body;

      // Handle password hashing if provided
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      const user = await User.findOneAndUpdate(
        { iam_uuid },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id?.toString(),
          status: user.status,
        },
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * Delete user (for reference - not used in createUser)
   */
  async deleteUser(req, res) {
    try {
      const { iam_uuid } = req.params;
      const user = await User.findOneAndUpdate(
        { iam_uuid },
        { status: 'inactive', is_deleted: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete user',
      });
    }
  }
}

module.exports = new UserController();${user.getDecryptedEmail()})`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id,
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }

  /**
   * Get user by iam_uuid
   */
  async getUserByIamUUID(req, res) {
    try {
      const { iam_uuid } = req.params;

      const user = await User.findByIamUUID(iam_uuid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id,
          status: user.status,
          user_type: user.user_type,
          emp_code: user.emp_code,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Get user by iam_uuid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message,
      });
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id,
          status: user.status,
        },
      });
    } catch (error) {
      logger.error('Get user by email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message,
      });
    }
  }

  /**
   * Get user by mobile number
   */
  async getUserByMobile(req, res) {
    try {
      const { mobile } = req.params;

      const user = await User.findByMobile(mobile);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
          status: user.status,
        },
      });
    } catch (error) {
      logger.error('Get user by mobile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error.message,
      });
    }
  }

  /**
   * Get all users (with pagination)
   */
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { status, user_type, role_id } = req.query;

      // Build query
      const query = {};
      if (status) query.status = status;
      if (user_type) query.user_type = user_type;
      if (role_id) query.role_id = role_id;

      const users = await User.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: users.map(user => ({
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id,
          status: user.status,
          user_type: user.user_type,
          created_at: user.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message,
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { iam_uuid } = req.params;
      const updateData = req.body;

      const user = await User.findByIamUUID(iam_uuid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Don't allow updating iam_uuid
      delete updateData.iam_uuid;

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      // Encrypt email/mobile if provided
      if (updateData.email) {
        updateData.email = require('../utils/encryption').encrypt(updateData.email);
      }
      if (updateData.mobile_number) {
        updateData.mobile_number = require('../utils/encryption').encrypt(updateData.mobile_number);
      }

      Object.assign(user, updateData);
      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
          status: user.status,
        },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }

  /**
   * Delete user (soft delete - set status to inactive)
   */
  async deleteUser(req, res) {
    try {
      const { iam_uuid } = req.params;

      const user = await User.findByIamUUID(iam_uuid);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Soft delete
      user.status = 'inactive';
      await user.save();

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
