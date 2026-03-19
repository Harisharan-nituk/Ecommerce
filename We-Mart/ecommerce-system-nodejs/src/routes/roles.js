const express = require('express');
const router = express.Router();
const roleController = require('../controllers/RoleController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication
router.use(authenticate);

// All routes require role management permission (Super Admin only)
router.use(hasPermission('role.read'));

// Get all roles
router.get('/', roleController.getAllRoles);

// Get single role
router.get('/:id', roleController.getRoleById);

// Create role (requires create permission)
router.post('/', hasPermission('role.create'), roleController.createRole);

// Update role (requires update permission)
router.put('/:id', hasPermission('role.update'), roleController.updateRole);

// Delete role (requires delete permission)
router.delete('/:id', hasPermission('role.delete'), roleController.deleteRole);

// Assign permissions to role (requires manage permissions)
router.post('/:id/permissions', hasPermission('role.manage_permissions'), roleController.assignPermissions);

module.exports = router;

