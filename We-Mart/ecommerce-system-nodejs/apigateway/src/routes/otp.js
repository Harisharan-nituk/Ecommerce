const express = require('express');
const router = express.Router();
const otpController = require('../controllers/OTPController');
const { body, param } = require('express-validator');
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
 * OTP Management Routes
 */

// Send OTP
router.post(
  '/send',
  [
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('otp_type').optional().isIn(['1', '2', '3', '4']).withMessage('Invalid OTP type'),
  ],
  validate,
  otpController.sendOTP
);

// Verify OTP
router.post(
  '/verify',
  [
    body('auth_code').notEmpty().withMessage('Auth code is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  validate,
  otpController.verifyOTP
);

// Resend OTP
router.post(
  '/resend',
  [
    body('auth_code').notEmpty().withMessage('Auth code is required'),
  ],
  validate,
  otpController.resendOTP
);

// Get OTP by auth_token
router.get(
  '/token/:auth_token',
  [
    param('auth_token').notEmpty().withMessage('Auth token is required'),
  ],
  validate,
  otpController.getOTPByToken
);

module.exports = router;

