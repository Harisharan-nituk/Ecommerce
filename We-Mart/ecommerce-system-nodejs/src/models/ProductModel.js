const dbManager = require('../config/database');
const logger = require('../utils/logger');
const productModelMongo = require('./ProductModelMongo');

class ProductModel {
  /**
   * Create product
   */
  async createProduct(productData) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.createProduct(productData);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      // Handle image_urls - store as JSON string in MySQL
      const image_urls_json = productData.image_urls && productData.image_urls.length > 0
        ? JSON.stringify(productData.image_urls)
        : null;
      
      // Handle sizes - store as JSON string in MySQL
      const sizes_json = productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0
        ? JSON.stringify(productData.sizes)
        : null;
      
      const [result] = await mysql.query(
        `INSERT INTO tbl_products 
         (name, description, price, stock, category_id, category, subcategory, brand, brand_id, sku, status, image_url, image_urls, sizes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          productData.name,
          productData.description || null,
          productData.price,
          productData.stock || 0,
          productData.category_id || null,
          productData.category || null,
          productData.subcategory || null,
          productData.brand || null,
          productData.brand_id || null,
          productData.sku || null,
          productData.status || 'active',
          productData.image_url || productData.image_urls?.[0] || null,
          image_urls_json,
          sizes_json
        ]
      );

      return result.insertId;
    } catch (error) {
      logger.error('Create product error:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.getProductById(productId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      const [products] = await mysql.query(
        `SELECT p.*, c.name as category_name 
         FROM tbl_products p
         LEFT JOIN tbl_categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [productId]
      );

      if (products.length > 0) {
        const product = products[0];
        // Parse JSON fields
        if (product.image_urls && typeof product.image_urls === 'string') {
          try {
            product.image_urls = JSON.parse(product.image_urls);
          } catch (e) {
            product.image_urls = [];
          }
        }
        if (product.sizes && typeof product.sizes === 'string') {
          try {
            product.sizes = JSON.parse(product.sizes);
          } catch (e) {
            product.sizes = [];
          }
        }
        return product;
      }
      return null;
    } catch (error) {
      logger.error('Get product error:', error);
      throw error;
    }
  }

  /**
   * Get all products with filters
   */
  async getProducts(filters = {}) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.getProducts(filters);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      let query = 'SELECT p.*, c.name as category_name FROM tbl_products p LEFT JOIN tbl_categories c ON p.category_id = c.id WHERE 1=1';
      const params = [];

      if (filters.category_id) {
        query += ' AND p.category_id = ?';
        params.push(filters.category_id);
      }

      if (filters.category) {
        query += ' AND p.category = ?';
        params.push(filters.category);
      }

      if (filters.subcategory) {
        query += ' AND p.subcategory = ?';
        params.push(filters.subcategory);
      }

      if (filters.brand) {
        query += ' AND p.brand = ?';
        params.push(filters.brand);
      }

      if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }

      // Use search only if category/subcategory not specified
      if (filters.search && !filters.category && !filters.subcategory) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filters.min_price) {
        query += ' AND p.price >= ?';
        params.push(filters.min_price);
      }

      if (filters.max_price) {
        query += ' AND p.price <= ?';
        params.push(filters.max_price);
      }

      query += ' ORDER BY p.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }

      const [products] = await mysql.query(query, params);
      // Parse JSON fields for each product
      return products.map(product => {
        if (product.image_urls && typeof product.image_urls === 'string') {
          try {
            product.image_urls = JSON.parse(product.image_urls);
          } catch (e) {
            product.image_urls = [];
          }
        }
        if (product.sizes && typeof product.sizes === 'string') {
          try {
            product.sizes = JSON.parse(product.sizes);
          } catch (e) {
            product.sizes = [];
          }
        }
        return product;
      });
    } catch (error) {
      logger.error('Get products error:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    // Handle image_urls - store as JSON string in MySQL
    const image_urls_json = productData.image_urls && productData.image_urls.length > 0
      ? JSON.stringify(productData.image_urls)
      : null;
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.updateProduct(productId, productData);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      const updates = [];
      const params = [];

      if (productData.name !== undefined) {
        updates.push('name = ?');
        params.push(productData.name);
      }
      if (productData.description !== undefined) {
        updates.push('description = ?');
        params.push(productData.description);
      }
      if (productData.category !== undefined) {
        updates.push('category = ?');
        params.push(productData.category);
      }
      if (productData.subcategory !== undefined) {
        updates.push('subcategory = ?');
        params.push(productData.subcategory);
      }
      if (productData.brand !== undefined) {
        updates.push('brand = ?');
        params.push(productData.brand);
      }
      if (productData.brand_id !== undefined) {
        updates.push('brand_id = ?');
        params.push(productData.brand_id);
      }
      if (productData.price !== undefined) {
        updates.push('price = ?');
        params.push(productData.price);
      }
      if (productData.stock !== undefined) {
        updates.push('stock = ?');
        params.push(productData.stock);
      }
      if (productData.category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(productData.category_id);
      }
      if (productData.status !== undefined) {
        updates.push('status = ?');
        params.push(productData.status);
      }
      if (productData.image_url !== undefined) {
        updates.push('image_url = ?');
        params.push(productData.image_url);
      }
      if (productData.image_urls !== undefined) {
        const image_urls_json = productData.image_urls && productData.image_urls.length > 0
          ? JSON.stringify(productData.image_urls)
          : null;
        updates.push('image_urls = ?');
        params.push(image_urls_json);
      }
      if (productData.sizes !== undefined) {
        const sizes_json = productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0
          ? JSON.stringify(productData.sizes)
          : null;
        updates.push('sizes = ?');
        params.push(sizes_json);
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updated_at = NOW()');
      params.push(productId);

      await mysql.query(
        `UPDATE tbl_products SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return true;
    } catch (error) {
      logger.error('Update product error:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.deleteProduct(productId);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query('UPDATE tbl_products SET status = ? WHERE id = ?', ['deleted', productId]);
      return true;
    } catch (error) {
      logger.error('Delete product error:', error);
      throw error;
    }
  }

  /**
   * Update stock
   */
  async updateStock(productId, quantity) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true') {
      return await productModelMongo.updateStock(productId, quantity);
    }
    
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query(
        'UPDATE tbl_products SET stock = stock + ?, updated_at = NOW() WHERE id = ?',
        [quantity, productId]
      );
      return true;
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }
}

module.exports = new ProductModel();

