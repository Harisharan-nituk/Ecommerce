const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const otpController = require('../controllers/OTPController');
const userController = require('../controllers/UserController');
const { validateToken, optionalTokenValidation } = require('../middleware/auth');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Validation middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Authentication Routes
 */

// Register (Signup) - Public endpoint
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    body('mobile_number').optional().isMobilePhone('any').withMessage('Valid mobile number is required'),
  ],
  validate,
  async (req, res, next) => {
    // Map phone to mobile_number for UserController
    if (req.body.phone && !req.body.mobile_number) {
      req.body.mobile_number = req.body.phone;
    }
    // Also accept mobile_number directly
    if (req.body.mobile_number && !req.body.phone) {
      req.body.phone = req.body.mobile_number;
    }
    next();
  },
  userController.createUser.bind(userController)
);

// Login with Email/Username and Password
router.post(
  '/login',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.loginWithPassword
);

// Login with Mobile and OTP
router.post(
  '/login/otp',
  [
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('auth_code').optional().isUUID().withMessage('Valid auth code is required'),
  ],
  validate,
  authController.loginWithOTP
);

// Send OTP for login
router.post(
  '/otp/send',
  [
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('otp_type').optional().isIn(['1', '2', '3', '4']).withMessage('Invalid OTP type'),
  ],
  validate,
  otpController.sendOTP
);

// Verify OTP (standalone)
router.post(
  '/otp/verify',
  [
    body('auth_code').notEmpty().withMessage('Auth code is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  validate,
  otpController.verifyOTP
);

// Resend OTP
router.post(
  '/otp/resend',
  [
    body('auth_code').notEmpty().withMessage('Auth code is required'),
  ],
  validate,
  otpController.resendOTP
);

// Logout (requires authentication)
router.post('/logout', validateToken, authController.logout);

// Get current user profile (requires authentication)
router.get('/profile', validateToken, authController.getProfile);

module.exports = router;

