const cartModel = require('../models/CartModel');
const productModel = require('../models/ProductModel');
const logger = require('../utils/logger');

class CartController {
  /**
   * Add item to cart
   */
  async addToCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const userId = req.user.id;

      // Check product exists and has stock
      const product = await productModel.getProductById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }

      const cartItemId = await cartModel.addToCart(userId, product_id, quantity);

      res.json({
        success: true,
        message: 'Item added to cart',
        data: { cartItemId }
      });
    } catch (error) {
      logger.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart'
      });
    }
  }

  /**
   * Get user cart
   */
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const items = await cartModel.getCart(userId);
      const total = await cartModel.getCartTotal(userId);

      res.json({
        success: true,
        data: {
          items,
          total: parseFloat(total)
        }
      });
    } catch (error) {
      logger.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart'
      });
    }
  }

  /**
   * Update cart item
   */
  async updateCartItem(req, res) {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;

      await cartModel.updateCartItem(cartItemId, quantity);

      res.json({
        success: true,
        message: 'Cart item updated'
      });
    } catch (error) {
      logger.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cart item'
      });
    }
  }

  /**
   * Remove from cart
   */
  async removeFromCart(req, res) {
    try {
      const cartItemId = parseInt(req.params.id);
      const userId = req.user.id;

      await cartModel.removeFromCart(cartItemId, userId);

      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      logger.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart'
      });
    }
  }

  /**
   * Clear cart
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      await cartModel.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } catch (error) {
      logger.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart'
      });
    }
  }
}

module.exports = new CartController();

