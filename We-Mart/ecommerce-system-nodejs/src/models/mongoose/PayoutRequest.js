const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

/**
 * Payout Request Schema
 * Manages seller payout/withdrawal requests
 */
const bankDetailsSchema = {
  _id: false,
  account_number: { type: String, required: true },
  ifsc_code: { type: String, required: true },
  bank_name: { type: String, required: true },
  account_holder_name: { type: String, required: true },
  beneficiary_id: { type: String, default: null }
};

const feesSchema = {
  _id: false,
  processing_fee: { type: Number, default: 0 },
  tax_deduction: { type: Number, default: 0 },
  net_amount: { type: Number, required: true }
};

const payoutRequestSchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  request_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'approved', 'processing', 'completed', 'failed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  payout_method: {
    type: String,
    enum: ['bank_transfer', 'upi', 'wallet'],
    default: 'bank_transfer',
    required: true
  },
  bank_details: bankDetailsSchema,
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayoutInvoice',
    default: null
  },
  transaction_id: {
    type: String,
    default: null,
    index: true
  },
  utr: {
    type: String,
    default: null,
    index: true
  },
  fees: feesSchema,
  remarks: {
    type: String,
    default: ''
  },
  rejection_reason: {
    type: String,
    default: null
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processed_at: {
    type: Date,
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
  collection: 'payout_requests'
});

// Add version key for optimistic concurrency
payoutRequestSchema.plugin(updateIfCurrentPlugin);

// Indexes
payoutRequestSchema.index({ seller_id: 1, status: 1 });
payoutRequestSchema.index({ status: 1, created_at: -1 });
payoutRequestSchema.index({ request_id: 1 });
payoutRequestSchema.index({ transaction_id: 1 });
payoutRequestSchema.index({ utr: 1 });

// Methods
payoutRequestSchema.methods.updateStatus = function(newStatus, remarks = null, processedBy = null) {
  this.status = newStatus;
  if (remarks) {
    this.remarks = remarks;
  }
  if (processedBy) {
    this.processed_by = processedBy;
  }
  if (newStatus === 'completed' || newStatus === 'failed') {
    this.processed_at = new Date();
  }
  this.updated_at = new Date();
  return this.save();
};

payoutRequestSchema.methods.reject = function(reason, processedBy) {
  this.status = 'rejected';
  this.rejection_reason = reason;
  this.processed_by = processedBy;
  this.processed_at = new Date();
  this.updated_at = new Date();
  return this.save();
};

payoutRequestSchema.methods.complete = function(utr, transactionId) {
  this.status = 'completed';
  this.utr = utr;
  this.transaction_id = transactionId;
  this.processed_at = new Date();
  this.updated_at = new Date();
  return this.save();
};

// Static methods
payoutRequestSchema.statics.generateRequestId = function() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAYOUT-${timestamp}-${random}`;
};

payoutRequestSchema.statics.findBySellerId = function(sellerId, status = null) {
  const query = { seller_id: sellerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ created_at: -1 });
};

payoutRequestSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['pending', 'validated', 'approved'] }
  }).sort({ created_at: 1 });
};

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

module.exports = PayoutRequest;

