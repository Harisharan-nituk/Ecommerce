const mongoose = require('mongoose');

/**
 * Payment Schema - MongoDB with Mongoose
 */
const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payment_method: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'cod'],
    required: true,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  transaction_id: {
    type: String,
    default: null,
    index: true,
  },
  gateway_response: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
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
  collection: 'payments',
  timestamps: false,
});

// Indexes
paymentSchema.index({ user_id: 1, created_at: -1 });
paymentSchema.index({ transaction_id: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

