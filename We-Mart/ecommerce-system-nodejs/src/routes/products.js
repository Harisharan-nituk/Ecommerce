const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const uploadController = require('../controllers/UploadController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
const { validateProduct } = require('../utils/validators');

// Public routes
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  hasPermission('product_create'),
  uploadController.getUploadMiddleware('image', 1),
  validateProduct,
  productController.createProduct.bind(productController)
);
router.put(
  '/:id',
  authenticate,
  hasPermission('product_update'),
  uploadController.getUploadMiddleware('image', 1),
  productController.updateProduct.bind(productController)
);
router.delete('/:id', authenticate, hasPermission('product_delete'), productController.deleteProduct.bind(productController));

module.exports = router;

