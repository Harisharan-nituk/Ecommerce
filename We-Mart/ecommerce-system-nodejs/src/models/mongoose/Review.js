const mongoose = require('mongoose');

/**
 * Review/Rating Schema - Product reviews and ratings
 */
const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true,
  },
  title: {
    type: String,
    default: null,
    maxlength: 200,
  },
  review_text: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  // Review helpfulness
  helpful_count: {
    type: Number,
    default: 0,
  },
  verified_purchase: {
    type: Boolean,
    default: false,
    index: true,
  },
  // Review images
  images: [{
    type: String, // URLs to review images
  }],
  // Admin moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true,
  },
  moderation_notes: {
    type: String,
    default: null,
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  moderated_at: {
    type: Date,
    default: null,
  },
  // Flags for inappropriate content
  is_flagged: {
    type: Boolean,
    default: false,
  },
  flag_reason: {
    type: String,
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
  collection: 'reviews',
  timestamps: false,
});

// Compound index to ensure one review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });
reviewSchema.index({ product_id: 1, status: 1, created_at: -1 });
reviewSchema.index({ rating: 1, status: 1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        product_id: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result[0].ratingDistribution.forEach(rating => {
    ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingDistribution
  };
};

// Static method to get reviews for a product
reviewSchema.statics.getProductReviews = function(productId, filters = {}) {
  const query = {
    product_id: productId,
    status: 'approved'
  };

  if (filters.rating) {
    query.rating = parseInt(filters.rating);
  }

  return this.find(query)
    .sort({ created_at: -1 })
    .populate('user_id', 'first_name last_name email')
    .limit(filters.limit || 10)
    .skip(filters.skip || 0)
    .lean();
};

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function() {
  this.helpful_count += 1;
  await this.save();
  return this.helpful_count;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
