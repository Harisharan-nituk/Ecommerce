const express = require('express');
const router = express.Router();
const returnExchangeController = require('../controllers/ReturnExchangeController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', returnExchangeController.createReturnExchange.bind(returnExchangeController));
router.get('/my-returns', returnExchangeController.getUserReturns.bind(returnExchangeController));
router.get('/calculate-refund', returnExchangeController.calculateRefund.bind(returnExchangeController));
router.get('/:id', returnExchangeController.getReturnExchange.bind(returnExchangeController));
router.put('/:id/cancel', returnExchangeController.cancelReturnExchange.bind(returnExchangeController));

// Admin routes
router.get(
  '/admin/all',
  hasPermission('order_read'),
  returnExchangeController.getAllReturns.bind(returnExchangeController)
);
router.put(
  '/admin/:id',
  hasPermission('order_update'),
  returnExchangeController.updateReturnExchange.bind(returnExchangeController)
);

module.exports = router;
