const brandModel = require('../models/BrandModel');
const productModel = require('../models/ProductModel');
const logger = require('../utils/logger');

class BrandController {
  /**
   * Create brand
   */
  async createBrand(req, res) {
    try {
      const brandId = await brandModel.createBrand(req.body);

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: { brandId }
      });
    } catch (error) {
      logger.error('Create brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create brand',
        error: error.message
      });
    }
  }

  /**
   * Get all brands
   */
  async getBrands(req, res) {
    try {
      const filters = {
        status: req.query.status || 'active',
        is_premium: req.query.is_premium === 'true' ? true : undefined
      };

      const brands = await brandModel.getBrands(filters);

      res.json({
        success: true,
        data: brands,
        count: brands.length
      });
    } catch (error) {
      logger.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get brands'
      });
    }
  }

  /**
   * Get brands with product count
   */
  async getBrandsWithCount(req, res) {
    try {
      const brands = await brandModel.getBrandsWithCount();

      res.json({
        success: true,
        data: brands,
        count: brands.length
      });
    } catch (error) {
      logger.error('Get brands with count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get brands with count'
      });
    }
  }

  /**
   * Get brand by ID
   */
  async getBrand(req, res) {
    try {
      const brandId = req.params.id;
      const brand = await brandModel.getBrandById(brandId);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        data: brand
      });
    } catch (error) {
      logger.error('Get brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get brand'
      });
    }
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const brand = await brandModel.getBrandBySlug(slug);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      // Get products for this brand
      const products = await productModel.getProducts({
        brand_id: brand._id || brand.id,
        status: 'active',
        limit: 100
      });

      res.json({
        success: true,
        data: {
          ...brand,
          products
        }
      });
    } catch (error) {
      logger.error('Get brand by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get brand'
      });
    }
  }

  /**
   * Update brand
   */
  async updateBrand(req, res) {
    try {
      const brandId = req.params.id;
      const updated = await brandModel.updateBrand(brandId, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Update brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update brand'
      });
    }
  }

  /**
   * Delete brand
   */
  async deleteBrand(req, res) {
    try {
      const brandId = req.params.id;
      await brandModel.deleteBrand(brandId);

      res.json({
        success: true,
        message: 'Brand deleted successfully'
      });
    } catch (error) {
      logger.error('Delete brand error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete brand'
      });
    }
  }
}

module.exports = new BrandController();
