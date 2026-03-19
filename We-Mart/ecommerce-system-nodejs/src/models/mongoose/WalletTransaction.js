const mongoose = require('mongoose');

/**
 * Wallet Transaction Schema
 * Audit trail for all wallet transactions
 */
const walletTransactionSchema = new mongoose.Schema({
  wallet_type: {
    type: String,
    enum: ['seller', 'customer'],
    required: true,
    index: true
  },
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  transaction_type: {
    type: String,
    enum: ['credit', 'debit', 'hold', 'release', 'release_hold', 'pending_to_available', 'transfer'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance_before: {
    type: Number,
    required: true
  },
  balance_after: {
    type: Number,
    required: true
  },
  reference_type: {
    type: String,
    enum: ['order', 'payout', 'refund', 'adjustment', 'commission', 'fee', 'cashback', 'promotion', 'payment'],
    required: true
  },
  reference_id: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  payout_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayoutRequest',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false,
  collection: 'wallet_transactions'
});

// Indexes
walletTransactionSchema.index({ seller_id: 1, created_at: -1 });
walletTransactionSchema.index({ customer_id: 1, created_at: -1 });
walletTransactionSchema.index({ wallet_type: 1, wallet_id: 1, created_at: -1 });
walletTransactionSchema.index({ reference_type: 1, reference_id: 1 });
walletTransactionSchema.index({ transaction_type: 1, created_at: -1 });

// Static methods
walletTransactionSchema.statics.createTransaction = function(data) {
  const transactionData = {
    wallet_type: data.wallet_type || (data.seller_id ? 'seller' : 'customer'),
    wallet_id: data.wallet_id,
    seller_id: data.seller_id || null,
    customer_id: data.customer_id || null,
    transaction_type: data.transaction_type,
    amount: data.amount,
    balance_before: data.balance_before,
    balance_after: data.balance_after,
    reference_type: data.reference_type,
    reference_id: data.reference_id,
    description: data.description,
    order_id: data.order_id || null,
    payout_request_id: data.payout_request_id || null,
    metadata: data.metadata || {},
    status: data.status || 'completed',
    created_at: data.created_at || new Date()
  };
  return this.create(transactionData);
};

walletTransactionSchema.statics.findBySellerId = function(sellerId, limit = 50) {
  return this.find({ seller_id: sellerId })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('order_id', 'order_number total_amount status')
    .populate('payout_request_id', 'request_id amount status');
};

walletTransactionSchema.statics.findByCustomerId = function(customerId, limit = 50) {
  return this.find({ customer_id: customerId })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('order_id', 'order_number total_amount status');
};

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = WalletTransaction;

