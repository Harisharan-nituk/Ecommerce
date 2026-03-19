const { Cart, Product } = require('./mongoose');
const logger = require('../utils/logger');

class CartModelMongo {
  /**
   * Add item to cart
   */
  async addToCart(userId, productId, quantity) {
    try {
      const existing = await Cart.findOne({
        user_id: userId,
        product_id: productId,
      });

      if (existing) {
        existing.quantity += quantity;
        existing.updated_at = new Date();
        await existing.save();
        return existing._id.toString();
      } else {
        const cartItem = await Cart.create({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        });
        return cartItem._id.toString();
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
    try {
      const cartItems = await Cart.find({ user_id: userId })
        .populate({
          path: 'product_id',
          match: { status: 'active' },
          select: 'name price stock sku image_url',
        })
        .lean();

      // Filter out items where product was not found (deleted/inactive)
      return cartItems
        .filter(item => item.product_id)
        .map(item => ({
          id: item._id.toString(),
          user_id: item.user_id.toString(),
          product_id: item.product_id._id.toString(),
          quantity: item.quantity,
          name: item.product_id.name,
          price: item.product_id.price,
          stock: item.product_id.stock,
          sku: item.product_id.sku,
          image_url: item.product_id.image_url,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
    } catch (error) {
      logger.error('Get cart error:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartItemId, quantity) {
    try {
      await Cart.findByIdAndUpdate(cartItemId, {
        $set: {
          quantity: quantity,
          updated_at: new Date(),
        }
      });
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
    try {
      await Cart.deleteOne({
        _id: cartItemId,
        user_id: userId,
      });
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
    try {
      await Cart.deleteMany({ user_id: userId });
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
    try {
      const cartItems = await Cart.find({ user_id: userId })
        .populate({
          path: 'product_id',
          match: { status: 'active' },
          select: 'price',
        })
        .lean();

      const total = cartItems
        .filter(item => item.product_id)
        .reduce((sum, item) => {
          return sum + (item.quantity * item.product_id.price);
        }, 0);

      return total;
    } catch (error) {
      logger.error('Get cart total error:', error);
      throw error;
    }
  }
}

module.exports = new CartModelMongo();

