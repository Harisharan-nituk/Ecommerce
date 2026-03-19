const { PayoutRequest, User } = require('../models/mongoose');
const sellerWalletService = require('./SellerWalletService');
const invoiceService = require('./InvoiceService');
const notificationService = require('./NotificationService');
const logger = require('../utils/logger');

/**
 * Payout State Machine
 * Manages payout workflow states and transitions
 */
class PayoutStateMachine {
  constructor() {
    // Define valid state transitions
    this.validTransitions = {
      'pending': ['validated', 'rejected', 'cancelled'],
      'validated': ['approved', 'rejected', 'cancelled'],
      'approved': ['processing', 'rejected', 'cancelled'],
      'processing': ['completed', 'failed'],
      'completed': [], // Terminal state
      'failed': ['processing', 'cancelled'], // Can retry
      'rejected': [], // Terminal state
      'cancelled': [] // Terminal state
    };
  }

  /**
   * Validate state transition
   */
  canTransition(currentStatus, newStatus) {
    const allowedTransitions = this.validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Initiate payout request
   */
  async initiatePayout(sellerId, amount, payoutMethod, bankDetails) {
    try {
      // Validate minimum payout
      const wallet = await sellerWalletService.getWallet(sellerId);
      const minPayout = wallet.payout_settings.minimum_payout || 1000;
      
      if (amount < minPayout) {
        throw new Error(`Minimum payout amount is ${minPayout}`);
      }

      // Check available balance
      if (wallet.available_balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Check wallet status
      if (wallet.status !== 'active') {
        throw new Error(`Wallet is ${wallet.status}. Cannot process payout.`);
      }

      // Create payout request
      const requestId = PayoutRequest.generateRequestId();
      const payoutRequest = await PayoutRequest.create({
        seller_id: sellerId,
        request_id: requestId,
        amount: amount,
        status: 'pending',
        payout_method: payoutMethod,
        bank_details: bankDetails,
        fees: {
          processing_fee: this.calculateProcessingFee(amount),
          tax_deduction: 0, // TODO: Calculate TDS if applicable
          net_amount: amount - this.calculateProcessingFee(amount)
        }
      });

      logger.info(`Initiated payout request ${requestId} for seller ${sellerId}`);
      return payoutRequest;
    } catch (error) {
      logger.error('Initiate payout error:', error);
      throw error;
    }
  }

  /**
   * Validate payout request
   */
  async validatePayout(payoutRequestId) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId);
      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (!this.canTransition(payout.status, 'validated')) {
        throw new Error(`Cannot validate payout in ${payout.status} status`);
      }

      // Validate bank details
      if (!payout.bank_details.account_number || !payout.bank_details.ifsc_code) {
        throw new Error('Bank details incomplete');
      }

      // Check wallet balance again
      const wallet = await sellerWalletService.getWallet(payout.seller_id);
      if (wallet.available_balance < payout.amount) {
        throw new Error('Insufficient balance');
      }

      // Update status
      await payout.updateStatus('validated', 'Payout request validated');

      logger.info(`Validated payout request ${payout.request_id}`);
      return payout;
    } catch (error) {
      logger.error('Validate payout error:', error);
      throw error;
    }
  }

  /**
   * Approve payout request (admin action)
   */
  async approvePayout(payoutRequestId, adminId) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId);
      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (!this.canTransition(payout.status, 'approved')) {
        throw new Error(`Cannot approve payout in ${payout.status} status`);
      }

      await payout.updateStatus('approved', 'Payout approved by admin', adminId);

      // Send notification
      try {
        const seller = await User.findById(payout.seller_id);
        if (seller) {
          await notificationService.notifyPayoutStatus(payout, seller);
        }
      } catch (notifyError) {
        logger.warn('Notification failed:', notifyError);
      }

      logger.info(`Approved payout request ${payout.request_id}`);
      return payout;
    } catch (error) {
      logger.error('Approve payout error:', error);
      throw error;
    }
  }

  /**
   * Reject payout request
   */
  async rejectPayout(payoutRequestId, reason, adminId = null) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId);
      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (!this.canTransition(payout.status, 'rejected')) {
        throw new Error(`Cannot reject payout in ${payout.status} status`);
      }

      await payout.reject(reason, adminId);

      // Send notification
      try {
        const seller = await User.findById(payout.seller_id);
        if (seller) {
          await notificationService.notifyPayoutStatus(payout, seller);
        }
      } catch (notifyError) {
        logger.warn('Notification failed:', notifyError);
      }

      logger.info(`Rejected payout request ${payout.request_id}: ${reason}`);
      return payout;
    } catch (error) {
      logger.error('Reject payout error:', error);
      throw error;
    }
  }

  /**
   * Process payout (initiate bank transfer)
   */
  async processPayout(payoutRequestId) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId);
      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (!this.canTransition(payout.status, 'processing')) {
        throw new Error(`Cannot process payout in ${payout.status} status`);
      }

      // Debit from wallet
      await sellerWalletService.debit(
        payout.seller_id,
        payout.amount,
        'payout',
        payout.request_id,
        `Payout request ${payout.request_id}`,
        payout._id
      );

      // Generate invoice before processing
      try {
        const invoiceData = await invoiceService.generateInvoice(payout._id);
        // Store invoice reference in payout (if invoice model exists)
        logger.info(`Generated invoice ${invoiceData.invoice_number} for payout ${payout.request_id}`);
      } catch (invoiceError) {
        logger.warn('Invoice generation failed, continuing with payout:', invoiceError);
      }

      // Update status to processing
      await payout.updateStatus('processing', 'Payment processing initiated');

      // Send notification
      try {
        const seller = await User.findById(payout.seller_id);
        if (seller) {
          await notificationService.notifyPayoutStatus(payout, seller);
        }
      } catch (notifyError) {
        logger.warn('Notification failed:', notifyError);
      }

      // TODO: Integrate with payment gateway (Razorpay, Stripe, etc.)
      // For now, we'll simulate the payment
      const paymentResult = await this.initiateBankTransfer(payout);

      if (paymentResult.success) {
        await payout.complete(paymentResult.utr, paymentResult.transaction_id);
        
        // Send completion notification
        try {
          const seller = await User.findById(payout.seller_id);
          if (seller) {
            await notificationService.notifyPayoutStatus(payout, seller);
          }
        } catch (notifyError) {
          logger.warn('Completion notification failed:', notifyError);
        }
        
        logger.info(`Completed payout request ${payout.request_id}`);
      } else {
        await payout.updateStatus('failed', paymentResult.error);
        // Rollback: credit back to wallet
        await sellerWalletService.credit(
          payout.seller_id,
          payout.amount,
          'payout',
          payout.request_id,
          `Payout failed - amount refunded`
        );
        logger.error(`Failed payout request ${payout.request_id}: ${paymentResult.error}`);
      }

      return payout;
    } catch (error) {
      logger.error('Process payout error:', error);
      // Rollback on error
      try {
        const payout = await PayoutRequest.findById(payoutRequestId);
        if (payout && payout.status === 'processing') {
          await payout.updateStatus('failed', error.message);
          await sellerWalletService.credit(
            payout.seller_id,
            payout.amount,
            'payout',
            payout.request_id,
            `Payout failed - amount refunded`
          );
        }
      } catch (rollbackError) {
        logger.error('Rollback error:', rollbackError);
      }
      throw error;
    }
  }

  /**
   * Cancel payout request
   */
  async cancelPayout(payoutRequestId, sellerId) {
    try {
      const payout = await PayoutRequest.findById(payoutRequestId);
      if (!payout) {
        throw new Error('Payout request not found');
      }

      // Verify seller owns this payout
      if (payout.seller_id.toString() !== sellerId.toString()) {
        throw new Error('Unauthorized');
      }

      if (!this.canTransition(payout.status, 'cancelled')) {
        throw new Error(`Cannot cancel payout in ${payout.status} status`);
      }

      // If already processing, we can't cancel
      if (payout.status === 'processing') {
        throw new Error('Cannot cancel payout that is already processing');
      }

      await payout.updateStatus('cancelled', 'Cancelled by seller');

      logger.info(`Cancelled payout request ${payout.request_id}`);
      return payout;
    } catch (error) {
      logger.error('Cancel payout error:', error);
      throw error;
    }
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount) {
    const feePercentage = parseFloat(process.env.PAYOUT_PROCESSING_FEE_PERCENTAGE || '1'); // 1% default
    const minFee = parseFloat(process.env.PAYOUT_MIN_FEE || '10'); // ₹10 minimum
    const calculatedFee = amount * (feePercentage / 100);
    return Math.max(calculatedFee, minFee);
  }

  /**
   * Initiate bank transfer (placeholder - integrate with payment gateway)
   */
  async initiateBankTransfer(payout) {
    try {
      // TODO: Integrate with actual payment gateway
      // Example: Razorpay Payouts API, Stripe Connect, etc.
      
      // Simulate payment processing
      const utr = `UTR${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const transactionId = `TXN${Date.now()}`;

      // Simulate success (in real implementation, call payment gateway API)
      return {
        success: true,
        utr: utr,
        transaction_id: transactionId,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payout request by ID
   */
  async getPayoutRequest(payoutRequestId) {
    try {
      return await PayoutRequest.findById(payoutRequestId)
        .populate('seller_id', 'first_name last_name email')
        .populate('processed_by', 'first_name last_name email');
    } catch (error) {
      logger.error('Get payout request error:', error);
      throw error;
    }
  }

  /**
   * Get payout requests by seller
   */
  async getPayoutRequestsBySeller(sellerId, status = null) {
    try {
      return await PayoutRequest.findBySellerId(sellerId, status);
    } catch (error) {
      logger.error('Get payout requests by seller error:', error);
      throw error;
    }
  }

  /**
   * Get pending payouts (for admin)
   */
  async getPendingPayouts() {
    try {
      return await PayoutRequest.findPending()
        .populate('seller_id', 'first_name last_name email')
        .sort({ created_at: 1 });
    } catch (error) {
      logger.error('Get pending payouts error:', error);
      throw error;
    }
  }
}

module.exports = new PayoutStateMachine();

