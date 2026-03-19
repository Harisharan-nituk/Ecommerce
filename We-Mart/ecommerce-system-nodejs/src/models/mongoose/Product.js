const mongoose = require('mongoose');

/**
 * Product Schema - MongoDB with Mongoose
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  category: {
    type: String,
    default: null,
    index: true,
    enum: ['men', 'women', 'kids', 'home-living', 'beauty', 'electronics'],
  },
  subcategory: {
    type: String,
    default: null,
    index: true,
  },
  brand: {
    type: String,
    default: null,
    index: true,
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
    index: true,
  },
  sku: {
    type: String,
    default: null,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
    index: true,
  },
  image_url: {
    type: String,
    default: null,
  },
  image_urls: {
    type: [String],
    default: [],
  },
  sizes: {
    type: [String],
    default: [],
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XS', 'Free Size'],
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  total_reviews: {
    type: Number,
    default: 0,
    min: 0,
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
  collection: 'products',
  timestamps: false,
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category_id: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ subcategory: 1, status: 1 });
productSchema.index({ brand_id: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1, created_at: -1 });
productSchema.index({ seller_id: 1, status: 1 });
productSchema.index({ brand_id: 1, status: 1 });

// Virtual for category name (if populated)
productSchema.virtual('category_name').get(function() {
  return this.category_id?.name || null;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

