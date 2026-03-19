const express = require('express');
const router = express.Router();
const sellerAccountController = require('../controllers/SellerAccountController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication and seller role
router.use(authenticate);
router.use(hasPermission('seller.account'));

// Seller account routes
router.get('/account', sellerAccountController.getAccount.bind(sellerAccountController));
router.get('/account/wallet', sellerAccountController.getWallet.bind(sellerAccountController));
router.put('/account/bank-details', sellerAccountController.updateBankDetails.bind(sellerAccountController));
router.put('/account/payout-settings', sellerAccountController.updatePayoutSettings.bind(sellerAccountController));
router.get('/account/transactions', sellerAccountController.getTransactions.bind(sellerAccountController));

module.exports = router;

