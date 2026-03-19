const { Role, Permission, RolePermission, UserRole } = require('../models/mongoose');
const logger = require('../utils/logger');

class RoleController {
  /**
   * Get all roles
   */
  async getAllRoles(req, res) {
    try {
      const roles = await Role.find({ status: 'active' }).sort({ name: 1 });
      
      // Get permissions for each role
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const rolePermissions = await RolePermission.find({ role_id: role._id })
            .populate('permission_id', 'name description module');
          
          // Filter out any null permissions and map to clean format
          const permissions = rolePermissions
            .filter(rp => rp.permission_id && rp.permission_id._id) // Only include valid permissions
            .map(rp => ({
              id: rp.permission_id._id.toString(),
              name: rp.permission_id.name,
              description: rp.permission_id.description || '',
              module: rp.permission_id.module || '',
            }));
          
          return {
            id: role._id.toString(),
            name: role.name,
            description: role.description,
            status: role.status,
            permissions: permissions, // Only assigned permissions
            created_at: role.created_at,
          };
        })
      );

      res.json({
        success: true,
        data: rolesWithPermissions,
      });
    } catch (error) {
      logger.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message,
      });
    }
  }

  /**
   * Get single role by ID
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      
      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      const rolePermissions = await RolePermission.find({ role_id: role._id })
        .populate('permission_id', 'name description module');

      res.json({
        success: true,
        data: {
          id: role._id.toString(),
          name: role.name,
          description: role.description,
          status: role.status,
          permissions: rolePermissions.map(rp => ({
            id: rp.permission_id._id.toString(),
            name: rp.permission_id.name,
            description: rp.permission_id.description,
            module: rp.permission_id.module,
          })),
          created_at: role.created_at,
        },
      });
    } catch (error) {
      logger.error('Get role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message,
      });
    }
  }

  /**
   * Create new role
   */
  async createRole(req, res) {
    try {
      const { name, description, permissions } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Role name is required',
        });
      }

      // Check if role already exists
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role with this name already exists',
        });
      }

      // Create role - manually set timestamps
      const now = new Date();
      const role = new Role({
        name,
        description: description || `${name} role`,
        status: 'active',
        created_at: now,
        updated_at: now,
      });
      await role.save();

      // Assign permissions if provided
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        for (const permId of permissions) {
          const permission = await Permission.findById(permId);
          if (permission) {
            // Use new and save to avoid any pre-save hook issues
            const rolePermission = new RolePermission({
              role_id: role._id,
              permission_id: permission._id,
              created_at: new Date(),
            });
            await rolePermission.save();
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: {
          id: role._id.toString(),
          name: role.name,
          description: role.description,
        },
      });
    } catch (error) {
      logger.error('Create role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message,
      });
    }
  }

  /**
   * Update role
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Check if name is being changed and if it conflicts
      if (name && name !== role.name) {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
          return res.status(400).json({
            success: false,
            message: 'Role with this name already exists',
          });
        }
      }

      // Update role - manually set updated_at
      if (name) role.name = name;
      if (description !== undefined) role.description = description;
      if (status) role.status = status;
      role.updated_at = new Date();
      await role.save();

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: {
          id: role._id.toString(),
          name: role.name,
          description: role.description,
          status: role.status,
        },
      });
    } catch (error) {
      logger.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message,
      });
    }
  }

  /**
   * Delete role
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Check if role is assigned to any users
      const userRoles = await UserRole.find({ role_id: id });
      if (userRoles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role. It is assigned to users.',
        });
      }

      // Delete role permissions
      await RolePermission.deleteMany({ role_id: id });

      // Delete role
      await Role.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      logger.error('Delete role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message,
      });
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be an array',
        });
      }

      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Remove all existing permissions
      await RolePermission.deleteMany({ role_id: id });

      // Add new permissions
      const assignedPermissions = [];
      for (const permId of permissions) {
        const permission = await Permission.findById(permId);
        if (permission) {
          // Use new and save to avoid any pre-save hook issues
          const rolePermission = new RolePermission({
            role_id: id,
            permission_id: permission._id,
            created_at: new Date(),
          });
          await rolePermission.save();
          assignedPermissions.push(permission.name);
        }
      }

      res.json({
        success: true,
        message: 'Permissions assigned successfully',
        data: {
          roleId: id,
          permissions: assignedPermissions,
        },
      });
    } catch (error) {
      logger.error('Assign permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign permissions',
        error: error.message,
      });
    }
  }
}

module.exports = new RoleController();

