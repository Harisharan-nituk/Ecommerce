const mongoose = require('mongoose');

/**
 * Seller Application Schema - MongoDB with Mongoose
 * Stores seller registration applications
 */
const sellerApplicationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  business_name: {
    type: String,
    required: true,
  },
  business_address: {
    type: String,
    required: true,
  },
  business_pincode: {
    type: String,
    required: true,
  },
  business_description: {
    type: String,
    required: true,
  },
  pan_card: {
    type: String,
    required: true,
    index: true,
  },
  aadhaar: {
    type: String,
    required: true,
    index: true,
  },
  account_number: {
    type: String,
    required: true,
    index: true,
  },
  tax_id: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewed_at: {
    type: Date,
    default: null,
  },
  rejection_reason: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'seller_applications',
  timestamps: false,
});

// Indexes
sellerApplicationSchema.index({ user_id: 1 });
sellerApplicationSchema.index({ status: 1 });
sellerApplicationSchema.index({ created_at: -1 });

const SellerApplication = mongoose.model('SellerApplication', sellerApplicationSchema);

module.exports = SellerApplication;

