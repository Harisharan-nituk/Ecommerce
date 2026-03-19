const inventoryModel = require('../models/InventoryModel');
const productModel = require('../models/ProductModel');
const logger = require('../utils/logger');

class InventoryController {
  /**
   * Get inventory summary
   */
  async getInventorySummary(req, res) {
    try {
      const summary = await inventoryModel.getInventorySummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Get inventory summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory summary',
        error: error.message
      });
    }
  }

  /**
   * Get all products with inventory info
   */
  async getInventoryList(req, res) {
    try {
      const filters = {
        status: req.query.status || 'active',
        low_stock: req.query.low_stock === 'true',
        out_of_stock: req.query.out_of_stock === 'true',
        search: req.query.search,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0
      };

      let products;
      if (filters.low_stock) {
        products = await inventoryModel.getLowStockProducts(10);
      } else if (filters.out_of_stock) {
        // Get out of stock products
        if (process.env.USE_MONGODB === 'true') {
          const Product = require('../models/mongoose/Product');
          products = await Product.find({ stock: 0, status: 'active' })
            .populate('category_id', 'name')
            .limit(parseInt(filters.limit))
            .lean();
        } else {
          const mysql = require('../config/database').mysql;
          const [rows] = await mysql.query(
            'SELECT * FROM tbl_products WHERE stock = 0 AND status = ? LIMIT ?',
            ['active', parseInt(filters.limit)]
          );
          products = rows;
        }
      } else {
        products = await productModel.getProducts(filters);
      }

      // Add stock status to each product
      const inventoryList = products.map(product => ({
        ...product,
        stockStatus: this.getStockStatus(product.stock || 0)
      }));

      res.json({
        success: true,
        data: inventoryList,
        count: inventoryList.length
      });
    } catch (error) {
      logger.error('Get inventory list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory list',
        error: error.message
      });
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(req, res) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products = await inventoryModel.getLowStockProducts(threshold);

      res.json({
        success: true,
        data: products,
        count: products.length,
        threshold
      });
    } catch (error) {
      logger.error('Get low stock products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get low stock products',
        error: error.message
      });
    }
  }

  /**
   * Get product inventory history
   */
  async getProductHistory(req, res) {
    try {
      const productId = req.params.id;
      const limit = parseInt(req.query.limit) || 50;

      const history = await inventoryModel.getProductHistory(productId, limit);

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      logger.error('Get product history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product history',
        error: error.message
      });
    }
  }

  /**
   * Update product stock
   */
  async updateStock(req, res) {
    try {
      const productId = req.params.id;
      const { quantity, movement_type, reason, notes } = req.body;
      const performedBy = req.user?.id || null;

      if (!quantity || !movement_type) {
        return res.status(400).json({
          success: false,
          message: 'Quantity and movement_type are required'
        });
      }

      const result = await inventoryModel.adjustStock(
        productId,
        Math.abs(quantity),
        movement_type,
        reason,
        performedBy,
        null
      );

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stock',
        error: error.message
      });
    }
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(req, res) {
    try {
      const { updates } = req.body; // Array of { productId, quantity, movement_type, reason }
      const performedBy = req.user?.id || null;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const results = [];
      const errors = [];

      for (const update of updates) {
        try {
          const result = await inventoryModel.adjustStock(
            update.productId,
            Math.abs(update.quantity),
            update.movement_type || 'adjustment',
            update.reason,
            performedBy,
            null
          );
          results.push(result);
        } catch (error) {
          errors.push({
            productId: update.productId,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Updated ${results.length} products`,
        data: {
          successful: results,
          errors: errors
        }
      });
    } catch (error) {
      logger.error('Bulk update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update stock',
        error: error.message
      });
    }
  }

  /**
   * Get stock status helper
   */
  getStockStatus(stock) {
    if (stock === 0) return 'out_of_stock';
    if (stock <= 10) return 'low_stock';
    if (stock <= 50) return 'medium_stock';
    return 'in_stock';
  }
}

module.exports = new InventoryController();
