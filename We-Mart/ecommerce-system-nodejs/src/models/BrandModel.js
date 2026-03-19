const logger = require('../utils/logger');

class BrandModel {
  constructor() {
    this.useMongoDB = process.env.MONGODB_ENABLED === 'true';
  }

  /**
   * Create brand
   */
  async createBrand(data) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        const brand = new Brand(data);
        await brand.save();
        return brand._id;
      } else {
        // MySQL implementation
        const mysql = require('../config/database').mysql;
        const [result] = await mysql.query(
          'INSERT INTO tbl_brands (name, slug, description, logo_url, website, is_premium, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [
            data.name,
            data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            data.description || null,
            data.logo_url || null,
            data.website || null,
            data.is_premium || false,
            data.status || 'active'
          ]
        );
        return result.insertId;
      }
    } catch (error) {
      logger.error('Create brand error:', error);
      throw error;
    }
  }

  /**
   * Get all brands
   */
  async getBrands(filters = {}) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        const query = {};
        
        if (filters.status) {
          query.status = filters.status;
        }
        if (filters.is_premium !== undefined) {
          query.is_premium = filters.is_premium;
        }
        
        const brands = await Brand.find(query)
          .sort({ name: 1 })
          .lean();
        
        return brands;
      } else {
        const mysql = require('../config/database').mysql;
        let query = 'SELECT * FROM tbl_brands WHERE 1=1';
        const params = [];
        
        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }
        if (filters.is_premium !== undefined) {
          query += ' AND is_premium = ?';
          params.push(filters.is_premium);
        }
        
        query += ' ORDER BY name ASC';
        const [rows] = await mysql.query(query, params);
        return rows;
      }
    } catch (error) {
      logger.error('Get brands error:', error);
      throw error;
    }
  }

  /**
   * Get brand by ID
   */
  async getBrandById(brandId) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        return await Brand.findById(brandId).lean();
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT * FROM tbl_brands WHERE id = ?',
          [brandId]
        );
        return rows[0] || null;
      }
    } catch (error) {
      logger.error('Get brand by ID error:', error);
      throw error;
    }
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        return await Brand.findOne({ slug }).lean();
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(
          'SELECT * FROM tbl_brands WHERE slug = ?',
          [slug]
        );
        return rows[0] || null;
      }
    } catch (error) {
      logger.error('Get brand by slug error:', error);
      throw error;
    }
  }

  /**
   * Update brand
   */
  async updateBrand(brandId, data) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        const brand = await Brand.findByIdAndUpdate(
          brandId,
          { ...data, updated_at: new Date() },
          { new: true, runValidators: true }
        );
        return brand;
      } else {
        const mysql = require('../config/database').mysql;
        const updateFields = [];
        const params = [];
        
        Object.keys(data).forEach(key => {
          if (key !== 'id') {
            updateFields.push(`${key} = ?`);
            params.push(data[key]);
          }
        });
        
        if (updateFields.length === 0) return null;
        
        updateFields.push('updated_at = NOW()');
        params.push(brandId);
        
        await mysql.query(
          `UPDATE tbl_brands SET ${updateFields.join(', ')} WHERE id = ?`,
          params
        );
        return await this.getBrandById(brandId);
      }
    } catch (error) {
      logger.error('Update brand error:', error);
      throw error;
    }
  }

  /**
   * Delete brand
   */
  async deleteBrand(brandId) {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        await Brand.findByIdAndDelete(brandId);
        return true;
      } else {
        const mysql = require('../config/database').mysql;
        await mysql.query('DELETE FROM tbl_brands WHERE id = ?', [brandId]);
        return true;
      }
    } catch (error) {
      logger.error('Delete brand error:', error);
      throw error;
    }
  }

  /**
   * Get brands with product count
   */
  async getBrandsWithCount() {
    try {
      if (this.useMongoDB) {
        const Brand = require('./mongoose/Brand');
        return await Brand.getBrandsWithCount();
      } else {
        const mysql = require('../config/database').mysql;
        const [rows] = await mysql.query(`
          SELECT 
            b.*,
            COUNT(p.id) as product_count
          FROM tbl_brands b
          LEFT JOIN tbl_products p ON b.id = p.brand_id AND p.status = 'active'
          WHERE b.status = 'active'
          GROUP BY b.id
          ORDER BY product_count DESC, b.name ASC
        `);
        return rows;
      }
    } catch (error) {
      logger.error('Get brands with count error:', error);
      throw error;
    }
  }
}

module.exports = new BrandModel();
