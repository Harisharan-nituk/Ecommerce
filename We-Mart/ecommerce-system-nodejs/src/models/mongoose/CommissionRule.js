const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

/**
 * Commission Rule Schema
 * Defines rules for calculating seller commissions
 */
const slabRangeSchema = {
  _id: false,
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  commission: { type: Number, required: true }
};

const conditionsSchema = {
  _id: false,
  min_order_value: { type: Number, default: null },
  max_order_value: { type: Number, default: null },
  product_tags: [{ type: String }],
  seller_rating: { type: Number, default: null },
  category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  seller_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', null],
    default: null
  }
};

const commissionRuleSchema = new mongoose.Schema({
  rule_name: {
    type: String,
    required: true,
    index: true
  },
  rule_type: {
    type: String,
    enum: ['percentage', 'fixed', 'slab-based'],
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  seller_tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', null],
    default: null,
    index: true
  },
  conditions: conditionsSchema,
  commission_value: {
    type: Number,
    required: function() {
      return this.rule_type !== 'slab-based';
    }
  },
  slab_ranges: {
    type: [slabRangeSchema],
    required: function() {
      return this.rule_type === 'slab-based';
    }
  },
  effective_from: {
    type: Date,
    default: Date.now,
    index: true
  },
  effective_to: {
    type: Date,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  collection: 'commission_rules'
});

// Add version key for optimistic concurrency
commissionRuleSchema.plugin(updateIfCurrentPlugin);

// Indexes
commissionRuleSchema.index({ status: 1, effective_from: 1, effective_to: 1 });
commissionRuleSchema.index({ priority: -1 });
commissionRuleSchema.index({ category_id: 1, status: 1 });
commissionRuleSchema.index({ seller_tier: 1, status: 1 });

// Methods
commissionRuleSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' &&
         this.effective_from <= now &&
         (this.effective_to === null || this.effective_to >= now);
};

commissionRuleSchema.methods.matchesConditions = function(order, seller) {
  // Check date validity
  if (!this.isActive()) {
    return false;
  }

  // Check order value range
  if (this.conditions.min_order_value && order.total_amount < this.conditions.min_order_value) {
    return false;
  }
  if (this.conditions.max_order_value && order.total_amount > this.conditions.max_order_value) {
    return false;
  }

  // Check seller tier
  if (this.seller_tier && seller.tier !== this.seller_tier) {
    return false;
  }

  // Check seller rating
  if (this.conditions.seller_rating && seller.rating < this.conditions.seller_rating) {
    return false;
  }

  // Check category
  if (this.category_id) {
    const orderCategories = order.items.map(item => item.category_id?.toString());
    if (!orderCategories.includes(this.category_id.toString())) {
      return false;
    }
  }

  return true;
};

commissionRuleSchema.methods.calculateCommission = function(orderAmount) {
  if (this.rule_type === 'percentage') {
    return orderAmount * (this.commission_value / 100);
  } else if (this.rule_type === 'fixed') {
    return this.commission_value;
  } else if (this.rule_type === 'slab-based') {
    return this.calculateSlabCommission(orderAmount);
  }
  return 0;
};

commissionRuleSchema.methods.calculateSlabCommission = function(orderAmount) {
  if (!this.slab_ranges || this.slab_ranges.length === 0) {
    return 0;
  }

  for (const slab of this.slab_ranges) {
    if (orderAmount >= slab.min && orderAmount <= slab.max) {
      return slab.commission;
    }
  }

  // If amount exceeds all slabs, use the last slab's commission
  const lastSlab = this.slab_ranges[this.slab_ranges.length - 1];
  if (orderAmount > lastSlab.max) {
    return lastSlab.commission;
  }

  return 0;
};

// Static methods
commissionRuleSchema.statics.findActiveRules = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    effective_from: { $lte: now },
    $or: [
      { effective_to: null },
      { effective_to: { $gte: now } }
    ]
  }).sort({ priority: -1 });
};

commissionRuleSchema.statics.findMatchingRules = async function(order, seller) {
  const activeRules = await this.findActiveRules();
  return activeRules.filter(rule => rule.matchesConditions(order, seller));
};

const CommissionRule = mongoose.model('CommissionRule', commissionRuleSchema);

module.exports = CommissionRule;

