const mongoose = require('mongoose');

/**
 * Order Item Schema (embedded in Order)
 */
const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

/**
 * Shipping Address Schema (embedded in Order)
 */
const shippingAddressSchema = new mongoose.Schema({
  address_line1: {
    type: String,
    required: true,
  },
  address_line2: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip_code: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  phone: {
    type: String,
    default: null,
  },
  first_name: {
    type: String,
    default: null,
  },
  last_name: {
    type: String,
    default: null,
  },
}, { _id: false });

/**
 * Order Schema - MongoDB with Mongoose
 */
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  shipping_address: {
    type: shippingAddressSchema,
    required: true,
  },
  payment_method: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'cod', 'card', 'upi', 'wallet'],
    required: true,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  payment_transaction_id: {
    type: String,
    default: null,
  },
  // Commission fields
  commission_calculated: {
    type: Boolean,
    default: false,
  },
  seller_earning: {
    type: Number,
    default: null,
  },
  platform_fee: {
    type: Number,
    default: null,
  },
  commission: {
    type: Number,
    default: 0,
  },
  net_payout: {
    type: Number,
    default: null,
  },
  commission_breakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  commission_reversed: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'orders',
  timestamps: false,
});

// Indexes
orderSchema.index({ user_id: 1, created_at: -1 });
orderSchema.index({ status: 1, created_at: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

