const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 255 })
    .withMessage('Category name too long'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('level')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Level must be between 0 and 2')
];

// Public routes
router.get('/tree', categoryController.getCategoryTree.bind(categoryController));
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/slug/:slug', categoryController.getCategoryBySlug.bind(categoryController));
router.get('/:id', categoryController.getCategory.bind(categoryController));

// Protected routes (require authentication)
router.post('/', authenticate, validateCategory, categoryController.createCategory.bind(categoryController));
router.put('/:id', authenticate, validateCategory, categoryController.updateCategory.bind(categoryController));
router.delete('/:id', authenticate, categoryController.deleteCategory.bind(categoryController));

module.exports = router;
