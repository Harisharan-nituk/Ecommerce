const express = require('express');
const router = express.Router();
const customerWalletController = require('../controllers/CustomerWalletController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Customer wallet routes
// Order matters: more specific routes first
router.get('/wallet/summary', customerWalletController.getWalletSummary.bind(customerWalletController));
router.get('/wallet/transactions', customerWalletController.getTransactions.bind(customerWalletController));
router.post('/wallet/use', customerWalletController.useWalletBalance.bind(customerWalletController));
router.get('/wallet', customerWalletController.getWallet.bind(customerWalletController));

module.exports = router;

