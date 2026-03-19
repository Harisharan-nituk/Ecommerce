const categoryModel = require('../models/CategoryModel');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');

class CategoryController {
  /**
   * Create category
   */
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, parentId, description, image, slug } = req.body;

      const categoryId = await categoryModel.createCategory({
        name,
        parentId: parentId || null,
        description,
        image,
        slug
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { categoryId }
      });
    } catch (error) {
      logger.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const category = await categoryModel.getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      logger.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category'
      });
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(req, res) {
    try {
      const filters = {
        parentId: req.query.parentId !== undefined ? req.query.parentId : undefined,
        level: req.query.level !== undefined ? parseInt(req.query.level) : undefined
      };

      const categories = await categoryModel.getAllCategories(filters);

      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      logger.error('Get all categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories'
      });
    }
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree(req, res) {
    try {
      const tree = await categoryModel.getCategoryTree();

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      logger.error('Get category tree error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category tree'
      });
    }
  }

  /**
   * Update category
   */
  async updateCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const updated = await categoryModel.updateCategory(categoryId, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updated
      });
    } catch (error) {
      logger.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.id;
      const deleted = await categoryModel.deleteCategory(categoryId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      logger.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const category = await categoryModel.getCategoryBySlug(slug);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      logger.error('Get category by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get category'
      });
    }
  }
}

module.exports = new CategoryController();
