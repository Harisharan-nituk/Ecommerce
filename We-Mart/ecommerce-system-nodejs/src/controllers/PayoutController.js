const payoutStateMachine = require('../services/PayoutStateMachine');
const sellerWalletService = require('../services/SellerWalletService');
const logger = require('../utils/logger');

/**
 * Payout Controller
 * Handles seller payout request endpoints
 */
class PayoutController {
  /**
   * Request payout
   */
  async requestPayout(req, res) {
    try {
      const sellerId = req.user.id;
      const { amount, payout_method, bank_details } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payout amount'
        });
      }

      // Get wallet to check minimum payout
      const wallet = await sellerWalletService.getWallet(sellerId);
      const minPayout = wallet.payout_settings.minimum_payout || 1000;

      if (amount < minPayout) {
        return res.status(400).json({
          success: false,
          message: `Minimum payout amount is ₹${minPayout}`
        });
      }

      // Use bank details from wallet if not provided
      const finalBankDetails = bank_details || wallet.bank_details;

      if (!finalBankDetails || !finalBankDetails.account_number || !finalBankDetails.ifsc_code) {
        return res.status(400).json({
          success: false,
          message: 'Bank details are required. Please update your bank details first.'
        });
      }

      // Create payout request
      const payoutRequest = await payoutStateMachine.initiatePayout(
        sellerId,
        amount,
        payout_method || 'bank_transfer',
        finalBankDetails
      );

      res.json({
        success: true,
        message: 'Payout request created successfully',
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Request payout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payout request',
        error: error.message
      });
    }
  }

  /**
   * Get payout requests
   */
  async getPayoutRequests(req, res) {
    try {
      const sellerId = req.user.id;
      const status = req.query.status || null;

      const payoutRequests = await payoutStateMachine.getPayoutRequestsBySeller(sellerId, status);

      res.json({
        success: true,
        data: payoutRequests
      });
    } catch (error) {
      logger.error('Get payout requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout requests',
        error: error.message
      });
    }
  }

  /**
   * Get payout request by ID
   */
  async getPayoutRequest(req, res) {
    try {
      const sellerId = req.user.id;
      const payoutRequestId = req.params.id;

      const payoutRequest = await payoutStateMachine.getPayoutRequest(payoutRequestId);

      if (!payoutRequest) {
        return res.status(404).json({
          success: false,
          message: 'Payout request not found'
        });
      }

      // Verify seller owns this payout
      if (payoutRequest.seller_id.toString() !== sellerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      res.json({
        success: true,
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Get payout request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payout request',
        error: error.message
      });
    }
  }

  /**
   * Cancel payout request
   */
  async cancelPayout(req, res) {
    try {
      const sellerId = req.user.id;
      const payoutRequestId = req.params.id;

      const payoutRequest = await payoutStateMachine.cancelPayout(payoutRequestId, sellerId);

      res.json({
        success: true,
        message: 'Payout request cancelled successfully',
        data: payoutRequest
      });
    } catch (error) {
      logger.error('Cancel payout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel payout request',
        error: error.message
      });
    }
  }
}

module.exports = new PayoutController();

