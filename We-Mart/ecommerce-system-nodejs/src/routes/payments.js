const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const { authenticate } = require('../middleware/auth');

// Payment routes
router.post('/process', authenticate, paymentController.processPayment.bind(paymentController));

// Webhook routes (public but secured with signature verification)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.handleWebhook.bind(paymentController));

module.exports = router;

