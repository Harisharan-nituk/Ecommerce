const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

/**
 * Customer Wallet Schema
 * Manages customer wallet balances, refunds, and cashback
 */
const customerWalletSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  available_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  pending_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  total_credited: {
    type: Number,
    default: 0,
    min: 0
  },
  total_debited: {
    type: Number,
    default: 0,
    min: 0
  },
  hold_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active',
    index: true
  },
  lock_reason: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'customer_wallets'
});

// Add version key for optimistic concurrency
customerWalletSchema.plugin(updateIfCurrentPlugin);

// Indexes
customerWalletSchema.index({ customer_id: 1, status: 1 });
customerWalletSchema.index({ created_at: -1 });

// Virtual for total balance
customerWalletSchema.virtual('total_balance').get(function() {
  return this.available_balance + this.pending_balance;
});

// Methods
customerWalletSchema.methods.credit = function(amount, type = 'available') {
  if (type === 'available') {
    this.available_balance += amount;
  } else if (type === 'pending') {
    this.pending_balance += amount;
  }
  this.total_credited += amount;
  this.updated_at = new Date();
  return this.save();
};

customerWalletSchema.methods.debit = function(amount) {
  if (this.available_balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.available_balance -= amount;
  this.total_debited += amount;
  this.updated_at = new Date();
  return this.save();
};

customerWalletSchema.methods.movePendingToAvailable = function(amount) {
  if (this.pending_balance < amount) {
    throw new Error('Insufficient pending balance');
  }
  this.pending_balance -= amount;
  this.available_balance += amount;
  this.updated_at = new Date();
  return this.save();
};

customerWalletSchema.methods.holdAmount = function(amount, reason) {
  if (this.available_balance < amount) {
    throw new Error('Insufficient balance to hold');
  }
  this.available_balance -= amount;
  this.hold_amount += amount;
  this.lock_reason = reason;
  this.updated_at = new Date();
  return this.save();
};

customerWalletSchema.methods.releaseHold = function(amount) {
  if (this.hold_amount < amount) {
    throw new Error('Insufficient hold amount');
  }
  this.hold_amount -= amount;
  this.available_balance += amount;
  if (this.hold_amount === 0) {
    this.lock_reason = null;
  }
  this.updated_at = new Date();
  return this.save();
};

// Static methods
customerWalletSchema.statics.findByCustomerId = function(customerId) {
  return this.findOne({ customer_id: customerId });
};

customerWalletSchema.statics.createWallet = function(customerId) {
  return this.create({
    customer_id: customerId,
    available_balance: 0,
    pending_balance: 0,
    total_credited: 0,
    total_debited: 0,
    hold_amount: 0,
    status: 'active'
  });
};

const CustomerWallet = mongoose.model('CustomerWallet', customerWalletSchema);

module.exports = CustomerWallet;

