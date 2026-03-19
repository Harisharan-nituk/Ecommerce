const express = require('express');
const router = express.Router();
const adminPayoutController = require('../controllers/AdminPayoutController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// All routes require authentication and admin permissions
router.use(authenticate);
router.use(hasPermission('admin.payout'));

// Admin payout routes
router.get('/payouts/pending', adminPayoutController.getPendingPayouts.bind(adminPayoutController));
router.get('/payouts/summary', adminPayoutController.getPayoutSummary.bind(adminPayoutController));
router.get('/payouts/:id', adminPayoutController.getPayout.bind(adminPayoutController));
router.post('/payouts/:id/approve', adminPayoutController.approvePayout.bind(adminPayoutController));
router.post('/payouts/:id/reject', adminPayoutController.rejectPayout.bind(adminPayoutController));
router.post('/payouts/:id/process', adminPayoutController.processPayout.bind(adminPayoutController));

// Commission rule management
router.get('/commissions/rules', adminPayoutController.getCommissionRules.bind(adminPayoutController));
router.post('/commissions/rules', adminPayoutController.createCommissionRule.bind(adminPayoutController));
router.put('/commissions/rules/:id', adminPayoutController.updateCommissionRule.bind(adminPayoutController));
router.delete('/commissions/rules/:id', adminPayoutController.deleteCommissionRule.bind(adminPayoutController));

module.exports = router;

