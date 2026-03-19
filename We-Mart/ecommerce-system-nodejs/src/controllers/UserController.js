const userModel = require('../models/UserModel');
const { User, SellerApplication, Role, UserRole } = require('../models/mongoose');
const { decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

/**
 * User Controller
 * Handles user management operations for admins
 */
class UserController {
  /**
   * Get all users with seller applications
   */
  async getAllUsers(req, res) {
    try {
      const { status, role, search } = req.query;
      
      // Get all users
      const users = await User.find({}).sort({ created_at: -1 });
      
      // Get all seller applications
      const sellerApplications = await SellerApplication.find({})
        .populate('user_id', 'first_name last_name email')
        .populate('reviewed_by', 'first_name last_name')
        .lean();
      
      // Get all roles
      const roles = await Role.find({ status: 'active' });
      
      // Get user roles
      const userRoles = await UserRole.find({}).populate('role_id', 'name').lean();
      
      // Build user-role mapping
      const userRoleMap = {};
      userRoles.forEach(ur => {
        const userId = ur.user_id.toString();
        if (!userRoleMap[userId]) {
          userRoleMap[userId] = [];
        }
        userRoleMap[userId].push(ur.role_id.name);
      });
      
      // Build seller application map
      const sellerAppMap = {};
      sellerApplications.forEach(app => {
        // Handle both populated and non-populated user_id
        // If populated: app.user_id._id, if not: app.user_id (ObjectId)
        let userId;
        if (app.user_id && app.user_id._id) {
          // Populated user_id
          userId = app.user_id._id.toString();
        } else if (app.user_id) {
          // Non-populated user_id (ObjectId)
          userId = app.user_id.toString();
        } else {
          // Fallback (shouldn't happen)
          logger.warn('Seller application without user_id:', app._id);
          return; // Skip this application
        }
        
        sellerAppMap[userId] = {
          id: app._id.toString(),
          business_name: app.business_name,
          business_address: app.business_address,
          business_pincode: app.business_pincode,
          business_description: app.business_description,
          pan_card: app.pan_card,
          aadhaar: app.aadhaar,
          account_number: app.account_number,
          tax_id: app.tax_id,
          status: app.status,
          reviewed_by: app.reviewed_by ? app.reviewed_by.first_name + ' ' + app.reviewed_by.last_name : null,
          reviewed_at: app.reviewed_at,
          rejection_reason: app.rejection_reason,
          created_at: app.created_at,
        };
      });
      
      // Format users with decrypted data
      const formattedUsers = users.map(user => {
        const userId = user._id.toString();
        const userRolesList = userRoleMap[userId] || [];
        const sellerApp = sellerAppMap[userId] || null;
        
        return {
          id: userId,
          email: user.getDecryptedEmail(),
          phone: user.getDecryptedPhone(),
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`,
          status: user.status,
          roles: userRolesList,
          seller_application: sellerApp,
          created_at: user.created_at,
          last_login_time: user.last_login_time,
        };
      });
      
      // Apply filters
      let filteredUsers = formattedUsers;
      
      if (status) {
        filteredUsers = filteredUsers.filter(u => u.status === status);
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.roles.includes(role));
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.email.toLowerCase().includes(searchLower) ||
          u.first_name.toLowerCase().includes(searchLower) ||
          u.last_name.toLowerCase().includes(searchLower) ||
          (u.seller_application && u.seller_application.business_name.toLowerCase().includes(searchLower))
        );
      }
      
      res.json({
        success: true,
        data: filteredUsers,
        count: filteredUsers.length,
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  /**
   * Get single user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      
      // Get user roles
      const userRoles = await UserRole.find({ user_id: id })
        .populate('role_id', 'name description')
        .lean();
      
      // Get seller application
      const sellerApp = await SellerApplication.findOne({ user_id: id })
        .populate('reviewed_by', 'first_name last_name')
        .lean();
      
      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          email: user.getDecryptedEmail(),
          phone: user.getDecryptedPhone(),
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
          roles: userRoles.map(ur => ({
            id: ur.role_id._id.toString(),
            name: ur.role_id.name,
            description: ur.role_id.description,
          })),
          seller_application: sellerApp ? {
            id: sellerApp._id.toString(),
            business_name: sellerApp.business_name,
            business_address: sellerApp.business_address,
            business_pincode: sellerApp.business_pincode,
            business_description: sellerApp.business_description,
            pan_card: sellerApp.pan_card,
            aadhaar: sellerApp.aadhaar,
            account_number: sellerApp.account_number,
            tax_id: sellerApp.tax_id,
            status: sellerApp.status,
            reviewed_by: sellerApp.reviewed_by ? 
              `${sellerApp.reviewed_by.first_name} ${sellerApp.reviewed_by.last_name}` : null,
            reviewed_at: sellerApp.reviewed_at,
            rejection_reason: sellerApp.rejection_reason,
            created_at: sellerApp.created_at,
          } : null,
          created_at: user.created_at,
          last_login_time: user.last_login_time,
        },
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message,
      });
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      
      user.status = status;
      user.updated_at = new Date();
      await user.save();
      
      res.json({
        success: true,
        message: 'User status updated successfully',
      });
    } catch (error) {
      logger.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message,
      });
    }
  }

  /**
   * Approve seller application
   */
  async approveSellerApplication(req, res) {
    try {
      const { id } = req.params; // application ID
      const { role_id } = req.body; // Role ID to assign (optional, defaults to Vendor/Seller)
      const adminId = req.user.id;
      
      const application = await SellerApplication.findById(id)
        .populate('user_id');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Seller application not found',
        });
      }
      
      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Application is already ${application.status}`,
        });
      }
      
      // Get the role to assign
      let sellerRole;
      if (role_id) {
        // Use the provided role_id
        sellerRole = await Role.findById(role_id);
        if (!sellerRole) {
          return res.status(404).json({
            success: false,
            message: 'Role not found',
          });
        }
        if (sellerRole.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Cannot assign inactive role',
          });
        }
      } else {
        // Default to Vendor/Seller role if no role_id provided
        sellerRole = await Role.findOne({ name: 'Vendor/Seller' });
        if (!sellerRole) {
          // Create Vendor/Seller role if it doesn't exist
          const now = new Date();
          sellerRole = new Role({
            name: 'Vendor/Seller',
            description: 'Vendor/Seller role for managing own products and orders',
            status: 'active',
            created_at: now,
            updated_at: now,
          });
          await sellerRole.save();
          logger.info('Created Vendor/Seller role automatically');
        }
      }
      
      // Update application status
      application.status = 'approved';
      application.reviewed_by = adminId;
      application.reviewed_at = new Date();
      application.updated_at = new Date();
      await application.save();
      
      // Activate the user
      const user = await User.findById(application.user_id._id);
      if (user) {
        user.status = 'active';
        user.updated_at = new Date();
        await user.save();
      }
      
      // Assign role to user (check if already assigned)
      const existingUserRole = await UserRole.findOne({
        user_id: application.user_id._id,
        role_id: sellerRole._id,
      });
      
      if (!existingUserRole) {
        const userRole = new UserRole({
          user_id: application.user_id._id,
          role_id: sellerRole._id,
          created_at: new Date(),
        });
        await userRole.save();
      }
      
      res.json({
        success: true,
        message: 'Seller application approved successfully',
        data: {
          applicationId: application._id.toString(),
          userId: application.user_id._id.toString(),
          roleId: sellerRole._id.toString(),
          roleName: sellerRole.name,
        },
      });
    } catch (error) {
      logger.error('Approve seller application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve seller application',
        error: error.message,
      });
    }
  }

  /**
   * Reject seller application
   */
  async rejectSellerApplication(req, res) {
    try {
      const { id } = req.params; // application ID
      const { reason } = req.body;
      const adminId = req.user.id;
      
      const application = await SellerApplication.findById(id);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Seller application not found',
        });
      }
      
      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Application is already ${application.status}`,
        });
      }
      
      // Update application status
      application.status = 'rejected';
      application.reviewed_by = adminId;
      application.reviewed_at = new Date();
      application.rejection_reason = reason || 'Application rejected by admin';
      application.updated_at = new Date();
      await application.save();
      
      res.json({
        success: true,
        message: 'Seller application rejected',
      });
    } catch (error) {
      logger.error('Reject seller application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject seller application',
        error: error.message,
      });
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(req, res) {
    try {
      const { id } = req.params; // user ID
      const { role_id } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      
      const role = await Role.findById(role_id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }
      
      // Check if role already assigned
      const existing = await UserRole.findOne({
        user_id: id,
        role_id: role_id,
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Role already assigned to user',
        });
      }
      
      // Assign role
      const userRole = new UserRole({
        user_id: id,
        role_id: role_id,
        created_at: new Date(),
      });
      await userRole.save();
      
      res.json({
        success: true,
        message: 'Role assigned successfully',
      });
    } catch (error) {
      logger.error('Assign role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role',
        error: error.message,
      });
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(req, res) {
    try {
      const { id } = req.params; // user ID
      const { role_id } = req.body;
      
      await UserRole.deleteOne({
        user_id: id,
        role_id: role_id,
      });
      
      res.json({
        success: true,
        message: 'Role removed successfully',
      });
    } catch (error) {
      logger.error('Remove role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role',
        error: error.message,
      });
    }
  }

  /**
   * Update user roles (replace all roles)
   */
  async updateUserRoles(req, res) {
    try {
      const { id } = req.params; // user ID
      const { role_ids } = req.body; // Array of role IDs
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Validate role_ids is an array
      if (!Array.isArray(role_ids)) {
        return res.status(400).json({
          success: false,
          message: 'role_ids must be an array',
        });
      }

      // Validate all roles exist
      if (role_ids.length > 0) {
        const roles = await Role.find({ _id: { $in: role_ids } });
        if (roles.length !== role_ids.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more roles not found',
          });
        }
      }

      // Remove all existing roles
      await UserRole.deleteMany({ user_id: id });

      // Add new roles
      if (role_ids.length > 0) {
        const userRoles = role_ids.map(role_id => ({
          user_id: id,
          role_id: role_id,
          created_at: new Date(),
        }));
        await UserRole.insertMany(userRoles);
      }

      res.json({
        success: true,
        message: 'User roles updated successfully',
        data: {
          userId: id,
          roleCount: role_ids.length,
        },
      });
    } catch (error) {
      logger.error('Update user roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user roles',
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();

