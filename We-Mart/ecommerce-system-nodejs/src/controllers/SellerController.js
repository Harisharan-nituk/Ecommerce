const productModel = require('../models/ProductModel');
const orderModel = require('../models/OrderModel');
const userModel = require('../models/UserModel');
const { SellerApplication, Role, UserRole } = require('../models/mongoose');
const logger = require('../utils/logger');

/**
 * Seller Controller
 * Handles all seller-specific operations
 */
class SellerController {
  /**
   * Register as seller (public endpoint)
   */
  async registerAsSeller(req, res) {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        phone,
        business_name,
        business_address,
        business_pincode,
        business_description,
        pan_card,
        aadhaar,
        account_number,
        tax_id,
      } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name || !phone || 
          !business_name || !business_address || !business_pincode || 
          !business_description || !pan_card || !aadhaar || !account_number) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
        });
      }

      // Convert PAN to uppercase and validate format (ABCDE1234F)
      const panCardUpper = (pan_card || '').toUpperCase().trim();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCardUpper)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PAN card format. Must be in format: ABCDE1234F',
        });
      }

      // Validate Aadhaar format (12 digits)
      if (!/^[0-9]{12}$/.test(aadhaar)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Aadhaar number. Must be 12 digits',
        });
      }

      // Validate Pincode format (6 digits)
      if (!/^[0-9]{6}$/.test(business_pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pincode. Must be 6 digits',
        });
      }

      // Validate Account Number format (9-18 digits)
      if (!/^[0-9]{9,18}$/.test(account_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid account number. Must be 9-18 digits',
        });
      }

      // Check if user already exists
      const { User } = require('../models/mongoose');
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists. Please login instead.',
        });
      }

      // Create user account
      const userId = await userModel.createUser({
        email,
        password,
        phone,
        first_name,
        last_name,
        status: 'active',
      });

      // Convert userId string to ObjectId for proper reference
      const mongoose = require('mongoose');
      const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;

      // Create seller application with proper ObjectId reference
      const sellerApplication = new SellerApplication({
        user_id: userObjectId,
        business_name,
        business_address,
        business_pincode,
        business_description,
        pan_card: panCardUpper, // Use the validated uppercase version
        aadhaar,
        account_number,
        tax_id: tax_id || null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });
      await sellerApplication.save();
      
      // Note: User will be assigned "Vendor/Seller" role after admin approval

      res.status(201).json({
        success: true,
        message: 'Seller registration submitted successfully. Your application is under review.',
        data: {
          userId,
          applicationId: sellerApplication._id.toString(),
        },
      });
    } catch (error) {
      logger.error('Seller registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit seller registration',
        error: error.message,
      });
    }
  }
  /**
   * Get seller's own products
   */
  async getMyProducts(req, res) {
    try {
      const sellerId = req.user.id;
      const filters = {
        seller_id: sellerId,
        ...req.query,
      };

      const products = await productModel.getProducts(filters);

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      logger.error('Get seller products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  /**
   * Create product (seller's own)
   */
  async createProduct(req, res) {
    try {
      const sellerId = req.user.id;
      const productData = {
        ...req.body,
        seller_id: sellerId,
      };

      const productId = await productModel.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { productId },
      });
    } catch (error) {
      logger.error('Create seller product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }

  /**
   * Update seller's own product
   */
  async updateProduct(req, res) {
    try {
      const sellerId = req.user.id;
      const productId = req.params.id;

      // Verify product belongs to seller
      const product = await productModel.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if product belongs to this seller
      const productSellerId = product.seller_id?.toString() || product.seller_id;
      if (productSellerId && productSellerId !== sellerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own products',
        });
      }

      await productModel.updateProduct(productId, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (error) {
      logger.error('Update seller product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  /**
   * Delete seller's own product
   */
  async deleteProduct(req, res) {
    try {
      const sellerId = req.user.id;
      const productId = req.params.id;

      // Verify product belongs to seller
      const product = await productModel.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if product belongs to this seller
      const productSellerId = product.seller_id?.toString() || product.seller_id;
      if (productSellerId && productSellerId !== sellerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own products',
        });
      }

      await productModel.deleteProduct(productId);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('Delete seller product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }

  /**
   * Get seller's orders (orders containing seller's products)
   */
  async getMyOrders(req, res) {
    try {
      const sellerId = req.user.id;
      
      // Get all products by this seller
      const sellerProducts = await productModel.getProducts({ seller_id: sellerId });
      const productIds = sellerProducts.map(p => {
        const pid = p.id || p._id;
        return pid?.toString() || pid;
      });

      // Get all orders
      const allOrders = await orderModel.getAllOrders(req.query);

      // Filter orders that contain seller's products
      const sellerOrders = allOrders.filter(order => {
        if (!order.items || !Array.isArray(order.items)) return false;
        return order.items.some(item => {
          const itemProductId = item.product_id?.toString() || item.product_id;
          return productIds.some(pid => pid.toString() === itemProductId.toString());
        });
      });

      res.json({
        success: true,
        data: sellerOrders,
        count: sellerOrders.length,
      });
    } catch (error) {
      logger.error('Get seller orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  }

  /**
   * Get seller dashboard stats
   */
  async getDashboardStats(req, res) {
    try {
      const sellerId = req.user.id;

      // Get seller's products
      const products = await productModel.getProducts({ seller_id: sellerId });
      
      // Get seller's orders
      const sellerProductIds = products.map(p => {
        const pid = p.id || p._id;
        return pid?.toString() || pid;
      });
      const allOrders = await orderModel.getAllOrders({});
      const sellerOrders = allOrders.filter(order => {
        if (!order.items || !Array.isArray(order.items)) return false;
        return order.items.some(item => {
          const itemProductId = item.product_id?.toString() || item.product_id;
          return sellerProductIds.some(pid => pid.toString() === itemProductId.toString());
        });
      });

      // Calculate stats
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.status === 'active').length;
      const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;
      
      const totalOrders = sellerOrders.length;
      const pendingOrders = sellerOrders.filter(o => o.status === 'pending').length;
      const processingOrders = sellerOrders.filter(o => o.status === 'processing').length;
      const completedOrders = sellerOrders.filter(o => o.status === 'delivered').length;

      // Calculate total revenue
      const totalRevenue = sellerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => {
          const orderItems = order.items || [];
          const sellerItems = orderItems.filter(item => {
            const itemProductId = item.product_id?.toString() || item.product_id;
            return sellerProductIds.some(pid => pid.toString() === itemProductId.toString());
          });
          const orderTotal = sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0);
          return sum + orderTotal;
        }, 0);

      res.json({
        success: true,
        data: {
          products: {
            total: totalProducts,
            active: activeProducts,
            lowStock: lowStockProducts,
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            completed: completedOrders,
          },
          revenue: {
            total: totalRevenue,
            currency: 'USD',
          },
        },
      });
    } catch (error) {
      logger.error('Get seller dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message,
      });
    }
  }

  /**
   * Update order status (for seller's orders)
   */
  async updateOrderStatus(req, res) {
    try {
      const sellerId = req.user.id;
      const orderId = req.params.id;
      const { status } = req.body;

      // Verify order contains seller's products
      const sellerProducts = await productModel.getProducts({ seller_id: sellerId });
      const productIds = sellerProducts.map(p => {
        const pid = p.id || p._id;
        return pid?.toString() || pid;
      });
      
      const order = await orderModel.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const hasSellerProducts = order.items?.some(item => {
        const itemProductId = item.product_id?.toString() || item.product_id;
        return productIds.some(pid => pid.toString() === itemProductId.toString());
      });

      if (!hasSellerProducts) {
        return res.status(403).json({
          success: false,
          message: 'This order does not contain your products',
        });
      }

      await orderModel.updateOrderStatus(orderId, status);

      res.json({
        success: true,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      logger.error('Update seller order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error.message,
      });
    }
  }
}

module.exports = new SellerController();

