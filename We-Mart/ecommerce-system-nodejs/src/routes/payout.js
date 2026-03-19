const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/PayoutController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication and seller role
router.use(authenticate);
router.use(hasPermission('seller.payout'));

// Payout routes
router.post('/request', payoutController.requestPayout.bind(payoutController));
router.get('/requests', payoutController.getPayoutRequests.bind(payoutController));
router.get('/request/:id', payoutController.getPayoutRequest.bind(payoutController));
router.post('/request/:id/cancel', payoutController.cancelPayout.bind(payoutController));

module.exports = router;

