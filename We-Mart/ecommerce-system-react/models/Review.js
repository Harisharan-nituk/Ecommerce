// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: { type: String, required: true },
    alt: String
  }],
  pros: [String],
  cons: [String],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: { type: Number, default: 0 },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
      },
      reportedAt: { type: Date, default: Date.now }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderationNote: {
    type: String,
    maxlength: [500, 'Moderation note cannot exceed 500 characters']
  },
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  language: {
    type: String,
    default: 'en'
  },
  variant: {
    name: String,
    value: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const totalVotes = this.helpful.count + this.reported.count;
  if (totalVotes === 0) return 0;
  return Math.round((this.helpful.count / totalVotes) * 100);
});

// Virtual for customer name (for display purposes)
reviewSchema.virtual('customerName').get(function() {
  if (this.customer && this.customer.firstName) {
    return `${this.customer.firstName} ${this.customer.lastName.charAt(0)}.`;
  }
  return 'Anonymous';
});

// Pre-save middleware to determine sentiment
reviewSchema.pre('save', function(next) {
  if (this.isModified('rating') || this.isNew) {
    if (this.rating >= 4) {
      this.sentiment = 'positive';
    } else if (this.rating >= 3) {
      this.sentiment = 'neutral';
    } else {
      this.sentiment = 'negative';
    }
  }
  next();
});

// Pre-save middleware to check if review is verified
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: this.order,
      customer: this.customer,
      'items.product': this.product,
      status: 'delivered'
    });
    
    this.verified = !!order;
  }
  next();
});

// Post-save middleware to update product rating
reviewSchema.post('save', async function() {
  await this.updateProductRating();
});

// Post-remove middleware to update product rating
reviewSchema.post('remove', async function() {
  await this.updateProductRating();
});

// Method to update product rating
reviewSchema.methods.updateProductRating = async function() {
  const Review = this.constructor;
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    {
      $match: { 
        product: this.product,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  const product = await Product.findById(this.product);
  if (product) {
    if (stats.length > 0) {
      product.rating.average = Math.round(stats[0].averageRating * 10) / 10;
      product.rating.count = stats[0].totalReviews;
    } else {
      product.rating.average = 0;
      product.rating.count = 0;
    }
    await product.save();
  }
};

// Method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
};

// Method to report review
reviewSchema.methods.reportReview = function(userId, reason) {
  const existingReport = this.reported.users.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reported.users.push({
      user: userId,
      reason,
      reportedAt: new Date()
    });
    this.reported.count += 1;
  }
};

// Static method to get product reviews with pagination
reviewSchema.statics.getProductReviews = async function(productId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    rating = null,
    verified = null
  } = options;

  const query = { 
    product: productId,
    status: 'approved'
  };

  if (rating) query.rating = rating;
  if (verified !== null) query.verified = verified;

  const reviews = await this.find(query)
    .populate('customer', 'firstName lastName avatar')
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Indexes for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index for unique review per customer per product per order
reviewSchema.index({ customer: 1, product: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);