const mongoose = require('mongoose');

/**
 * Category Schema - MongoDB with Mongoose
 * Supports hierarchical categories (parent-child relationships)
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  description: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  level: {
    type: Number,
    default: 0, // 0 = root, 1 = main, 2 = subcategory
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0
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
  collection: 'categories',
  timestamps: false
});

// Indexes
categorySchema.index({ parentId: 1, level: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

// Virtual for children (populated)
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual for parent (populated)
categorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

// Auto-generate slug from name if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  this.updated_at = Date.now();
  next();
});

// Method to get all descendant category IDs
categorySchema.methods.getDescendantIds = async function() {
  const descendants = [];
  const children = await mongoose.model('Category').find({ parentId: this._id, isActive: true });
  
  for (const child of children) {
    descendants.push(child._id);
    const childDescendants = await child.getDescendantIds();
    descendants.push(...childDescendants);
  }
  
  return descendants;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
