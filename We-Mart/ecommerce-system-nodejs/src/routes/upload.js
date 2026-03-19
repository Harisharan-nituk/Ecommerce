const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/UploadController');
const { authenticate } = require('../middleware/auth');
const { hasAnyPermission } = require('../middleware/permissions');

// All upload routes require authentication
router.use(authenticate);

// Upload single image
router.post(
  '/image',
  hasAnyPermission('product_create', 'product_update', 'vendor.product.manage_own'),
  uploadController.getUploadMiddleware('image', 1),
  uploadController.uploadImage.bind(uploadController)
);

// Upload multiple images
router.post(
  '/images',
  hasAnyPermission('product_create', 'product_update', 'vendor.product.manage_own'),
  uploadController.getUploadMiddleware('images', 10),
  uploadController.uploadMultipleImages.bind(uploadController)
);

// Delete image
router.delete(
  '/image',
  hasAnyPermission('product_update', 'product_delete', 'vendor.product.manage_own'),
  uploadController.deleteImage.bind(uploadController)
);

module.exports = router;
