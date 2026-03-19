const express = require('express');
const router = express.Router();
const sellerReportController = require('../controllers/SellerReportController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication and seller role
router.use(authenticate);
router.use(hasPermission('seller.account'));

// Seller report routes
router.get('/reports/earnings', sellerReportController.getEarningsReport.bind(sellerReportController));
router.get('/reports/commissions', sellerReportController.getCommissionReport.bind(sellerReportController));
router.get('/reports/payouts', sellerReportController.getPayoutReport.bind(sellerReportController));

module.exports = router;

