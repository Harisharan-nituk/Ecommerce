const { SellerWallet, WalletTransaction } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Seller Wallet Service
 * Manages seller wallet operations, balance updates, and transactions
 */
class SellerWalletService {
  /**
   * Get or create wallet for seller
   */
  async getOrCreateWallet(sellerId, bankDetails = null) {
    try {
      let wallet = await SellerWallet.findBySellerId(sellerId);
      
      if (!wallet) {
        wallet = await SellerWallet.createWallet(sellerId, bankDetails);
        logger.info(`Created wallet for seller: ${sellerId}`);
      }
      
      return wallet;
    } catch (error) {
      logger.error('Get or create wallet error:', error);
      throw error;
    }
  }

  /**
   * Get wallet by seller ID
   */
  async getWallet(sellerId) {
    try {
      const wallet = await SellerWallet.findBySellerId(sellerId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet;
    } catch (error) {
      logger.error('Get wallet error:', error);
      throw error;
    }
  }

  /**
   * Credit amount to seller wallet (available balance)
   */
  async credit(sellerId, amount, referenceType, referenceId, description = '', orderId = null) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const balanceBefore = wallet.available_balance;
      
      await wallet.credit(amount, 'available');
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'credit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: wallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description,
        order_id: orderId
      });
      
      logger.info(`Credited ${amount} to seller ${sellerId} wallet`);
      return wallet;
    } catch (error) {
      logger.error('Credit wallet error:', error);
      throw error;
    }
  }

  /**
   * Credit amount to pending balance (for orders not yet delivered)
   */
  async creditPending(sellerId, amount, referenceType, referenceId, description = '', orderId = null) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const balanceBefore = wallet.pending_balance;
      
      await wallet.credit(amount, 'pending');
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'credit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: wallet.pending_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description,
        order_id: orderId,
        metadata: { balance_type: 'pending' }
      });
      
      logger.info(`Credited ${amount} to pending balance for seller ${sellerId}`);
      return wallet;
    } catch (error) {
      logger.error('Credit pending error:', error);
      throw error;
    }
  }

  /**
   * Move amount from pending to available balance
   */
  async movePendingToAvailable(sellerId, amount, orderId) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const pendingBefore = wallet.pending_balance;
      const availableBefore = wallet.available_balance;
      
      await wallet.movePendingToAvailable(amount);
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'pending_to_available',
        amount: amount,
        balance_before: availableBefore,
        balance_after: wallet.available_balance,
        reference_type: 'order',
        reference_id: orderId.toString(),
        description: `Order delivered - moved from pending to available`,
        order_id: orderId,
        metadata: {
          pending_before: pendingBefore,
          pending_after: wallet.pending_balance
        }
      });
      
      logger.info(`Moved ${amount} from pending to available for seller ${sellerId}`);
      return wallet;
    } catch (error) {
      logger.error('Move pending to available error:', error);
      throw error;
    }
  }

  /**
   * Debit amount from seller wallet
   */
  async debit(sellerId, amount, referenceType, referenceId, description = '', payoutRequestId = null) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const balanceBefore = wallet.available_balance;
      
      await wallet.debit(amount);
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'debit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: wallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: description,
        payout_request_id: payoutRequestId
      });
      
      logger.info(`Debited ${amount} from seller ${sellerId} wallet`);
      return wallet;
    } catch (error) {
      logger.error('Debit wallet error:', error);
      throw error;
    }
  }

  /**
   * Hold amount in wallet (for disputes, returns, etc.)
   */
  async holdAmount(sellerId, amount, reason) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const balanceBefore = wallet.available_balance;
      
      await wallet.holdAmount(amount, reason);
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'hold',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: wallet.available_balance,
        reference_type: 'adjustment',
        reference_id: `HOLD-${Date.now()}`,
        description: `Amount held: ${reason}`,
        metadata: { reason, hold_amount: wallet.hold_amount }
      });
      
      logger.info(`Held ${amount} for seller ${sellerId}: ${reason}`);
      return wallet;
    } catch (error) {
      logger.error('Hold amount error:', error);
      throw error;
    }
  }

  /**
   * Release held amount
   */
  async releaseHold(sellerId, amount) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const balanceBefore = wallet.available_balance;
      
      await wallet.releaseHold(amount);
      
      // Create transaction log
      await WalletTransaction.createTransaction({
        seller_id: sellerId,
        transaction_type: 'release_hold',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: wallet.available_balance,
        reference_type: 'adjustment',
        reference_id: `RELEASE-${Date.now()}`,
        description: `Released held amount`,
        metadata: { hold_amount: wallet.hold_amount }
      });
      
      logger.info(`Released ${amount} hold for seller ${sellerId}`);
      return wallet;
    } catch (error) {
      logger.error('Release hold error:', error);
      throw error;
    }
  }

  /**
   * Update bank details
   */
  async updateBankDetails(sellerId, bankDetails) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      wallet.bank_details = bankDetails;
      wallet.updated_at = new Date();
      await wallet.save();
      
      logger.info(`Updated bank details for seller ${sellerId}`);
      return wallet;
    } catch (error) {
      logger.error('Update bank details error:', error);
      throw error;
    }
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(sellerId, payoutSettings) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      wallet.payout_settings = { ...wallet.payout_settings, ...payoutSettings };
      wallet.updated_at = new Date();
      await wallet.save();
      
      logger.info(`Updated payout settings for seller ${sellerId}`);
      return wallet;
    } catch (error) {
      logger.error('Update payout settings error:', error);
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(sellerId, limit = 50) {
    try {
      return await WalletTransaction.findBySellerId(sellerId, limit);
    } catch (error) {
      logger.error('Get transactions error:', error);
      throw error;
    }
  }

  /**
   * Get wallet summary
   */
  async getWalletSummary(sellerId) {
    try {
      const wallet = await this.getOrCreateWallet(sellerId);
      const recentTransactions = await this.getTransactions(sellerId, 10);
      
      return {
        wallet: {
          available_balance: wallet.available_balance,
          pending_balance: wallet.pending_balance,
          total_earnings: wallet.total_earnings,
          total_paid: wallet.total_paid,
          hold_amount: wallet.hold_amount,
          total_balance: wallet.total_balance,
          currency: wallet.currency,
          status: wallet.status
        },
        payout_settings: wallet.payout_settings,
        bank_details: wallet.bank_details,
        recent_transactions: recentTransactions
      };
    } catch (error) {
      logger.error('Get wallet summary error:', error);
      throw error;
    }
  }
}

module.exports = new SellerWalletService();

