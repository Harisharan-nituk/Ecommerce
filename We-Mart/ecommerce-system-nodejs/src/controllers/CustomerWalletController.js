const customerWalletService = require('../services/CustomerWalletService');
const logger = require('../utils/logger');

/**
 * Customer Wallet Controller
 * Handles customer wallet management endpoints
 */
class CustomerWalletController {
  /**
   * Get customer wallet balance
   */
  async getWallet(req, res) {
    try {
      const customerId = req.user.id;
      const wallet = await customerWalletService.getWallet(customerId);

      res.json({
        success: true,
        data: {
          available_balance: wallet.available_balance,
          pending_balance: wallet.pending_balance,
          total_credited: wallet.total_credited,
          total_debited: wallet.total_debited,
          hold_amount: wallet.hold_amount,
          total_balance: wallet.total_balance,
          currency: wallet.currency,
          status: wallet.status
        }
      });
    } catch (error) {
      logger.error('Get customer wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet',
        error: error.message
      });
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(req, res) {
    try {
      const customerId = req.user.id;
      const { limit = 50, skip = 0, transaction_type, reference_type } = req.query;

      const filters = {};
      if (transaction_type) filters.transaction_type = transaction_type;
      if (reference_type) filters.reference_type = reference_type;

      const transactions = await customerWalletService.getTransactions(customerId, {
        ...filters,
        limit: parseInt(limit),
        skip: parseInt(skip)
      });

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Get customer transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message
      });
    }
  }

  /**
   * Get wallet summary
   */
  async getWalletSummary(req, res) {
    try {
      const customerId = req.user.id;
      const wallet = await customerWalletService.getWallet(customerId);
      const transactions = await customerWalletService.getTransactions(customerId, { limit: 10 });

      res.json({
        success: true,
        data: {
          wallet: {
            available_balance: wallet.available_balance,
            pending_balance: wallet.pending_balance,
            total_credited: wallet.total_credited,
            total_debited: wallet.total_debited,
            hold_amount: wallet.hold_amount,
            total_balance: wallet.total_balance,
            currency: wallet.currency,
            status: wallet.status
          },
          recent_transactions: transactions
        }
      });
    } catch (error) {
      logger.error('Get customer wallet summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet summary',
        error: error.message
      });
    }
  }

  /**
   * Use wallet balance for payment (debit)
   */
  async useWalletBalance(req, res) {
    try {
      const customerId = req.user.id;
      const { amount, order_id, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      const wallet = await customerWalletService.debit(
        customerId,
        amount,
        'payment',
        order_id || `ORDER-${Date.now()}`,
        description || `Payment for order ${order_id}`,
        { order_id }
      );

      res.json({
        success: true,
        message: 'Wallet balance used successfully',
        data: {
          available_balance: wallet.available_balance,
          amount_debited: amount
        }
      });
    } catch (error) {
      logger.error('Use wallet balance error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to use wallet balance',
        error: error.message
      });
    }
  }
}

module.exports = new CustomerWalletController();

