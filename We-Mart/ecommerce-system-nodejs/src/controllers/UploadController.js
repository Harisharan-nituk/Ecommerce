const imageUploadService = require('../services/ImageUploadService');
const multer = require('multer');
const logger = require('../utils/logger');

// Configure multer for memory storage (we'll upload directly to Supabase)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: JPEG, PNG, GIF, WebP'), false);
    }
  }
});

class UploadController {
  /**
   * Upload single image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const folder = req.body.folder || 'products';
      const result = await imageUploadService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        folder
      );

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: result
      });
    } catch (error) {
      logger.error('Upload image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const folder = req.body.folder || 'products';
      const results = [];

      for (const file of req.files) {
        try {
          const result = await imageUploadService.uploadImage(
            file.buffer,
            file.originalname,
            folder
          );
          results.push(result);
        } catch (error) {
          logger.error(`Failed to upload ${file.originalname}:`, error);
          results.push({
            success: false,
            fileName: file.originalname,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Uploaded ${results.filter(r => r.success).length} of ${req.files.length} images`,
        data: results
      });
    } catch (error) {
      logger.error('Upload multiple images error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images'
      });
    }
  }

  /**
   * Delete image
   */
  async deleteImage(req, res) {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      await imageUploadService.deleteImage(filePath);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      logger.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image'
      });
    }
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware(fieldName = 'image', maxCount = 1) {
    if (maxCount === 1) {
      return upload.single(fieldName);
    }
    return upload.array(fieldName, maxCount);
  }
}

module.exports = new UploadController();
