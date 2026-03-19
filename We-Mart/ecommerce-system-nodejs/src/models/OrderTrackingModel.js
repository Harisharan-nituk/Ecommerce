const logger = require('../utils/logger');

class OrderTrackingModel {
  constructor() {
    this.useMongoDB = process.env.MONGODB_ENABLED === 'true';
  }

  /**
   * Get tracking history for an order
   */
  async getTrackingHistory(orderId) {
    try {
      if (this.useMongoDB) {
        const OrderTracking = require('./mongoose/OrderTracking');
        return await OrderTracking.getTrackingHistory(orderId);
      } else {
        // MySQL implementation (if needed)
        // For now, return empty array if MySQL
        logger.warn('Order tracking not implemented for MySQL');
        return [];
      }
    } catch (error) {
      logger.error('Get tracking history error:', error);
      throw error;
    }
  }

  /**
   * Add tracking update
   */
  async addTrackingUpdate(data) {
    try {
      if (this.useMongoDB) {
        const OrderTracking = require('./mongoose/OrderTracking');
        return await OrderTracking.addTrackingUpdate(data);
      } else {
        logger.warn('Order tracking not implemented for MySQL');
        return null;
      }
    } catch (error) {
      logger.error('Add tracking update error:', error);
      throw error;
    }
  }

  /**
   * Get latest tracking status
   */
  async getLatestStatus(orderId) {
    try {
      if (this.useMongoDB) {
        const OrderTracking = require('./mongoose/OrderTracking');
        return await OrderTracking.getLatestStatus(orderId);
      } else {
        return null;
      }
    } catch (error) {
      logger.error('Get latest status error:', error);
      throw error;
    }
  }

  /**
   * Create initial tracking entry when order is created
   */
  async createInitialTracking(orderId, userId) {
    try {
      return await this.addTrackingUpdate({
        order_id: orderId,
        status: 'pending',
        description: 'Order placed successfully',
        location: 'Order Processing Center',
        is_automatic: true,
      });
    } catch (error) {
      logger.error('Create initial tracking error:', error);
      // Don't throw - tracking is optional
      return null;
    }
  }

  /**
   * Update tracking when order status changes
   */
  async updateTrackingOnStatusChange(orderId, newStatus, previousStatus, updatedBy = null) {
    try {
      const statusDescriptions = {
        'pending': 'Order placed and awaiting confirmation',
        'confirmed': 'Order confirmed and being prepared',
        'processing': 'Order is being processed',
        'shipped': 'Order has been shipped',
        'out_for_delivery': 'Order is out for delivery',
        'delivered': 'Order has been delivered',
        'cancelled': 'Order has been cancelled',
        'returned': 'Order has been returned',
        'refunded': 'Order has been refunded',
      };

      const locations = {
        'pending': 'Order Processing Center',
        'confirmed': 'Warehouse',
        'processing': 'Warehouse',
        'shipped': 'In Transit',
        'out_for_delivery': 'Local Delivery Center',
        'delivered': 'Delivered',
        'cancelled': 'Order Processing Center',
        'returned': 'Return Processing Center',
        'refunded': 'Payment Processing',
      };

      return await this.addTrackingUpdate({
        order_id: orderId,
        status: newStatus,
        description: statusDescriptions[newStatus] || `Order status changed to ${newStatus}`,
        location: locations[newStatus] || null,
        updated_by: updatedBy,
        is_automatic: true,
      });
    } catch (error) {
      logger.error('Update tracking on status change error:', error);
      return null;
    }
  }
}

module.exports = new OrderTrackingModel();
