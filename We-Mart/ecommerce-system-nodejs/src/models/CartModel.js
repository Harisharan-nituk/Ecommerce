const dbManager = require('../config/database');
const logger = require('../utils/logger');
const cartModelMongo = require('./CartModelMongo');

class CartModel {
  /**
   * Add item to cart
   */
  async addToCart(userId, productId, quantity) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.addToCart(userId, productId, quantity);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      // Check if item already exists in cart
      const [existing] = await mysql.query(
        'SELECT id, quantity FROM tbl_cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existing && existing.length > 0) {
        // Update quantity
        await mysql.query(
          'UPDATE tbl_cart SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
          [quantity, existing[0].id]
        );
        return existing[0].id;
      } else {
        // Add new item
        const [result] = await mysql.query(
          'INSERT INTO tbl_cart (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())',
          [userId, productId, quantity]
        );
        return result.insertId;
      }
    } catch (error) {
      logger.error('Add to cart error:', error);
      throw error;
    }
  }

  /**
   * Get user cart
   */
  async getCart(userId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.getCart(userId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      const [items] = await mysql.query(
        `SELECT c.*, p.name, p.price, p.stock, p.sku 
         FROM tbl_cart c
         INNER JOIN tbl_products p ON c.product_id = p.id
         WHERE c.user_id = ? AND p.status = 'active'`,
        [userId]
      );

      return items;
    } catch (error) {
      logger.error('Get cart error:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId, quantity) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.updateCartItem(cartItemId, quantity);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query(
        'UPDATE tbl_cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [quantity, cartItemId]
      );
      return true;
    } catch (error) {
      logger.error('Update cart item error:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId, userId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.removeFromCart(cartItemId, userId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query(
        'DELETE FROM tbl_cart WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );
      return true;
    } catch (error) {
      logger.error('Remove from cart error:', error);
      throw error;
    }
  }

  /**
   * Clear user cart
   */
  async clearCart(userId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.clearCart(userId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query('DELETE FROM tbl_cart WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      logger.error('Clear cart error:', error);
      throw error;
    }
  }

  /**
   * Get cart total
   */
  async getCartTotal(userId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await cartModelMongo.getCartTotal(userId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      const [result] = await mysql.query(
        `SELECT SUM(c.quantity * p.price) as total 
         FROM tbl_cart c
         INNER JOIN tbl_products p ON c.product_id = p.id
         WHERE c.user_id = ? AND p.status = 'active'`,
        [userId]
      );

      return result[0]?.total || 0;
    } catch (error) {
      logger.error('Get cart total error:', error);
      throw error;
    }
  }
}

module.exports = new CartModel();

