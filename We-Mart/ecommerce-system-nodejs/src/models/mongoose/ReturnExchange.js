const mongoose = require('mongoose');

/**
 * Return/Exchange Schema - Handles product returns and exchanges
 */
const returnExchangeSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['return', 'exchange'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'defective',
      'wrong_item',
      'not_as_described',
      'damaged',
      'size_issue',
      'color_issue',
      'quality_issue',
      'changed_mind',
      'other'
    ],
  },
  reason_description: {
    type: String,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  // Exchange specific fields
  exchange_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  exchange_size: {
    type: String,
    default: null,
  },
  exchange_color: {
    type: String,
    default: null,
  },
  // Financial fields
  refund_amount: {
    type: Number,
    default: 0,
    min: 0,
  },
  delivery_charges: {
    type: Number,
    default: 0,
    min: 0,
  },
  refund_delivery_charges: {
    type: Boolean,
    default: false, // Whether delivery charges should be refunded
  },
  total_refund: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Return shipping
  return_tracking_number: {
    type: String,
    default: null,
  },
  return_carrier: {
    type: String,
    default: null,
  },
  return_shipping_cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Admin notes
  admin_notes: {
    type: String,
    default: null,
  },
  rejection_reason: {
    type: String,
    default: null,
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  processed_at: {
    type: Date,
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
  collection: 'return_exchanges',
  timestamps: false,
});

// Indexes
returnExchangeSchema.index({ order_id: 1, created_at: -1 });
returnExchangeSchema.index({ user_id: 1, status: 1 });
returnExchangeSchema.index({ status: 1, created_at: -1 });

// Static method to calculate refund amount
returnExchangeSchema.statics.calculateRefund = async function(orderId, productId, quantity, refundDeliveryCharges = false) {
  try {
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId).lean();
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Find the product in order items
    const orderItem = order.items.find(item => 
      (item.product_id && item.product_id.toString() === productId.toString()) ||
      (item.product && item.product._id && item.product._id.toString() === productId.toString())
    );

    if (!orderItem) {
      throw new Error('Product not found in order');
    }

    const itemPrice = orderItem.price || 0;
    const itemQuantity = orderItem.quantity || 1;
    const returnQuantity = Math.min(quantity, itemQuantity);
    
    // Calculate refund for the item
    const itemRefund = (itemPrice * returnQuantity);
    
    // Calculate proportional delivery charges
    let deliveryRefund = 0;
    if (refundDeliveryCharges && order.delivery_charges) {
      const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const proportionalDelivery = (order.delivery_charges / totalItems) * returnQuantity;
      deliveryRefund = proportionalDelivery;
    }

    // Calculate total refund
    const totalRefund = itemRefund + deliveryRefund;

    return {
      item_refund: itemRefund,
      delivery_refund: deliveryRefund,
      total_refund: totalRefund,
      delivery_charges: order.delivery_charges || 0,
      original_delivery_charges: order.delivery_charges || 0
    };
  } catch (error) {
    throw error;
  }
};

const ReturnExchange = mongoose.model('ReturnExchange', returnExchangeSchema);

module.exports = ReturnExchange;
