const orderModel = require('../models/OrderModel');
const cartModel = require('../models/CartModel');
const orderTrackingModel = require('../models/OrderTrackingModel');
const inventoryModel = require('../models/InventoryModel');
const orderTransactionService = require('../services/OrderTransactionService');
const logger = require('../utils/logger');

class OrderController {
  /**
   * Create order from cart
   */
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { shipping_address_id, payment_method, items: requestItems, total_amount, shipping_address } = req.body;

      logger.info('Order creation request:', {
        userId,
        hasRequestItems: !!requestItems,
        requestItemsCount: requestItems?.length || 0,
        requestItems: requestItems
      });

      // Get cart items - try from request body first (for frontend Zustand store), then from database
      let cartItems = [];
      if (requestItems && Array.isArray(requestItems) && requestItems.length > 0) {
        // Use items from request body (frontend cart)
        cartItems = requestItems;
        logger.info('Using items from request body:', cartItems.length);
      } else {
        // Fallback to database cart
        cartItems = await cartModel.getCart(userId);
        logger.info('Using items from database cart:', cartItems?.length || 0);
      }

      if (!cartItems || cartItems.length === 0) {
        logger.warn('Cart is empty for user:', userId);
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Calculate total - use provided total or calculate from cart
      let total = total_amount;
      if (!total || total === 0) {
        if (requestItems && Array.isArray(requestItems)) {
          total = requestItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        } else {
          total = await cartModel.getCartTotal(userId);
        }
      }

      // Normalize payment method
      let normalizedPaymentMethod = payment_method || 'cod';
      if (normalizedPaymentMethod === 'card') {
        normalizedPaymentMethod = 'stripe';
      } else if (normalizedPaymentMethod === 'upi' || normalizedPaymentMethod === 'wallet') {
        normalizedPaymentMethod = 'razorpay';
      }

      // Normalize shipping address format
      let normalizedShippingAddress = null;
      if (shipping_address) {
        normalizedShippingAddress = {
          address_line1: shipping_address.address_line_1 || shipping_address.address_line1 || shipping_address.address,
          address_line2: shipping_address.address_line_2 || shipping_address.address_line2 || '',
          city: shipping_address.city,
          state: shipping_address.state,
          zip_code: shipping_address.zip_code || shipping_address.zipCode,
          country: shipping_address.country || 'India',
          phone: shipping_address.phone || '',
          first_name: shipping_address.first_name || shipping_address.firstName || '',
          last_name: shipping_address.last_name || shipping_address.lastName || ''
        };
      }

      // Create order
      const orderData = {
        user_id: userId,
        shipping_address_id: shipping_address_id || null,
        payment_method: normalizedPaymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id || item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total,
        shipping_address: normalizedShippingAddress
      };

      const orderId = await orderModel.createOrder(orderData);

      // Update inventory - deduct stock for each product in order
      try {
        if (process.env.USE_MONGODB === 'true') {
          const { Order } = require('../models/mongoose');
          const order = await Order.findById(orderId);
          if (order && order.items) {
            for (const item of order.items) {
              try {
                await inventoryModel.adjustStock(
                  item.product_id,
                  item.quantity,
                  'sale',
                  `Order #${orderId}`,
                  userId,
                  orderId.toString()
                );
              } catch (inventoryError) {
                logger.error(`Failed to update inventory for product ${item.product_id}:`, inventoryError);
                // Continue with other products even if one fails
              }
            }
          }
        }
      } catch (inventoryError) {
        logger.error('Failed to update inventory:', inventoryError);
        // Don't fail order creation if inventory update fails
      }

      // Create initial tracking entry
      try {
        await orderTrackingModel.createInitialTracking(orderId, userId);
      } catch (trackingError) {
        logger.error('Failed to create initial tracking:', trackingError);
        // Don't fail order creation if tracking fails
      }

      // Clear cart after order creation
      await cartModel.clearCart(userId);

      // Process commission calculation for seller (if using MongoDB)
      if (process.env.USE_MONGODB === 'true') {
        try {
          const { Order } = require('../models/mongoose');
          const order = await Order.findById(orderId);
          if (order) {
            await orderTransactionService.processOrderCreated(order);
          }
        } catch (commissionError) {
          logger.error('Commission calculation error on order creation:', commissionError);
          // Don't fail order creation if commission calculation fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { orderId }
      });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;

      const order = await orderModel.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order'
      });
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        limit: req.query.limit || 20
      };

      const orders = await orderModel.getUserOrders(userId, filters);

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      logger.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders'
      });
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        user_id: req.query.user_id,
        limit: req.query.limit || 50
      };

      const orders = await orderModel.getAllOrders(filters);

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      logger.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders'
      });
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      // Update order status
      if (process.env.USE_MONGODB === 'true') {
        const { Order } = require('../models/mongoose');
        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Add tracking update
        try {
          await orderTrackingModel.updateTrackingOnStatusChange(
            orderId,
            status,
            previousStatus,
            req.user?.id || null
          );
        } catch (trackingError) {
          logger.error('Failed to update tracking:', trackingError);
          // Don't fail status update if tracking fails
        }

        // Restore inventory if order is cancelled or returned
        try {
          if ((status === 'cancelled' || status === 'returned') && 
              previousStatus !== 'cancelled' && previousStatus !== 'returned') {
            // Restore stock for each product in order
            if (order.items && order.items.length > 0) {
              for (const item of order.items) {
                try {
                  await inventoryModel.adjustStock(
                    item.product_id,
                    item.quantity,
                    'return',
                    `Order ${status}: #${orderId}`,
                    req.user?.id || null,
                    orderId.toString()
                  );
                } catch (inventoryError) {
                  logger.error(`Failed to restore inventory for product ${item.product_id}:`, inventoryError);
                }
              }
            }
          }
        } catch (inventoryError) {
          logger.error('Inventory restoration error:', inventoryError);
          // Don't fail status update if inventory restoration fails
        }

        // Process commission based on status change
        try {
          if (status === 'delivered' && previousStatus !== 'delivered') {
            // Order delivered - move commission from pending to available
            await orderTransactionService.processOrderDelivered(order);
          } else if (status === 'cancelled' && previousStatus !== 'cancelled') {
            // Order cancelled - reverse commission
            await orderTransactionService.processOrderCancelled(order);
          } else if (status === 'returned' && previousStatus !== 'returned') {
            // Order returned - reverse commission
            await orderTransactionService.processOrderReturned(order);
          }
        } catch (commissionError) {
          logger.error('Commission processing error:', commissionError);
          // Don't fail status update if commission processing fails
        }
      } else {
        // MySQL path
        await orderModel.updateOrderStatus(parseInt(orderId), status);
      }

      res.json({
        success: true,
        message: 'Order status updated'
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message
      });
    }
  }

  /**
   * Get order tracking history
   */
  async getOrderTracking(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.user.id;

      // Verify user has access to this order
      const order = await orderModel.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const trackingHistory = await orderTrackingModel.getTrackingHistory(orderId);

      res.json({
        success: true,
        data: trackingHistory,
        count: trackingHistory.length
      });
    } catch (error) {
      logger.error('Get order tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order tracking',
        error: error.message
      });
    }
  }

  /**
   * Add manual tracking update (admin/seller)
   */
  async addTrackingUpdate(req, res) {
    try {
      const orderId = req.params.id;
      const { status, description, location, tracking_number, carrier, estimated_delivery } = req.body;
      const updatedBy = req.user.id;

      // Verify order exists
      let order;
      if (process.env.USE_MONGODB === 'true') {
        const { Order } = require('../models/mongoose');
        order = await Order.findById(orderId);
      } else {
        order = await orderModel.getOrderById(orderId, null);
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Add tracking update
      const trackingData = {
        order_id: orderId,
        status: status || order.status,
        description: description || `Order status: ${status || order.status}`,
        location: location || null,
        tracking_number: tracking_number || null,
        carrier: carrier || null,
        estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : null,
        updated_by: updatedBy,
        is_automatic: false,
      };

      const tracking = await orderTrackingModel.addTrackingUpdate(trackingData);

      res.json({
        success: true,
        message: 'Tracking update added successfully',
        data: tracking
      });
    } catch (error) {
      logger.error('Add tracking update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add tracking update',
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();

