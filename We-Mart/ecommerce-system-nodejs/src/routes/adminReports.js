const express = require('express');
const router = express.Router();
const adminReportController = require('../controllers/AdminReportController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication and admin role
router.use(authenticate);
router.use(hasPermission('admin.reports'));

// Admin report routes
router.get('/payouts/summary', adminReportController.getPayoutSummary.bind(adminReportController));
router.get('/payouts/analytics', adminReportController.getPayoutAnalytics.bind(adminReportController));
router.get('/commissions/report', adminReportController.getCommissionReport.bind(adminReportController));

module.exports = router;

