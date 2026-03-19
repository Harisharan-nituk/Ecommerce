const logger = require('../utils/logger');

class InventoryModel {
  constructor() {
    this.useMongoDB = process.env.MONGODB_ENABLED === 'true';
  }

  /**
   * Get current stock for a product
   */
  async getProductStock(productId) {
    try {
      if (this.useMongoDB) {
        const Product = require('./mongoose/Product');
        const product = await Product.findById(productId).select('stock name');
        return product ? product.stock : null;
      } else {
        // MySQL implementation
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT stock FROM tbl_products WHERE id = ?',
          [productId]
        );
        return rows.length > 0 ? rows[0].stock : null;
      }
    } catch (error) {
      logger.error('Get product stock error:', error);
      throw error;
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId, newStock) {
    try {
      if (this.useMongoDB) {
        const Product = require('./mongoose/Product');
        const product = await Product.findById(productId);
        if (!product) return null;
        
        product.stock = newStock;
        product.updated_at = new Date();
        await product.save();
        return product;
      } else {
        const mysql = require('../config/database').mysql;
        await mysql.query(
          'UPDATE tbl_products SET stock = ?, updated_at = NOW() WHERE id = ?',
          [newStock, productId]
        );
        return { id: productId, stock: newStock };
      }
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }

  /**
   * Add inventory movement record
   */
  async addMovement(data) {
    try {
      if (this.useMongoDB) {
        const InventoryMovement = require('./mongoose/Inventory');
        return await InventoryMovement.addMovement(data);
      } else {
        // MySQL implementation (if needed)
        logger.warn('Inventory movements not implemented for MySQL');
        return null;
      }
    } catch (error) {
      logger.error('Add inventory movement error:', error);
      throw error;
    }
  }

  /**
   * Get inventory history for a product
   */
  async getProductHistory(productId, limit = 50) {
    try {
      if (this.useMongoDB) {
        const InventoryMovement = require('./mongoose/Inventory');
        return await InventoryMovement.getProductHistory(productId, limit);
      } else {
        return [];
      }
    } catch (error) {
      logger.error('Get product history error:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 10) {
    try {
      if (this.useMongoDB) {
        const InventoryMovement = require('./mongoose/Inventory');
        return await InventoryMovement.getLowStockProducts(threshold);
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT id, name, stock, sku FROM tbl_products WHERE stock <= ? AND status = ?',
          [threshold, 'active']
        );
        return rows;
      }
    } catch (error) {
      logger.error('Get low stock products error:', error);
      throw error;
    }
  }

  /**
   * Adjust stock (add or subtract)
   */
  async adjustStock(productId, quantity, movementType, reason = null, performedBy = null, referenceId = null) {
    try {
      const currentStock = await this.getProductStock(productId);
      if (currentStock === null) {
        throw new Error('Product not found');
      }

      let newStock;
      if (movementType === 'purchase' || movementType === 'return' || movementType === 'adjustment') {
        // Adding stock
        newStock = currentStock + Math.abs(quantity);
      } else if (movementType === 'sale' || movementType === 'damage') {
        // Subtracting stock
        newStock = Math.max(0, currentStock - Math.abs(quantity));
      } else {
        newStock = quantity; // Direct set for initial or transfer
      }

      // Update product stock
      await this.updateStock(productId, newStock);

      // Record movement
      await this.addMovement({
        product_id: productId,
        movement_type: movementType,
        quantity: movementType === 'sale' || movementType === 'damage' ? -Math.abs(quantity) : Math.abs(quantity),
        previous_stock: currentStock,
        new_stock: newStock,
        reason: reason,
        reference_id: referenceId,
        reference_type: referenceId ? (movementType === 'sale' ? 'order' : 'adjustment') : null,
        performed_by: performedBy,
      });

      return {
        productId,
        previousStock: currentStock,
        newStock,
        quantity: Math.abs(quantity),
      };
    } catch (error) {
      logger.error('Adjust stock error:', error);
      throw error;
    }
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary() {
    try {
      if (this.useMongoDB) {
        const Product = require('./mongoose/Product');
        const InventoryMovement = require('./mongoose/Inventory');
        
        const totalProducts = await Product.countDocuments({ status: 'active' });
        const outOfStock = await Product.countDocuments({ stock: 0, status: 'active' });
        const lowStock = await Product.countDocuments({ 
          stock: { $lte: 10, $gt: 0 }, 
          status: 'active' 
        });
        const inStock = await Product.countDocuments({ 
          stock: { $gt: 10 }, 
          status: 'active' 
        });
        
        const totalValue = await Product.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } }
        ]);

        return {
          totalProducts,
          outOfStock,
          lowStock,
          inStock,
          totalValue: totalValue[0]?.total || 0,
        };
      } else {
        const mysql = require('../config/database').mysql;
        const [summary] = await mysql.query(`
          SELECT 
            COUNT(*) as totalProducts,
            SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock,
            SUM(CASE WHEN stock > 0 AND stock <= 10 THEN 1 ELSE 0 END) as lowStock,
            SUM(CASE WHEN stock > 10 THEN 1 ELSE 0 END) as inStock,
            SUM(stock * price) as totalValue
          FROM tbl_products
          WHERE status = 'active'
        `);
        return summary[0] || {};
      }
    } catch (error) {
      logger.error('Get inventory summary error:', error);
      throw error;
    }
  }
}

module.exports = new InventoryModel();
