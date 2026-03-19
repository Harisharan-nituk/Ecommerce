const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../utils/validators');

// Public routes
router.post('/register', validateRegister, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/validate', authController.validateToken.bind(authController));

// Protected routes
router.get('/permissions', authenticate, authController.getPermissions.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

module.exports = router;

