const mongoose = require('mongoose');

/**
 * Brand Schema - MongoDB with Mongoose
 */
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  logo_url: {
    type: String,
    default: null,
  },
  website: {
    type: String,
    default: null,
  },
  is_premium: {
    type: Boolean,
    default: false,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
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
  collection: 'brands',
  timestamps: false,
});

// Indexes
brandSchema.index({ name: 'text', description: 'text' });
brandSchema.index({ status: 1, is_premium: 1 });

// Generate slug from name before saving
brandSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  this.updated_at = new Date();
  next();
});

// Static method to get brands with product count
brandSchema.statics.getBrandsWithCount = async function() {
  const Product = mongoose.model('Product');
  const brands = await this.find({ status: 'active' }).lean();
  
  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => {
      const productCount = await Product.countDocuments({
        brand_id: brand._id,
        status: 'active'
      });
      return {
        ...brand,
        product_count: productCount
      };
    })
  );
  
  return brandsWithCount.sort((a, b) => b.product_count - a.product_count);
};

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
