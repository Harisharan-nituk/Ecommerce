const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication
router.use(authenticate);

// All routes require user management permission
router.use(hasPermission('user.read'));

// Get all users
router.get('/', userController.getAllUsers.bind(userController));

// Get single user
router.get('/:id', userController.getUserById.bind(userController));

// Update user status
router.put('/:id/status', hasPermission('user.update'), userController.updateUserStatus.bind(userController));

// Assign role to user
router.post('/:id/roles', hasPermission('user.manage_roles'), userController.assignRole.bind(userController));

// Remove role from user
router.delete('/:id/roles', hasPermission('user.manage_roles'), userController.removeRole.bind(userController));

// Update user roles (replace all)
router.put('/:id/roles', hasPermission('user.manage_roles'), userController.updateUserRoles.bind(userController));

// Approve seller application
router.post('/seller-applications/:id/approve', hasPermission('user.update'), userController.approveSellerApplication.bind(userController));

// Reject seller application
router.post('/seller-applications/:id/reject', hasPermission('user.update'), userController.rejectSellerApplication.bind(userController));

module.exports = router;

