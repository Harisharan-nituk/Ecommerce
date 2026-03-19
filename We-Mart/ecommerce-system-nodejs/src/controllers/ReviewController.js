const reviewModel = require('../models/ReviewModel');
const productModel = require('../models/ProductModel');
const orderModel = require('../models/OrderModel');
const logger = require('../utils/logger');

class ReviewController {
  /**
   * Create review
   */
  async createReview(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { product_id, order_id, rating, title, review_text, images } = req.body;

      if (!product_id || !rating || !review_text) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: product_id, rating, review_text'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if user has already reviewed this product
      const hasReviewed = await reviewModel.hasUserReviewed(userId, product_id);
      if (hasReviewed) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }

      // Check if order_id is provided and verify purchase
      let verifiedPurchase = false;
      if (order_id) {
        const order = await orderModel.getOrderById(order_id);
        if (order) {
          const orderUserId = order.user_id?._id || order.user_id || order.user_id;
          if (orderUserId.toString() === userId.toString()) {
            // Check if product is in the order
            const hasProduct = order.items.some(item => {
              const itemProductId = item.product_id?._id || item.product_id || item.product_id;
              return itemProductId && itemProductId.toString() === product_id.toString();
            });
            verifiedPurchase = hasProduct;
          }
        }
      }

      const reviewData = {
        product_id,
        user_id: userId,
        order_id: order_id || null,
        rating: parseInt(rating),
        title: title || null,
        review_text,
        images: images || [],
        verified_purchase: verifiedPurchase,
        status: 'pending' // Auto-approve can be configured
      };

      const reviewId = await reviewModel.createReview(reviewData);

      // Update product rating stats
      await this.updateProductRating(product_id);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: { reviewId }
      });
    } catch (error) {
      logger.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(req, res) {
    try {
      const productId = req.params.productId;
      const filters = {
        rating: req.query.rating,
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0
      };

      const reviews = await reviewModel.getProductReviews(productId, filters);
      const ratingStats = await reviewModel.getProductRatingStats(productId);

      res.json({
        success: true,
        data: {
          reviews,
          ratingStats
        },
        count: reviews.length
      });
    } catch (error) {
      logger.error('Get product reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reviews'
      });
    }
  }

  /**
   * Get product rating statistics
   */
  async getProductRatingStats(req, res) {
    try {
      const productId = req.params.productId;
      const ratingStats = await reviewModel.getProductRatingStats(productId);

      res.json({
        success: true,
        data: ratingStats
      });
    } catch (error) {
      logger.error('Get product rating stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rating statistics'
      });
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const filters = {
        status: req.query.status,
        limit: parseInt(req.query.limit) || 50
      };

      const reviews = await reviewModel.getUserReviews(userId, filters);

      res.json({
        success: true,
        data: reviews,
        count: reviews.length
      });
    } catch (error) {
      logger.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reviews'
      });
    }
  }

  /**
   * Get review by ID
   */
  async getReview(req, res) {
    try {
      const reviewId = req.params.id;
      const review = await reviewModel.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get review'
      });
    }
  }

  /**
   * Update review
   */
  async updateReview(req, res) {
    try {
      const reviewId = req.params.id;
      const userId = req.user?.id || req.user?._id;
      const { rating, title, review_text, images } = req.body;

      // Get review to check ownership
      const review = await reviewModel.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const reviewUserId = review.user_id?._id || review.user_id || review.user_id;
      if (reviewUserId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this review'
        });
      }

      const updateData = {};
      if (rating !== undefined) updateData.rating = parseInt(rating);
      if (title !== undefined) updateData.title = title;
      if (review_text !== undefined) updateData.review_text = review_text;
      if (images !== undefined) updateData.images = images;

      const updated = await reviewModel.updateReview(reviewId, updateData);

      // Update product rating stats
      await this.updateProductRating(review.product_id?._id || review.product_id);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }
  }

  /**
   * Delete review
   */
  async deleteReview(req, res) {
    try {
      const reviewId = req.params.id;
      const userId = req.user?.id || req.user?._id;

      // Get review to check ownership
      const review = await reviewModel.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const reviewUserId = review.user_id?._id || review.user_id || review.user_id;
      if (reviewUserId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this review'
        });
      }

      const productId = review.product_id?._id || review.product_id;
      await reviewModel.deleteReview(reviewId);

      // Update product rating stats
      await this.updateProductRating(productId);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      logger.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(req, res) {
    try {
      const reviewId = req.params.id;
      const useMongoDB = process.env.MONGODB_ENABLED === 'true';

      if (useMongoDB) {
        const Review = require('../models/mongoose/Review');
        const review = await Review.findById(reviewId);
        
        if (!review) {
          return res.status(404).json({
            success: false,
            message: 'Review not found'
          });
        }

        const helpfulCount = await review.markHelpful();

        res.json({
          success: true,
          message: 'Review marked as helpful',
          data: { helpfulCount }
        });
      } else {
        const mysql = require('../config/database').mysql;
        await mysql.query(
          'UPDATE tbl_reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
          [reviewId]
        );
        
        const review = await reviewModel.getReviewById(reviewId);
        res.json({
          success: true,
          message: 'Review marked as helpful',
          data: { helpfulCount: review.helpful_count }
        });
      }
    } catch (error) {
      logger.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful'
      });
    }
  }

  /**
   * Update product rating (helper method)
   */
  async updateProductRating(productId) {
    try {
      const ratingStats = await reviewModel.getProductRatingStats(productId);
      
      // Update product with average rating
      await productModel.updateProduct(productId, {
        average_rating: ratingStats.averageRating,
        total_reviews: ratingStats.totalReviews
      });
    } catch (error) {
      logger.error('Update product rating error:', error);
      // Don't throw - this is a background update
    }
  }

  /**
   * Admin: Moderate review
   */
  async moderateReview(req, res) {
    try {
      const reviewId = req.params.id;
      const { status, moderation_notes } = req.body;
      const moderatedBy = req.user?.id || req.user?._id;

      if (!['approved', 'rejected', 'flagged'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: approved, rejected, or flagged'
        });
      }

      const updateData = {
        status,
        moderated_by: moderatedBy,
        moderated_at: new Date(),
        moderation_notes: moderation_notes || null
      };

      const updated = await reviewModel.updateReview(reviewId, updateData);

      // Update product rating stats if approved
      if (status === 'approved') {
        const review = await reviewModel.getReviewById(reviewId);
        await this.updateProductRating(review.product_id?._id || review.product_id);
      }

      res.json({
        success: true,
        message: 'Review moderated successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Moderate review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to moderate review'
      });
    }
  }
}

module.exports = new ReviewController();
