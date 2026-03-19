const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/SellerController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
const { validateProduct } = require('../utils/validators');

// Public route - seller registration
router.post('/register', sellerController.registerAsSeller.bind(sellerController));

// All other seller routes require authentication
router.use(authenticate);

// Seller Dashboard - requires vendor.report.own_sales permission
router.get('/dashboard', hasPermission('vendor.report.own_sales'), sellerController.getDashboardStats.bind(sellerController));

// Seller Products Management - requires vendor.product.manage_own permission
router.get('/products', hasPermission('vendor.product.manage_own'), sellerController.getMyProducts.bind(sellerController));
router.post('/products', hasPermission('vendor.product.manage_own'), validateProduct, sellerController.createProduct.bind(sellerController));
router.put('/products/:id', hasPermission('vendor.product.manage_own'), validateProduct, sellerController.updateProduct.bind(sellerController));
router.delete('/products/:id', hasPermission('vendor.product.manage_own'), sellerController.deleteProduct.bind(sellerController));

// Seller Orders Management - requires vendor.order.manage_own permission
router.get('/orders', hasPermission('vendor.order.manage_own'), sellerController.getMyOrders.bind(sellerController));
router.put('/orders/:id/status', hasPermission('vendor.order.manage_own'), sellerController.updateOrderStatus.bind(sellerController));

module.exports = router;

