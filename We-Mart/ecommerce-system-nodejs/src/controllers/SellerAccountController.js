const sellerWalletService = require('../services/SellerWalletService');
const logger = require('../utils/logger');

/**
 * Seller Account Controller
 * Handles seller wallet and account management endpoints
 */
class SellerAccountController {
  /**
   * Get seller account details
   */
  async getAccount(req, res) {
    try {
      const sellerId = req.user.id;
      const walletSummary = await sellerWalletService.getWalletSummary(sellerId);

      res.json({
        success: true,
        data: walletSummary
      });
    } catch (error) {
      logger.error('Get account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get account details',
        error: error.message
      });
    }
  }

  /**
   * Get wallet balance
   */
  async getWallet(req, res) {
    try {
      const sellerId = req.user.id;
      const wallet = await sellerWalletService.getWallet(sellerId);

      res.json({
        success: true,
        data: {
          available_balance: wallet.available_balance,
          pending_balance: wallet.pending_balance,
          total_earnings: wallet.total_earnings,
          total_paid: wallet.total_paid,
          hold_amount: wallet.hold_amount,
          total_balance: wallet.total_balance,
          currency: wallet.currency,
          status: wallet.status
        }
      });
    } catch (error) {
      logger.error('Get wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet',
        error: error.message
      });
    }
  }

  /**
   * Update bank details
   */
  async updateBankDetails(req, res) {
    try {
      const sellerId = req.user.id;
      const { account_number, ifsc_code, bank_name, account_holder_name, beneficiary_id } = req.body;

      // Validate required fields
      if (!account_number || !ifsc_code || !bank_name || !account_holder_name) {
        return res.status(400).json({
          success: false,
          message: 'Account number, IFSC code, bank name, and account holder name are required'
        });
      }

      // Validate IFSC format (11 characters: 4 letters + 0 + 6 alphanumeric)
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IFSC code format'
        });
      }

      const bankDetails = {
        account_number,
        ifsc_code: ifsc_code.toUpperCase(),
        bank_name,
        account_holder_name,
        beneficiary_id: beneficiary_id || null
      };

      const wallet = await sellerWalletService.updateBankDetails(sellerId, bankDetails);

      res.json({
        success: true,
        message: 'Bank details updated successfully',
        data: {
          bank_details: wallet.bank_details
        }
      });
    } catch (error) {
      logger.error('Update bank details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bank details',
        error: error.message
      });
    }
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(req, res) {
    try {
      const sellerId = req.user.id;
      const { minimum_payout, payout_schedule, auto_payout_enabled, payout_day } = req.body;

      const payoutSettings = {};
      
      if (minimum_payout !== undefined) {
        if (minimum_payout < 100) {
          return res.status(400).json({
            success: false,
            message: 'Minimum payout must be at least ₹100'
          });
        }
        payoutSettings.minimum_payout = minimum_payout;
      }

      if (payout_schedule) {
        const validSchedules = ['weekly', 'bi-weekly', 'monthly', 'on-demand'];
        if (!validSchedules.includes(payout_schedule)) {
          return res.status(400).json({
            success: false,
            message: `Invalid payout schedule. Must be one of: ${validSchedules.join(', ')}`
          });
        }
        payoutSettings.payout_schedule = payout_schedule;
      }

      if (auto_payout_enabled !== undefined) {
        payoutSettings.auto_payout_enabled = auto_payout_enabled;
      }

      if (payout_day !== undefined) {
        if (payout_day < 1 || payout_day > 31) {
          return res.status(400).json({
            success: false,
            message: 'Payout day must be between 1 and 31'
          });
        }
        payoutSettings.payout_day = payout_day;
      }

      const wallet = await sellerWalletService.updatePayoutSettings(sellerId, payoutSettings);

      res.json({
        success: true,
        message: 'Payout settings updated successfully',
        data: {
          payout_settings: wallet.payout_settings
        }
      });
    } catch (error) {
      logger.error('Update payout settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payout settings',
        error: error.message
      });
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(req, res) {
    try {
      const sellerId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;

      const transactions = await sellerWalletService.getTransactions(sellerId, limit);

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message
      });
    }
  }
}

module.exports = new SellerAccountController();

