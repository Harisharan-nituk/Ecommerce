const express = require('express');
const router = express.Router();
const brandController = require('../controllers/BrandController');
const { authenticate } = require('../middleware/auth');
const { hasPermission, hasAnyPermission } = require('../middleware/permissions');

/**
 * @route   GET /api/v1/brands
 * @desc    Get all brands (public)
 * @access  Public
 */
router.get('/', brandController.getBrands.bind(brandController));

/**
 * @route   GET /api/v1/brands/with-count
 * @desc    Get all brands with product count
 * @access  Public
 */
router.get('/with-count', brandController.getBrandsWithCount.bind(brandController));

/**
 * @route   GET /api/v1/brands/slug/:slug
 * @desc    Get brand by slug
 * @access  Public
 * @note    Must be before /:id route to avoid route conflicts
 */
router.get('/slug/:slug', brandController.getBrandBySlug.bind(brandController));

/**
 * @route   GET /api/v1/brands/:id
 * @desc    Get brand by ID
 * @access  Public
 */
router.get('/:id', brandController.getBrand.bind(brandController));

/**
 * @route   POST /api/v1/brands
 * @desc    Create a new brand
 * @access  Private (Admin/Seller)
 */
router.post(
  '/',
  authenticate,
  hasAnyPermission('brand_create', 'product_create', 'vendor.product.manage_own'),
  brandController.createBrand.bind(brandController)
);

/**
 * @route   PUT /api/v1/brands/:id
 * @desc    Update brand
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  hasPermission('brand_update'),
  brandController.updateBrand.bind(brandController)
);

/**
 * @route   DELETE /api/v1/brands/:id
 * @desc    Delete brand
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  hasPermission('brand_delete'),
  brandController.deleteBrand.bind(brandController)
);

module.exports = router;
