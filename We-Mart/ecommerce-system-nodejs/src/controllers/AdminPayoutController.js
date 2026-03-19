const payoutStateMachine = require('../services/PayoutStateMachine');
const commissionCalculationService = require('../services/CommissionCalculationService');
const logger = require('../utils/logger');

/**
 * Admin Payout Controller
 * Handles admin payout management endpoints
 */
class AdminPayoutController {
  /**
   * Get pending payouts
   */
  async getPendingPayouts(req, res) {
    try {
      const pendingPayouts = await payoutStateMachine.getPendingPayouts();

      res.json({
        success: true,
        data: pendingPayouts
      });
    } catch (error) {
      logger.error('Get pending payouts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending payouts',
        error: error.message
      });
    }
  }

  /**
   * Get payout by ID
   */
  async getPayout(req, res) {
    try {
      const payoutRequestId = req.params.id;
      const payoutRequest = await payoutStateMachine.getPayoutRequest(payoutRequestId);

      if (!payoutRequest) {
        return res.status(404).json({
          success: false,
          message: 'Payout request not found'
        });
      }

      res.json({
        success: true,
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Get payout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout',
        error: error.message
      });
    }
  }

  /**
   * Approve payout
   */
  async approvePayout(req, res) {
    try {
      const adminId = req.user.id;
      const payoutRequestId = req.params.id;

      const payoutRequest = await payoutStateMachine.approvePayout(payoutRequestId, adminId);

      res.json({
        success: true,
        message: 'Payout approved successfully',
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Approve payout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve payout',
        error: error.message
      });
    }
  }

  /**
   * Reject payout
   */
  async rejectPayout(req, res) {
    try {
      const adminId = req.user.id;
      const payoutRequestId = req.params.id;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const payoutRequest = await payoutStateMachine.rejectPayout(payoutRequestId, reason, adminId);

      res.json({
        success: true,
        message: 'Payout rejected successfully',
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Reject payout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reject payout',
        error: error.message
      });
    }
  }

  /**
   * Process payout
   */
  async processPayout(req, res) {
    try {
      const payoutRequestId = req.params.id;

      const payoutRequest = await payoutStateMachine.processPayout(payoutRequestId);

      res.json({
        success: true,
        message: 'Payout processed successfully',
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Process payout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process payout',
        error: error.message
      });
    }
  }

  /**
   * Get payout summary
   */
  async getPayoutSummary(req, res) {
    try {
      const { PayoutRequest } = require('../models/mongoose');
      
      const totalPayouts = await PayoutRequest.countDocuments();
      const pendingPayouts = await PayoutRequest.countDocuments({ status: { $in: ['pending', 'validated', 'approved'] } });
      const completedPayouts = await PayoutRequest.countDocuments({ status: 'completed' });
      const totalAmount = await PayoutRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      res.json({
        success: true,
        data: {
          total_payouts: totalPayouts,
          pending_payouts: pendingPayouts,
          completed_payouts: completedPayouts,
          total_amount_paid: totalAmount[0]?.total || 0
        }
      });
    } catch (error) {
      logger.error('Get payout summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout summary',
        error: error.message
      });
    }
  }

  /**
   * Get commission rules
   */
  async getCommissionRules(req, res) {
    try {
      const { status } = req.query;
      const { CommissionRule } = require('../models/mongoose');
      
      // Admin can see all rules, optionally filtered by status
      const query = status ? { status } : {};
      const rules = await CommissionRule.find(query).sort({ priority: -1, created_at: -1 });

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      logger.error('Get commission rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get commission rules',
        error: error.message
      });
    }
  }

  /**
   * Create commission rule
   */
  async createCommissionRule(req, res) {
    try {
      const ruleData = {
        ...req.body,
        created_by: req.user.id
      };

      const rule = await commissionCalculationService.createRule(ruleData);

      res.json({
        success: true,
        message: 'Commission rule created successfully',
        data: rule
      });
    } catch (error) {
      logger.error('Create commission rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create commission rule',
        error: error.message
      });
    }
  }

  /**
   * Update commission rule
   */
  async updateCommissionRule(req, res) {
    try {
      const ruleId = req.params.id;
      const updateData = req.body;

      const rule = await commissionCalculationService.updateRule(ruleId, updateData);

      res.json({
        success: true,
        message: 'Commission rule updated successfully',
        data: rule
      });
    } catch (error) {
      logger.error('Update commission rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update commission rule',
        error: error.message
      });
    }
  }

  /**
   * Delete commission rule
   */
  async deleteCommissionRule(req, res) {
    try {
      const ruleId = req.params.id;

      const rule = await commissionCalculationService.deleteRule(ruleId);

      res.json({
        success: true,
        message: 'Commission rule deleted successfully',
        data: rule
      });
    } catch (error) {
      logger.error('Delete commission rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete commission rule',
        error: error.message
      });
    }
  }
}

module.exports = new AdminPayoutController();

