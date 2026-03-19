const { getSupabaseClient, bucketName, getPublicUrl, isConfigured } = require('../config/supabase');
const logger = require('../utils/logger');
const path = require('path');
const crypto = require('crypto');

class ImageUploadService {
  /**
   * Upload image to Supabase Storage
   * @param {Buffer|Stream} fileBuffer - File buffer or stream
   * @param {String} originalFileName - Original file name
   * @param {String} folder - Folder path in bucket (e.g., 'products', 'users')
   * @returns {Object} { url, path, publicUrl }
   */
  async uploadImage(fileBuffer, originalFileName, folder = 'products') {
    if (!isConfigured()) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    }

    try {
      const supabase = getSupabaseClient();

      // Generate unique filename
      const fileExt = path.extname(originalFileName);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: this.getContentType(fileExt),
          upsert: false // Don't overwrite existing files
        });

      if (error) {
        logger.error('Supabase upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const publicUrl = getPublicUrl(filePath);

      logger.info(`Image uploaded successfully: ${filePath}`);

      return {
        success: true,
        path: filePath,
        url: publicUrl,
        fileName: fileName,
        folder: folder
      };
    } catch (error) {
      logger.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Delete image from Supabase Storage
   * @param {String} filePath - Path to file in bucket
   */
  async deleteImage(filePath) {
    if (!isConfigured()) {
      throw new Error('Supabase is not configured');
    }

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        logger.error('Supabase delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }

      logger.info(`Image deleted successfully: ${filePath}`);
      return { success: true };
    } catch (error) {
      logger.error('Image delete error:', error);
      throw error;
    }
  }

  /**
   * Update image (delete old, upload new)
   * @param {Buffer} newFileBuffer - New file buffer
   * @param {String} originalFileName - Original file name
   * @param {String} oldFilePath - Old file path to delete
   * @param {String} folder - Folder path
   */
  async updateImage(newFileBuffer, originalFileName, oldFilePath = null, folder = 'products') {
    try {
      // Delete old image if exists
      if (oldFilePath) {
        try {
          await this.deleteImage(oldFilePath);
        } catch (error) {
          logger.warn('Failed to delete old image, continuing with upload:', error.message);
        }
      }

      // Upload new image
      return await this.uploadImage(newFileBuffer, originalFileName, folder);
    } catch (error) {
      logger.error('Image update error:', error);
      throw error;
    }
  }

  /**
   * Get content type from file extension
   */
  getContentType(fileExt) {
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };

    return contentTypes[fileExt.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Validate image file
   */
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      throw new Error('No file provided');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Allowed types: JPEG, PNG, GIF, WebP');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    return true;
  }
}

module.exports = new ImageUploadService();
