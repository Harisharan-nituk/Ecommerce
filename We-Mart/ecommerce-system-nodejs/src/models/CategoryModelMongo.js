const Category = require('./mongoose/Category');
const logger = require('../utils/logger');

class CategoryModelMongo {
  /**
   * Create category
   */
  async createCategory(categoryData) {
    try {
      // Determine level based on parent
      let level = 0;
      if (categoryData.parentId) {
        const parent = await Category.findById(categoryData.parentId);
        if (parent) {
          level = parent.level + 1;
        }
      }

      // Generate slug if not provided
      if (!categoryData.slug && categoryData.name) {
        categoryData.slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
      }

      const category = await Category.create({
        ...categoryData,
        level
      });

      return category._id.toString();
    } catch (error) {
      logger.error('Create category error:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId)
        .populate('parent', 'name slug level')
        .populate('children', 'name slug level isActive');
      
      return category ? category.toObject() : null;
    } catch (error) {
      logger.error('Get category by ID error:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(filters = {}) {
    try {
      const query = { isActive: true };

      if (filters.parentId !== undefined) {
        query.parentId = filters.parentId || null;
      }

      if (filters.level !== undefined) {
        query.level = filters.level;
      }

      const categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort({ sortOrder: 1, name: 1 });

      return categories.map(cat => cat.toObject());
    } catch (error) {
      logger.error('Get all categories error:', error);
      throw error;
    }
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree() {
    try {
      // Get all root categories (parentId is null)
      const rootCategories = await Category.find({
        parentId: null,
        isActive: true
      })
        .populate({
          path: 'children',
          match: { isActive: true },
          populate: {
            path: 'children',
            match: { isActive: true }
          }
        })
        .sort({ sortOrder: 1, name: 1 });

      return rootCategories.map(cat => cat.toObject());
    } catch (error) {
      logger.error('Get category tree error:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    try {
      // If parentId is being updated, recalculate level
      if (updateData.parentId !== undefined) {
        let level = 0;
        if (updateData.parentId) {
          const parent = await Category.findById(updateData.parentId);
          if (parent) {
            level = parent.level + 1;
          }
        }
        updateData.level = level;
      }

      const category = await Category.findByIdAndUpdate(
        categoryId,
        { ...updateData, updated_at: Date.now() },
        { new: true, runValidators: true }
      );

      return category ? category.toObject() : null;
    } catch (error) {
      logger.error('Update category error:', error);
      throw error;
    }
  }

  /**
   * Delete category (soft delete by setting isActive to false)
   */
  async deleteCategory(categoryId) {
    try {
      const category = await Category.findByIdAndUpdate(
        categoryId,
        { isActive: false, updated_at: Date.now() },
        { new: true }
      );

      return category ? category.toObject() : null;
    } catch (error) {
      logger.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Get categories by slug
   */
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug, isActive: true })
        .populate('parent', 'name slug')
        .populate('children', 'name slug level isActive');

      return category ? category.toObject() : null;
    } catch (error) {
      logger.error('Get category by slug error:', error);
      throw error;
    }
  }

  /**
   * Get all descendant category IDs (for filtering products)
   */
  async getDescendantCategoryIds(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return [];
      }

      const descendants = [categoryId];
      const children = await Category.find({ parentId: categoryId, isActive: true });

      for (const child of children) {
        descendants.push(child._id.toString());
        const childDescendants = await this.getDescendantCategoryIds(child._id);
        descendants.push(...childDescendants);
      }

      return descendants;
    } catch (error) {
      logger.error('Get descendant category IDs error:', error);
      throw error;
    }
  }
}

module.exports = new CategoryModelMongo();
