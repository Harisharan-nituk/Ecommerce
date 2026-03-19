const { CustomerWallet, WalletTransaction } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Customer Wallet Service
 * Manages customer wallet operations, balance updates, and transactions
 */
class CustomerWalletService {
  /**
   * Get or create wallet for customer
   */
  async getOrCreateWallet(customerId) {
    try {
      let wallet = await CustomerWallet.findByCustomerId(customerId);
      
      if (!wallet) {
        wallet = await CustomerWallet.createWallet(customerId);
        logger.info(`Created wallet for customer: ${customerId}`);
      }
      
      return wallet;
    } catch (error) {
      logger.error('Get or create customer wallet error:', error);
      throw error;
    }
  }

  /**
   * Get wallet by customer ID
   */
  async getWallet(customerId) {
    try {
      const wallet = await CustomerWallet.findByCustomerId(customerId)
        .populate('customer_id', 'first_name last_name email');
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      return wallet;
    } catch (error) {
      logger.error('Get customer wallet error:', error);
      throw error;
    }
  }

  /**
   * Credit amount to customer wallet
   */
  async credit(customerId, amount, type, referenceType, referenceId, description, metadata = {}) {
    try {
      const wallet = await this.getOrCreateWallet(customerId);
      
      const balanceBefore = type === 'available' 
        ? wallet.available_balance 
        : wallet.pending_balance;
      
      await wallet.credit(amount, type);
      
      // Refresh wallet to get updated balance
      await wallet.save();
      const updatedWallet = await CustomerWallet.findById(wallet._id);
      
      const balanceAfter = type === 'available' 
        ? updatedWallet.available_balance 
        : updatedWallet.pending_balance;
      
      // Create transaction record
      await WalletTransaction.createTransaction({
        wallet_type: 'customer',
        wallet_id: wallet._id,
        customer_id: customerId,
        transaction_type: 'credit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        metadata
      });
      
      logger.info(`Credited ${amount} to customer wallet: ${customerId}`);
      
      return updatedWallet;
    } catch (error) {
      logger.error('Credit customer wallet error:', error);
      throw error;
    }
  }

  /**
   * Debit amount from customer wallet
   */
  async debit(customerId, amount, referenceType, referenceId, description, metadata = {}) {
    try {
      const wallet = await this.getWallet(customerId);
      
      const balanceBefore = wallet.available_balance;
      await wallet.debit(amount);
      await wallet.save();
      
      const updatedWallet = await CustomerWallet.findById(wallet._id);
      const balanceAfter = updatedWallet.available_balance;
      
      // Create transaction record
      await WalletTransaction.createTransaction({
        wallet_type: 'customer',
        wallet_id: wallet._id,
        customer_id: customerId,
        transaction_type: 'debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        metadata
      });
      
      logger.info(`Debited ${amount} from customer wallet: ${customerId}`);
      
      return updatedWallet;
    } catch (error) {
      logger.error('Debit customer wallet error:', error);
      throw error;
    }
  }

  /**
   * Move pending balance to available
   */
  async movePendingToAvailable(customerId, amount, referenceType, referenceId, description) {
    try {
      const wallet = await this.getWallet(customerId);
      
      const pendingBefore = wallet.pending_balance;
      const availableBefore = wallet.available_balance;
      
      await wallet.movePendingToAvailable(amount);
      await wallet.save();
      
      const updatedWallet = await CustomerWallet.findById(wallet._id);
      
      // Create transaction record
      await WalletTransaction.createTransaction({
        wallet_type: 'customer',
        wallet_id: wallet._id,
        customer_id: customerId,
        transaction_type: 'transfer',
        amount,
        balance_before: availableBefore,
        balance_after: updatedWallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        metadata: {
          from: 'pending',
          to: 'available',
          pending_before: pendingBefore,
          pending_after: updatedWallet.pending_balance
        }
      });
      
      logger.info(`Moved ${amount} from pending to available for customer: ${customerId}`);
      
      return updatedWallet;
    } catch (error) {
      logger.error('Move pending to available error:', error);
      throw error;
    }
  }

  /**
   * Hold amount in customer wallet
   */
  async holdAmount(customerId, amount, reason, referenceType, referenceId) {
    try {
      const wallet = await this.getWallet(customerId);
      
      const balanceBefore = wallet.available_balance;
      await wallet.holdAmount(amount, reason);
      await wallet.save();
      
      const updatedWallet = await CustomerWallet.findById(wallet._id);
      
      // Create transaction record
      await WalletTransaction.createTransaction({
        wallet_type: 'customer',
        wallet_id: wallet._id,
        customer_id: customerId,
        transaction_type: 'hold',
        amount,
        balance_before: balanceBefore,
        balance_after: updatedWallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: `Amount held: ${reason}`,
        metadata: { reason, hold_amount: updatedWallet.hold_amount }
      });
      
      logger.info(`Held ${amount} in customer wallet: ${customerId}`);
      
      return updatedWallet;
    } catch (error) {
      logger.error('Hold customer wallet amount error:', error);
      throw error;
    }
  }

  /**
   * Release held amount
   */
  async releaseHold(customerId, amount, referenceType, referenceId) {
    try {
      const wallet = await this.getWallet(customerId);
      
      const holdBefore = wallet.hold_amount;
      const availableBefore = wallet.available_balance;
      
      await wallet.releaseHold(amount);
      await wallet.save();
      
      const updatedWallet = await CustomerWallet.findById(wallet._id);
      
      // Create transaction record
      await WalletTransaction.createTransaction({
        wallet_type: 'customer',
        wallet_id: wallet._id,
        customer_id: customerId,
        transaction_type: 'release',
        amount,
        balance_before: availableBefore,
        balance_after: updatedWallet.available_balance,
        reference_type: referenceType,
        reference_id: referenceId,
        description: 'Amount released from hold',
        metadata: {
          hold_before: holdBefore,
          hold_after: updatedWallet.hold_amount
        }
      });
      
      logger.info(`Released ${amount} from hold in customer wallet: ${customerId}`);
      
      return updatedWallet;
    } catch (error) {
      logger.error('Release customer wallet hold error:', error);
      throw error;
    }
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(customerId, filters = {}) {
    try {
      const wallet = await this.getWallet(customerId);
      
      const query = {
        wallet_type: 'customer',
        customer_id: customerId,
        ...filters
      };
      
      // Remove limit and skip from query
      const { limit, skip, ...queryFilters } = filters;
      
      const transactions = await WalletTransaction.find({
        ...query,
        ...queryFilters
      })
        .sort({ created_at: -1 })
        .limit(limit || 50)
        .skip(skip || 0)
        .populate('order_id', 'order_number total_amount status');
      
      return transactions;
    } catch (error) {
      logger.error('Get customer wallet transactions error:', error);
      throw error;
    }
  }
}

module.exports = new CustomerWalletService();

