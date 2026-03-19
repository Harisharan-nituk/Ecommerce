const { Order } = require('../models/mongoose');
const commissionCalculationService = require('./CommissionCalculationService');
const logger = require('../utils/logger');

/**
 * Order Transaction Service
 * Tracks order lifecycle and manages commission transactions
 */
class OrderTransactionService {
  /**
   * Process order when created (calculate commission, add to pending)
   */
  async processOrderCreated(order) {
    try {
      // Get seller ID from order items
      const sellerId = this.extractSellerIdFromOrder(order);
      if (!sellerId) {
        logger.warn(`No seller found for order ${order._id}`);
        return null;
      }

      // Calculate and process commission
      const commissionResult = await commissionCalculationService.processOrderCommission(order, sellerId);
      
      logger.info(`Processed order transaction for order ${order._id}`);
      return commissionResult;
    } catch (error) {
      logger.error('Process order created error:', error);
      throw error;
    }
  }

  /**
   * Process order when delivered (move commission from pending to available)
   */
  async processOrderDelivered(order) {
    try {
      const sellerId = this.extractSellerIdFromOrder(order);
      if (!sellerId) {
        logger.warn(`No seller found for order ${order._id}`);
        return null;
      }

      // Confirm commission (move from pending to available)
      const result = await commissionCalculationService.confirmOrderCommission(order, sellerId);
      
      logger.info(`Confirmed order commission for order ${order._id}`);
      return result;
    } catch (error) {
      logger.error('Process order delivered error:', error);
      throw error;
    }
  }

  /**
   * Process order cancellation (reverse commission)
   */
  async processOrderCancelled(order) {
    try {
      const sellerId = this.extractSellerIdFromOrder(order);
      if (!sellerId) {
        logger.warn(`No seller found for order ${order._id}`);
        return null;
      }

      // Reverse commission
      const result = await commissionCalculationService.reverseCommission(order, sellerId);
      
      logger.info(`Reversed commission for cancelled order ${order._id}`);
      return result;
    } catch (error) {
      logger.error('Process order cancelled error:', error);
      throw error;
    }
  }

  /**
   * Process order return (reverse commission)
   */
  async processOrderReturned(order) {
    try {
      const sellerId = this.extractSellerIdFromOrder(order);
      if (!sellerId) {
        logger.warn(`No seller found for order ${order._id}`);
        return null;
      }

      // Reverse commission
      const result = await commissionCalculationService.reverseCommission(order, sellerId);
      
      logger.info(`Reversed commission for returned order ${order._id}`);
      return result;
    } catch (error) {
      logger.error('Process order returned error:', error);
      throw error;
    }
  }

  /**
   * Extract seller ID from order
   * Assumes order items have product_id, and products have seller_id
   */
  async extractSellerIdFromOrder(order) {
    try {
      if (!order.items || order.items.length === 0) {
        return null;
      }

      // Get first item's product to find seller
      const { Product } = require('../models/mongoose');
      const firstItem = order.items[0];
      const productId = firstItem.product_id?.toString() || firstItem.product_id;
      const product = await Product.findById(productId);
      
      if (!product || !product.seller_id) {
        return null;
      }

      return product.seller_id;
    } catch (error) {
      logger.error('Extract seller ID error:', error);
      return null;
    }
  }

  /**
   * Get order transaction history
   */
  async getOrderTransactions(sellerId, filters = {}) {
    try {
      const query = {};
      
      // Build query based on filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.start_date || filters.end_date) {
        query.created_at = {};
        if (filters.start_date) {
          query.created_at.$gte = new Date(filters.start_date);
        }
        if (filters.end_date) {
          query.created_at.$lte = new Date(filters.end_date);
        }
      }

      // Get orders for this seller
      const { Product } = require('../models/mongoose');
      const sellerProducts = await Product.find({ seller_id: sellerId }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      query.items = {
        $elemMatch: {
          product_id: { $in: productIds }
        }
      };

      const orders = await Order.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 50);

      return orders.map(order => ({
        order_id: order._id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        seller_earning: order.seller_earning,
        platform_fee: order.platform_fee,
        commission: order.commission,
        net_payout: order.net_payout,
        commission_calculated: order.commission_calculated,
        created_at: order.created_at
      }));
    } catch (error) {
      logger.error('Get order transactions error:', error);
      throw error;
    }
  }
}

module.exports = new OrderTransactionService();

