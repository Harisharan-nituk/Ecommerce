const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/PermissionController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication
router.use(authenticate);

// All routes require permission management permission (Super Admin only)
router.use(hasPermission('permission.read'));

// Get all permissions
router.get('/', permissionController.getAllPermissions);

// Get single permission
router.get('/:id', permissionController.getPermissionById);

// Create permission (requires create permission)
router.post('/', hasPermission('permission.create'), permissionController.createPermission);

// Update permission (requires update permission)
router.put('/:id', hasPermission('permission.update'), permissionController.updatePermission);

// Delete permission (requires delete permission)
router.delete('/:id', hasPermission('permission.delete'), permissionController.deletePermission);

module.exports = router;

