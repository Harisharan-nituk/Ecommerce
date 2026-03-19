const dbManager = require('../config/database');
const categoryModelMongo = require('./CategoryModelMongo');
const logger = require('../utils/logger');

class CategoryModel {
  /**
   * Create category
   */
  async createCategory(categoryData) {
    // Use MongoDB if enabled
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.createCategory(categoryData);
    }

    // MySQL implementation would go here if needed
    const mysql = dbManager.getMySQL();
    
    try {
      // MySQL implementation for categories
      // Note: This is a placeholder - MySQL doesn't support hierarchical queries as easily
      const [result] = await mysql.query(
        `INSERT INTO tbl_categories 
         (name, slug, parent_id, description, image, level, is_active, sort_order, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          categoryData.name,
          categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
          categoryData.parentId || null,
          categoryData.description || null,
          categoryData.image || null,
          categoryData.level || 0,
          categoryData.isActive !== false ? 1 : 0,
          categoryData.sortOrder || 0
        ]
      );

      return result.insertId;
    } catch (error) {
      logger.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.getCategoryById(categoryId);
    }

    // MySQL implementation
    const mysql = dbManager.getMySQL();
    
    try {
      const [categories] = await mysql.query(
        'SELECT * FROM tbl_categories WHERE id = ? AND is_active = 1',
        [categoryId]
      );

      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      logger.error('Get category by ID error:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(filters = {}) {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.getAllCategories(filters);
    }

    // MySQL implementation
    const mysql = dbManager.getMySQL();
    
    try {
      let query = 'SELECT * FROM tbl_categories WHERE is_active = 1';
      const params = [];

      if (filters.parentId !== undefined) {
        if (filters.parentId === null) {
          query += ' AND parent_id IS NULL';
        } else {
          query += ' AND parent_id = ?';
          params.push(filters.parentId);
        }
      }

      if (filters.level !== undefined) {
        query += ' AND level = ?';
        params.push(filters.level);
      }

      query += ' ORDER BY sort_order ASC, name ASC';

      const [categories] = await mysql.query(query, params);
      return categories;
    } catch (error) {
      logger.error('Get all categories error:', error);
      throw error;
    }
  }

  /**
   * Get category tree
   */
  async getCategoryTree() {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.getCategoryTree();
    }

    // MySQL implementation - recursive CTE for hierarchical data
    const mysql = dbManager.getMySQL();
    
    try {
      // Get root categories with their children recursively
      const [categories] = await mysql.query(`
        WITH RECURSIVE category_tree AS (
          SELECT id, name, slug, parent_id, level, sort_order, description, image
          FROM tbl_categories
          WHERE parent_id IS NULL AND is_active = 1
          
          UNION ALL
          
          SELECT c.id, c.name, c.slug, c.parent_id, c.level, c.sort_order, c.description, c.image
          FROM tbl_categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
          WHERE c.is_active = 1
        )
        SELECT * FROM category_tree
        ORDER BY level, sort_order, name
      `);

      // Build tree structure
      const tree = [];
      const categoryMap = new Map();

      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      categories.forEach(cat => {
        if (cat.parent_id === null) {
          tree.push(categoryMap.get(cat.id));
        } else {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(categoryMap.get(cat.id));
          }
        }
      });

      return tree;
    } catch (error) {
      logger.error('Get category tree error:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.updateCategory(categoryId, updateData);
    }

    // MySQL implementation
    const mysql = dbManager.getMySQL();
    
    try {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      values.push(categoryId);

      await mysql.query(
        `UPDATE tbl_categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );

      return await this.getCategoryById(categoryId);
    } catch (error) {
      logger.error('Update category error:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.deleteCategory(categoryId);
    }

    // MySQL implementation (soft delete)
    const mysql = dbManager.getMySQL();
    
    try {
      await mysql.query(
        'UPDATE tbl_categories SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [categoryId]
      );

      return await this.getCategoryById(categoryId);
    } catch (error) {
      logger.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    if (process.env.USE_MONGODB === 'true' || process.env.USE_MONGODB === true) {
      return await categoryModelMongo.getCategoryBySlug(slug);
    }

    // MySQL implementation
    const mysql = dbManager.getMySQL();
    
    try {
      const [categories] = await mysql.query(
        'SELECT * FROM tbl_categories WHERE slug = ? AND is_active = 1',
        [slug]
      );

      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      logger.error('Get category by slug error:', error);
      throw error;
    }
  }
}

module.exports = new CategoryModel();
