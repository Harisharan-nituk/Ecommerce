const productModel = require('../models/ProductModel');
const imageUploadService = require('../services/ImageUploadService');
const logger = require('../utils/logger');

class ProductController {
  /**
   * Create product
   */
  async createProduct(req, res) {
    try {
      let productData = { ...req.body };

      // Handle image upload if file is provided
      if (req.file) {
        try {
          const uploadResult = await imageUploadService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            'products'
          );
          productData.image_url = uploadResult.url;
        } catch (uploadError) {
          logger.error('Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload product image',
            error: uploadError.message
          });
        }
      }

      const productId = await productModel.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { productId }
      });
    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(req, res) {
    try {
      const productId = req.params.id;
      const product = await productModel.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product'
      });
    }
  }

  /**
   * Get all products (visible to customers - only active products)
   */
  async getProducts(req, res) {
    try {
      const filters = {
        category_id: req.query.category_id,
        category: req.query.category, // Main category: men, women, kids, etc.
        subcategory: req.query.subcategory, // Subcategory: T-Shirts, Lipstick, etc.
        brand: req.query.brand, // Brand name
        status: 'active', // Only show active products to customers
        search: req.query.search, // Fallback text search
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
      };

      const products = await productModel.getProducts(filters);

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      logger.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get products'
      });
    }
  }

  /**
   * Update product
   */
  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      let updateData = { ...req.body };

      // Get existing product to check for old image
      const existingProduct = await productModel.getProductById(productId);
      let oldImagePath = null;

      if (existingProduct && existingProduct.image_url) {
        // Extract path from URL if it's a Supabase URL
        const url = existingProduct.image_url;
        const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
        if (match) {
          oldImagePath = match[1];
        }
      }

      // Handle image upload if new file is provided
      if (req.file) {
        try {
          const uploadResult = await imageUploadService.updateImage(
            req.file.buffer,
            req.file.originalname,
            oldImagePath,
            'products'
          );
          updateData.image_url = uploadResult.url;
        } catch (uploadError) {
          logger.error('Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload product image',
            error: uploadError.message
          });
        }
      }

      const updated = await productModel.updateProduct(productId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      await productModel.deleteProduct(productId);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }
}

module.exports = new ProductController();

