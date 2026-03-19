const mongoose = require('mongoose');

/**
 * Order Tracking Schema - Tracks order status changes and shipping updates
 */
const orderTrackingSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
    required: true,
  },
  location: {
    type: String,
    default: null, // e.g., "Warehouse", "In Transit", "Delivery Center"
  },
  description: {
    type: String,
    required: true, // e.g., "Order confirmed", "Package shipped", "Out for delivery"
  },
  tracking_number: {
    type: String,
    default: null, // Shipping carrier tracking number
  },
  carrier: {
    type: String,
    default: null, // e.g., "FedEx", "UPS", "DHL", "India Post"
  },
  estimated_delivery: {
    type: Date,
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Admin or system user who updated
  },
  is_automatic: {
    type: Boolean,
    default: false, // true if system-generated, false if manual update
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}, // Additional tracking data (coordinates, carrier API response, etc.)
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  collection: 'order_tracking',
  timestamps: false,
});

// Indexes
orderTrackingSchema.index({ order_id: 1, created_at: -1 });
orderTrackingSchema.index({ status: 1, created_at: -1 });

// Static method to get tracking history for an order
orderTrackingSchema.statics.getTrackingHistory = function(orderId) {
  return this.find({ order_id: orderId })
    .sort({ created_at: 1 })
    .populate('updated_by', 'first_name last_name email')
    .lean();
};

// Static method to add tracking update
orderTrackingSchema.statics.addTrackingUpdate = async function(data) {
  const tracking = new this(data);
  await tracking.save();
  return tracking;
};

// Static method to get latest tracking status
orderTrackingSchema.statics.getLatestStatus = function(orderId) {
  return this.findOne({ order_id: orderId })
    .sort({ created_at: -1 })
    .lean();
};

const OrderTracking = mongoose.model('OrderTracking', orderTrackingSchema);

module.exports = OrderTracking;
