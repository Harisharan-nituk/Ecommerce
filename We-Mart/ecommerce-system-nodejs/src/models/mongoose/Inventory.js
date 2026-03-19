const mongoose = require('mongoose');

/**
 * Inventory Movement Schema - Tracks all stock changes
 */
const inventoryMovementSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  movement_type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer', 'initial'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previous_stock: {
    type: Number,
    required: true,
  },
  new_stock: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: null, // Reason for adjustment, damage, etc.
  },
  reference_id: {
    type: String,
    default: null, // Order ID, Purchase ID, etc.
  },
  reference_type: {
    type: String,
    enum: ['order', 'purchase', 'return', 'adjustment', null],
    default: null,
  },
  notes: {
    type: String,
    default: null,
  },
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  collection: 'inventory_movements',
  timestamps: false,
});

// Indexes
inventoryMovementSchema.index({ product_id: 1, created_at: -1 });
inventoryMovementSchema.index({ movement_type: 1, created_at: -1 });
inventoryMovementSchema.index({ reference_id: 1, reference_type: 1 });

// Static method to get inventory history for a product
inventoryMovementSchema.statics.getProductHistory = function(productId, limit = 50) {
  return this.find({ product_id: productId })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('performed_by', 'first_name last_name email')
    .lean();
};

// Static method to get low stock products
inventoryMovementSchema.statics.getLowStockProducts = async function(threshold = 10) {
  const Product = mongoose.model('Product');
  return await Product.find({
    stock: { $lte: threshold },
    status: 'active'
  })
    .select('_id name stock sku category_id')
    .populate('category_id', 'name')
    .lean();
};

// Static method to add inventory movement
inventoryMovementSchema.statics.addMovement = async function(data) {
  const movement = new this(data);
  await movement.save();
  return movement;
};

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

module.exports = InventoryMovement;
