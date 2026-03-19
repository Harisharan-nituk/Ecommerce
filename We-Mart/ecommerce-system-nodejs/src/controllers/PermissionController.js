const { Permission } = require('../models/mongoose');
const logger = require('../utils/logger');

class PermissionController {
  /**
   * Get all permissions
   */
  async getAllPermissions(req, res) {
    try {
      const { module } = req.query;
      
      const query = { status: 'active' };
      if (module) {
        query.module = module;
      }

      const permissions = await Permission.find(query).sort({ module: 1, name: 1 });

      // Group by module
      const groupedPermissions = permissions.reduce((acc, perm) => {
        const module = perm.module || 'other';
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push({
          id: perm._id.toString(),
          name: perm.name,
          description: perm.description,
          module: perm.module,
          status: perm.status,
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          permissions: permissions.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            module: p.module,
            status: p.status,
          })),
          grouped: groupedPermissions,
        },
      });
    } catch (error) {
      logger.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message,
      });
    }
  }

  /**
   * Get single permission by ID
   */
  async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      
      const permission = await Permission.findById(id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: permission._id.toString(),
          name: permission.name,
          description: permission.description,
          module: permission.module,
          status: permission.status,
          created_at: permission.created_at,
        },
      });
    } catch (error) {
      logger.error('Get permission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permission',
        error: error.message,
      });
    }
  }

  /**
   * Create new permission
   */
  async createPermission(req, res) {
    try {
      const { name, description, module } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Permission name is required',
        });
      }

      // Check if permission already exists
      const existingPermission = await Permission.findOne({ name });
      if (existingPermission) {
        return res.status(400).json({
          success: false,
          message: 'Permission with this name already exists',
        });
      }

      const permission = await Permission.create({
        name,
        description: description || `${name} permission`,
        module: module || 'other',
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: {
          id: permission._id.toString(),
          name: permission.name,
          description: permission.description,
          module: permission.module,
        },
      });
    } catch (error) {
      logger.error('Create permission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create permission',
        error: error.message,
      });
    }
  }

  /**
   * Update permission
   */
  async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const { name, description, module, status } = req.body;

      const permission = await Permission.findById(id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      // Check if name is being changed and if it conflicts
      if (name && name !== permission.name) {
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
          return res.status(400).json({
            success: false,
            message: 'Permission with this name already exists',
          });
        }
      }

      // Update permission
      if (name) permission.name = name;
      if (description !== undefined) permission.description = description;
      if (module) permission.module = module;
      if (status) permission.status = status;
      await permission.save();

      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: {
          id: permission._id.toString(),
          name: permission.name,
          description: permission.description,
          module: permission.module,
          status: permission.status,
        },
      });
    } catch (error) {
      logger.error('Update permission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update permission',
        error: error.message,
      });
    }
  }

  /**
   * Delete permission
   */
  async deletePermission(req, res) {
    try {
      const { id } = req.params;

      const permission = await Permission.findById(id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      // Check if permission is assigned to any roles
      const { RolePermission } = require('../models/mongoose');
      const rolePermissions = await RolePermission.find({ permission_id: id });
      if (rolePermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete permission. It is assigned to roles.',
        });
      }

      await Permission.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Permission deleted successfully',
      });
    } catch (error) {
      logger.error('Delete permission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete permission',
        error: error.message,
      });
    }
  }
}

module.exports = new PermissionController();

