const { Order, Product } = require('./mongoose');
const logger = require('../utils/logger');

class OrderModelMongo {
  /**
   * Create order
   */
  async createOrder(orderData) {
    try {
      // Create order with embedded items and shipping address
      const order = await Order.create({
        user_id: orderData.user_id,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        payment_status: 'pending',
        status: 'pending',
        total_amount: orderData.total_amount,
        items: orderData.items,
        payment_transaction_id: orderData.payment_transaction_id || null,
      });

      // Update product stock
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity },
          $set: { updated_at: new Date() }
        });
      }

      return order._id.toString();
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId };
      if (userId) {
        query.user_id = userId;
      }

      const order = await Order.findOne(query)
        .populate('user_id', 'first_name last_name email')
        .populate('items.product_id', 'name sku image_url')
        .lean();

      if (!order) return null;

      return {
        ...order,
        id: order._id.toString(),
        user_id: order.user_id._id.toString(),
        items: order.items.map(item => ({
          ...item,
          product_id: item.product_id._id.toString(),
          name: item.product_id.name,
          sku: item.product_id.sku,
        })),
      };
    } catch (error) {
      logger.error('Get order error:', error);
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId, filters = {}) {
    try {
      const query = { user_id: userId };
      
      if (filters.status) {
        query.status = filters.status;
      }

      const options = {
        sort: { created_at: -1 },
      };

      if (filters.limit) {
        options.limit = parseInt(filters.limit);
      }

      const orders = await Order.find(query, null, options)
        .populate('items.product_id', 'name sku')
        .lean();

      return orders.map(order => ({
        ...order,
        id: order._id.toString(),
        user_id: order.user_id.toString(),
        items: order.items.map(item => ({
          ...item,
          product_id: item.product_id._id.toString(),
          name: item.product_id.name,
          sku: item.product_id.sku,
        })),
      }));
    } catch (error) {
      logger.error('Get user orders error:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    try {
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          status: status,
          updated_at: new Date(),
        }
      });
      return true;
    } catch (error) {
      logger.error('Update order status error:', error);
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }

      const options = {
        sort: { created_at: -1 },
      };

      if (filters.limit) {
        options.limit = parseInt(filters.limit);
      }

      const orders = await Order.find(query, null, options)
        .populate('user_id', 'first_name last_name email')
        .populate('items.product_id', 'name sku')
        .lean();

      return orders.map(order => ({
        ...order,
        id: order._id.toString(),
        user_id: order.user_id._id.toString(),
        items: order.items.map(item => ({
          ...item,
          product_id: item.product_id._id.toString(),
          name: item.product_id.name,
          sku: item.product_id.sku,
        })),
      }));
    } catch (error) {
      logger.error('Get all orders error:', error);
      throw error;
    }
  }
}

module.exports = new OrderModelMongo();

