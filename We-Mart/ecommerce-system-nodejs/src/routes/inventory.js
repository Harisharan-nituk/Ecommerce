const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/InventoryController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All inventory routes require authentication
router.use(authenticate);

// Get inventory summary (admin/manager)
router.get('/summary', hasPermission('product_read'), inventoryController.getInventorySummary.bind(inventoryController));

// Get inventory list
router.get('/', hasPermission('product_read'), inventoryController.getInventoryList.bind(inventoryController));

// Get low stock products
router.get('/low-stock', hasPermission('product_read'), inventoryController.getLowStockProducts.bind(inventoryController));

// Get product inventory history
router.get('/product/:id/history', hasPermission('product_read'), inventoryController.getProductHistory.bind(inventoryController));

// Update product stock (admin/manager)
router.put('/product/:id/stock', hasPermission('product_update'), inventoryController.updateStock.bind(inventoryController));

// Bulk update stock (admin/manager)
router.put('/bulk-update', hasPermission('product_update'), inventoryController.bulkUpdateStock.bind(inventoryController));

module.exports = router;
