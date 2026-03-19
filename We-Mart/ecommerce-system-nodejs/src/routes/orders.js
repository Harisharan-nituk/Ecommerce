const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
const { validateOrder } = require('../utils/validators');

// User routes
router.post('/', authenticate, validateOrder, orderController.createOrder.bind(orderController));
router.get('/', authenticate, orderController.getUserOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrder.bind(orderController));
router.get('/:id/tracking', authenticate, orderController.getOrderTracking.bind(orderController));

// Admin routes
router.get('/admin/all', authenticate, hasPermission('order_view_all'), orderController.getAllOrders.bind(orderController));
router.put('/:id/status', authenticate, hasPermission('order_update'), orderController.updateOrderStatus.bind(orderController));
router.post('/:id/tracking', authenticate, hasPermission('order_update'), orderController.addTrackingUpdate.bind(orderController));

module.exports = router;

