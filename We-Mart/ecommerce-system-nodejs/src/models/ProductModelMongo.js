const { Product } = require('./mongoose');
const logger = require('../utils/logger');

class ProductModelMongo {
  /**
   * Create product
   */
  async createProduct(productData) {
    try {
      const product = await Product.create({
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        stock: productData.stock || 0,
        category_id: productData.category_id || null,
        category: productData.category || null,
        subcategory: productData.subcategory || null,
        brand: productData.brand || null,
        brand_id: productData.brand_id || null,
        sku: productData.sku || null,
        status: productData.status || 'active',
        image_url: productData.image_url || productData.image_urls?.[0] || null,
        image_urls: productData.image_urls || [],
        sizes: productData.sizes || [],
        seller_id: productData.seller_id || null,
      });
      return product._id.toString();
    } catch (error) {
      logger.error('Create product error:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId) {
    try {
      // Don't populate category_id since Category model doesn't exist yet
      const product = await Product.findById(productId).lean();
      
      if (!product) return null;
      
      return {
        ...product,
        id: product._id.toString(),
        _id: product._id.toString(),
        category_name: null, // Category model not implemented yet
        seller_id: product.seller_id?.toString() || product.seller_id || null,
      };
    } catch (error) {
      logger.error('Get product error:', error);
      throw error;
    }
  }

  /**
   * Get all products with filters
   */
  async getProducts(filters = {}) {
    try {
      const query = {};
      
      if (filters.category_id) {
        query.category_id = filters.category_id;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.subcategory) {
        query.subcategory = filters.subcategory;
      }
      
      if (filters.brand) {
        query.brand = filters.brand;
      }
      
      if (filters.status) {
        query.status = filters.status;
      } else {
        // By default, only show active products to customers
        query.status = 'active';
      }
      
      // Filter by seller_id if provided (for seller's own products)
      if (filters.seller_id) {
        query.seller_id = filters.seller_id;
      }
      
      // Use search only if category/subcategory not specified
      if (filters.search && !filters.category && !filters.subcategory) {
        query.$text = { $search: filters.search };
      }
      
      if (filters.min_price || filters.max_price) {
        query.price = {};
        if (filters.min_price) query.price.$gte = parseFloat(filters.min_price);
        if (filters.max_price) query.price.$lte = parseFloat(filters.max_price);
      }

      const options = {
        sort: { created_at: -1 },
      };

      if (filters.limit) {
        options.limit = parseInt(filters.limit);
        if (filters.offset) {
          options.skip = parseInt(filters.offset);
        }
      }

      // Don't populate category_id since Category model doesn't exist yet
      const products = await Product.find(query, null, options).lean();

      return products.map(product => ({
        ...product,
        id: product._id.toString(),
        category_name: null, // Category model not implemented yet
        seller_id: product.seller_id?.toString() || product.seller_id || null,
      }));
    } catch (error) {
      logger.error('Get products error:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    try {
      const updateData = {
        updated_at: new Date(),
      };

      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.stock !== undefined) updateData.stock = productData.stock;
      if (productData.category_id !== undefined) updateData.category_id = productData.category_id;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.subcategory !== undefined) updateData.subcategory = productData.subcategory;
      if (productData.brand !== undefined) updateData.brand = productData.brand;
      if (productData.brand_id !== undefined) updateData.brand_id = productData.brand_id;
      if (productData.status !== undefined) updateData.status = productData.status;
      if (productData.image_url !== undefined) updateData.image_url = productData.image_url;
      if (productData.image_urls !== undefined) updateData.image_urls = productData.image_urls;
      if (productData.sizes !== undefined) updateData.sizes = productData.sizes;

      const product = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { new: true }
      );

      return product !== null;
    } catch (error) {
      logger.error('Update product error:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      await Product.findByIdAndUpdate(productId, {
        $set: { status: 'deleted', updated_at: new Date() }
      });
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
    try {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: quantity },
        $set: { updated_at: new Date() }
      });
      return true;
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }
}

module.exports = new ProductModelMongo();

