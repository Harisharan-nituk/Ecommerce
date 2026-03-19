const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { validateToken, optionalTokenValidation } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
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
 * User Management Routes
 * All routes require authentication except create (for registration)
 */

// Create user (public - for registration)
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  ],
  validate,
  userController.createUser
);

// Get all users (requires authentication)
router.get(
  '/',
  optionalTokenValidation,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  ],
  validate,
  userController.getAllUsers
);

// Get user by iam_uuid
router.get(
  '/iam-uuid/:iam_uuid',
  optionalTokenValidation,
  [
    param('iam_uuid').isUUID().withMessage('Valid IAM UUID is required'),
  ],
  validate,
  userController.getUserByIamUUID
);

// Get user by mobile number
router.get(
  '/mobile/:mobile',
  optionalTokenValidation,
  [
    param('mobile').notEmpty().withMessage('Mobile number is required'),
  ],
  validate,
  userController.getUserByMobile
);

// Get user by email
router.get(
  '/email/:email',
  optionalTokenValidation,
  [
    param('email').isEmail().withMessage('Valid email is required'),
  ],
  validate,
  userController.getUserByEmail
);

// Update user (requires authentication)
router.put(
  '/:iam_uuid',
  validateToken,
  [
    param('iam_uuid').isUUID().withMessage('Valid IAM UUID is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  ],
  validate,
  userController.updateUser
);

// Delete user (requires authentication)
router.delete(
  '/:iam_uuid',
  validateToken,
  [
    param('iam_uuid').isUUID().withMessage('Valid IAM UUID is required'),
  ],
  validate,
  userController.deleteUser
);

module.exports = router;

