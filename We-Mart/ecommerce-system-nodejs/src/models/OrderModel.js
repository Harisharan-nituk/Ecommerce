const dbManager = require('../config/database');
const logger = require('../utils/logger');
const orderModelMongo = require('./OrderModelMongo');

class OrderModel {
  /**
   * Create order
   */
  async createOrder(orderData) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await orderModelMongo.createOrder(orderData);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      return await mysql.transaction(async (connection) => {
        // Create order
        const [orderResult] = await connection.execute(
          `INSERT INTO tbl_orders 
           (user_id, shipping_address_id, payment_method, status, total_amount, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            orderData.user_id,
            orderData.shipping_address_id,
            orderData.payment_method,
            'pending',
            orderData.total_amount
          ]
        );

        const orderId = orderResult.insertId;

        // Add order items
        for (const item of orderData.items) {
          await connection.execute(
            `INSERT INTO tbl_order_items 
             (order_id, product_id, quantity, price, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [orderId, item.product_id, item.quantity, item.price]
          );

          // Update product stock
          await connection.execute(
            'UPDATE tbl_products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }

        return orderId;
      });
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId = null) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await orderModelMongo.getOrderById(orderId, userId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      let query = `
        SELECT o.*, 
               a.address_line1, a.address_line2, a.city, a.state, a.zip_code, a.country
        FROM tbl_orders o
        LEFT JOIN tbl_addresses a ON o.shipping_address_id = a.id
        WHERE o.id = ?
      `;
      const params = [orderId];

      if (userId) {
        query += ' AND o.user_id = ?';
        params.push(userId);
      }

      const [orders] = await mysql.query(query, params);

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      // Get order items
      const [items] = await mysql.query(
        `SELECT oi.*, p.name, p.sku 
         FROM tbl_order_items oi
         INNER JOIN tbl_products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );

      order.items = items;
      return order;
    } catch (error) {
      logger.error('Get order error:', error);
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId, filters = {}) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await orderModelMongo.getUserOrders(userId, filters);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      let query = `
        SELECT o.*, 
               a.address_line1, a.city, a.state, a.zip_code
        FROM tbl_orders o
        LEFT JOIN tbl_addresses a ON o.shipping_address_id = a.id
        WHERE o.user_id = ?
      `;
      const params = [userId];

      if (filters.status) {
        query += ' AND o.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY o.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [orders] = await mysql.query(query, params);
      return orders;
    } catch (error) {
      logger.error('Get user orders error:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await orderModelMongo.updateOrderStatus(orderId, status);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query(
        'UPDATE tbl_orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, orderId]
      );
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
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await orderModelMongo.getAllOrders(filters);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      let query = `
        SELECT o.*, u.first_name, u.last_name,
               a.city, a.state
        FROM tbl_orders o
        LEFT JOIN tbl_users u ON o.user_id = u.id
        LEFT JOIN tbl_addresses a ON o.shipping_address_id = a.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += ' AND o.status = ?';
        params.push(filters.status);
      }

      if (filters.user_id) {
        query += ' AND o.user_id = ?';
        params.push(filters.user_id);
      }

      query += ' ORDER BY o.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [orders] = await mysql.query(query, params);
      return orders;
    } catch (error) {
      logger.error('Get all orders error:', error);
      throw error;
    }
  }
}

module.exports = new OrderModel();

