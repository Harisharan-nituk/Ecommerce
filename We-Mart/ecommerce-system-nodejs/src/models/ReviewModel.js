const logger = require('../utils/logger');

class ReviewModel {
  constructor() {
    this.useMongoDB = process.env.MONGODB_ENABLED === 'true';
  }

  /**
   * Create review
   */
  async createReview(data) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        const review = new Review(data);
        await review.save();
        return review._id;
      } else {
        // MySQL implementation
        const mysql = require('../config/database').mysql;
        const [result] = await mysql.query(
          `INSERT INTO tbl_reviews 
          (product_id, user_id, order_id, rating, title, review_text, helpful_count, 
           verified_purchase, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            data.product_id,
            data.user_id,
            data.order_id || null,
            data.rating,
            data.title || null,
            data.review_text,
            data.helpful_count || 0,
            data.verified_purchase || false,
            data.status || 'pending'
          ]
        );
        return result.insertId;
      }
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        return await Review.findById(reviewId)
          .populate('user_id', 'first_name last_name email')
          .populate('product_id', 'name image_url')
          .lean();
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT * FROM tbl_reviews WHERE id = ?',
          [reviewId]
        );
        return rows[0] || null;
      }
    } catch (error) {
      logger.error('Get review error:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId, filters = {}) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        return await Review.getProductReviews(productId, filters);
      } else {
        const mysql = require('../config/database').mysql;
        let query = 'SELECT * FROM tbl_reviews WHERE product_id = ? AND status = ?';
        const params = [productId, 'approved'];
        
        if (filters.rating) {
          query += ' AND rating = ?';
          params.push(filters.rating);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(filters.limit || 10, filters.skip || 0);
        
        const [rows] = await mysql.query(query, params);
        return rows;
      }
    } catch (error) {
      logger.error('Get product reviews error:', error);
      throw error;
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId, filters = {}) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        const query = { user_id: userId };
        
        if (filters.status) {
          query.status = filters.status;
        }

        return await Review.find(query)
          .sort({ created_at: -1 })
          .populate('product_id', 'name image_url')
          .limit(filters.limit || 50)
          .lean();
      } else {
        const mysql = require('../config/database').mysql;
        let query = 'SELECT * FROM tbl_reviews WHERE user_id = ?';
        const params = [userId];
        
        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(filters.limit || 50);
        
        const [rows] = await mysql.query(query, params);
        return rows;
      }
    } catch (error) {
      logger.error('Get user reviews error:', error);
      throw error;
    }
  }

  /**
   * Calculate average rating for a product
   */
  async getProductRatingStats(productId) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        return await Review.calculateAverageRating(productId);
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(`
          SELECT 
            AVG(rating) as averageRating,
            COUNT(*) as totalReviews,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
          FROM tbl_reviews
          WHERE product_id = ? AND status = 'approved'
        `, [productId]);
        
        if (rows.length === 0 || !rows[0].totalReviews) {
          return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          };
        }
        
        return {
          averageRating: Math.round(parseFloat(rows[0].averageRating) * 10) / 10,
          totalReviews: parseInt(rows[0].totalReviews),
          ratingDistribution: {
            5: parseInt(rows[0].rating_5) || 0,
            4: parseInt(rows[0].rating_4) || 0,
            3: parseInt(rows[0].rating_3) || 0,
            2: parseInt(rows[0].rating_2) || 0,
            1: parseInt(rows[0].rating_1) || 0
          }
        };
      }
    } catch (error) {
      logger.error('Get product rating stats error:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId, data) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        return await Review.findByIdAndUpdate(
          reviewId,
          { ...data, updated_at: new Date() },
          { new: true, runValidators: true }
        );
      } else {
        const mysql = require('../config/database').mysql;
        const updateFields = [];
        const params = [];
        
        Object.keys(data).forEach(key => {
          if (key !== 'id') {
            updateFields.push(`${key} = ?`);
            params.push(data[key]);
          }
        });
        
        updateFields.push('updated_at = NOW()');
        params.push(reviewId);
        
        await mysql.query(
          `UPDATE tbl_reviews SET ${updateFields.join(', ')} WHERE id = ?`,
          params
        );
        return await this.getReviewById(reviewId);
      }
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        await Review.findByIdAndDelete(reviewId);
        return true;
      } else {
        const mysql = require('../config/database').mysql;
        await mysql.query('DELETE FROM tbl_reviews WHERE id = ?', [reviewId]);
        return true;
      }
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  }

  /**
   * Check if user has already reviewed a product
   */
  async hasUserReviewed(userId, productId) {
    try {
      if (this.useMongoDB) {
        const Review = require('./mongoose/Review');
        const review = await Review.findOne({ user_id: userId, product_id: productId });
        return !!review;
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT id FROM tbl_reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
          [userId, productId]
        );
        return rows.length > 0;
      }
    } catch (error) {
      logger.error('Check user review error:', error);
      return false;
    }
  }
}

module.exports = new ReviewModel();
