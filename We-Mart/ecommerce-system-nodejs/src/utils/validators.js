const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  handleValidationErrors
];

/**
 * User login validation
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Product validation
 */
const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 255 })
    .withMessage('Product name too long'),
  body('description')
    .optional()
    .trim(),
  body('price')
    .custom((value) => {
      // Accept number or string that can be converted to float
      if (value === '' || value === null || value === undefined) {
        return false; // Price is required
      }
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue >= 0;
    })
    .withMessage('Valid price (number >= 0) is required'),
  body('stock')
    .optional()
    .custom((value) => {
      // Allow empty, null, undefined, or valid integer >= 0
      if (value === '' || value === null || value === undefined) {
        return true; // Will default to 0 in model
      }
      const numValue = parseInt(value);
      return !isNaN(numValue) && numValue >= 0;
    })
    .withMessage('Stock must be a valid integer >= 0'),
  body('category_id')
    .optional({ nullable: true, checkFalsy: true }),
  body('category')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty, null, undefined, or valid category
      if (!value || value === '' || value === null || value === undefined) {
        return true;
      }
      const validCategories = ['men', 'women', 'kids', 'home-living', 'beauty', 'electronics'];
      return validCategories.includes(value.trim());
    })
    .withMessage('If provided, category must be one of: men, women, kids, home-living, beauty, electronics'),
  body('subcategory')
    .optional()
    .trim(),
  body('brand')
    .optional()
    .trim(),
  body('brand_id')
    .optional({ nullable: true, checkFalsy: true }),
  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty, null, undefined, or valid URL
      if (!value || value === '' || value === null || value === undefined) {
        return true;
      }
      // If provided, must be a valid URL
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage('If provided, image URL must be valid'),
  body('image_urls')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty, null, undefined, or array
      if (!value || value === null || value === undefined) {
        return true;
      }
      // If provided, must be an array
      return Array.isArray(value);
    })
    .withMessage('If provided, image URLs must be an array'),
  body('sku')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Valid status is required'),
  handleValidationErrors
];

/**
 * Cart validation
 */
const validateCartItem = [
  body('product_id')
    .isInt()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Valid quantity is required'),
  handleValidationErrors
];

/**
 * Order validation
 */
const validateOrder = [
  body('shipping_address_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Valid shipping address ID is required'),
  body('payment_method')
    .optional()
    .isIn(['stripe', 'paypal', 'razorpay', 'cod', 'card', 'upi', 'wallet'])
    .withMessage('Valid payment method is required'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  body('items.*.product_id')
    .optional()
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('shipping_address')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem,
  validateOrder
};

