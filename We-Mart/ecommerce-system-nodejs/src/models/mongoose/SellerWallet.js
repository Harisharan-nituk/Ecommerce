const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

/**
 * Seller Wallet Schema
 * Manages seller earnings, balances, and payout settings
 */
const bankDetailsSchema = {
  _id: false,
  account_number: { type: String, required: false },
  ifsc_code: { type: String, required: false },
  bank_name: { type: String, required: false },
  account_holder_name: { type: String, required: false },
  beneficiary_id: { type: String, required: false },
};

const payoutSettingsSchema = {
  _id: false,
  minimum_payout: { type: Number, default: 1000 }, // Minimum amount for withdrawal
  payout_schedule: { 
    type: String, 
    enum: ['weekly', 'bi-weekly', 'monthly', 'on-demand'],
    default: 'on-demand'
  },
  auto_payout_enabled: { type: Boolean, default: false },
  payout_day: { type: Number, default: null }, // Day of week (1-7) or month (1-31)
};

const sellerWalletSchema = new mongoose.Schema({
  seller_id: {
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
  total_earnings: {
    type: Number,
    default: 0,
    min: 0
  },
  total_paid: {
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
  bank_details: bankDetailsSchema,
  payout_settings: payoutSettingsSchema,
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
  collection: 'seller_wallets'
});

// Add version key for optimistic concurrency
sellerWalletSchema.plugin(updateIfCurrentPlugin);

// Indexes
sellerWalletSchema.index({ seller_id: 1 });
sellerWalletSchema.index({ status: 1 });
sellerWalletSchema.index({ available_balance: 1 });

// Virtual for total balance
sellerWalletSchema.virtual('total_balance').get(function() {
  return this.available_balance + this.pending_balance;
});

// Methods
sellerWalletSchema.methods.credit = function(amount, type = 'available') {
  if (type === 'available') {
    this.available_balance += amount;
  } else if (type === 'pending') {
    this.pending_balance += amount;
  }
  this.total_earnings += amount;
  this.updated_at = new Date();
  return this.save();
};

sellerWalletSchema.methods.debit = function(amount) {
  if (this.available_balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.available_balance -= amount;
  this.total_paid += amount;
  this.updated_at = new Date();
  return this.save();
};

sellerWalletSchema.methods.movePendingToAvailable = function(amount) {
  if (this.pending_balance < amount) {
    throw new Error('Insufficient pending balance');
  }
  this.pending_balance -= amount;
  this.available_balance += amount;
  this.updated_at = new Date();
  return this.save();
};

sellerWalletSchema.methods.holdAmount = function(amount, reason) {
  if (this.available_balance < amount) {
    throw new Error('Insufficient balance to hold');
  }
  this.available_balance -= amount;
  this.hold_amount += amount;
  this.lock_reason = reason;
  this.updated_at = new Date();
  return this.save();
};

sellerWalletSchema.methods.releaseHold = function(amount) {
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
sellerWalletSchema.statics.findBySellerId = function(sellerId) {
  return this.findOne({ seller_id: sellerId });
};

sellerWalletSchema.statics.createWallet = function(sellerId, bankDetails = null) {
  return this.create({
    seller_id: sellerId,
    bank_details: bankDetails || {},
    available_balance: 0,
    pending_balance: 0,
    total_earnings: 0,
    total_paid: 0,
    hold_amount: 0,
    status: 'active'
  });
};

const SellerWallet = mongoose.model('SellerWallet', sellerWalletSchema);

module.exports = SellerWallet;

