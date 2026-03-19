const CommunicationCategory = require('../models/mongoose/CommunicationCategory');
const EmailTemplate = require('../models/mongoose/EmailTemplate');
const SmsTemplate = require('../models/mongoose/SmsTemplate');
const WhatsAppTemplate = require('../models/mongoose/WhatsAppTemplate');
const BouncedEmail = require('../models/mongoose/BouncedEmail');
const BouncedMobile = require('../models/mongoose/BouncedMobile');
const logger = require('../utils/logger');

class SharedController {
  /**
   * Get communication categories
   */
  async getCommunicationCategory(req, res) {
    try {
      const { status = 'active' } = req.query;
      const categories = await CommunicationCategory.find({ status }).sort({ name: 1 });

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Get communication category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get communication categories',
      });
    }
  }

  /**
   * Get template list
   */
  async getTemplateList(req, res) {
    try {
      const { type } = req.params; // email, sms, whatsapp
      const { category, status = 'active' } = req.query;

      let Template;
      switch (type) {
        case 'email':
          Template = EmailTemplate;
          break;
        case 'sms':
          Template = SmsTemplate;
          break;
        case 'whatsapp':
          Template = WhatsAppTemplate;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid template type',
          });
      }

      const query = { status };
      if (category) {
        query.category = category;
      }

      const templates = await Template.find(query).sort({ name: 1 });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      logger.error('Get template list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get template list',
      });
    }
  }

  /**
   * Add bounced user
   */
  async addBouncedUser(req, res) {
    try {
      const { type } = req.params; // email, mobile
      const { value, bounce_type = 'hard', reason = null, template_id = null } = req.body;

      if (type === 'email') {
        const BouncedEmail = require('../models/mongoose/BouncedEmail');
        await BouncedEmail.findOneAndUpdate(
          { email: value.toLowerCase() },
          {
            email: value.toLowerCase(),
            bounce_type,
            reason,
            template_id,
            status: 'active',
            is_deleted: false,
          },
          { upsert: true, new: true }
        );
      } else if (type === 'mobile') {
        const BouncedMobile = require('../models/mongoose/BouncedMobile');
        await BouncedMobile.findOneAndUpdate(
          { mobile: value.trim() },
          {
            mobile: value.trim(),
            bounce_type,
            reason,
            template_id,
            status: 'active',
            is_deleted: false,
          },
          { upsert: true, new: true }
        );
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Use email or mobile',
        });
      }

      res.json({
        success: true,
        message: `${type} added to bounce list`,
      });
    } catch (error) {
      logger.error('Add bounced user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add bounced user',
      });
    }
  }

  /**
   * Check bounced user
   */
  async checkBouncedUser(req, res) {
    try {
      const { type, value } = req.params;

      let bounced;
      if (type === 'email') {
        bounced = await BouncedEmail.findOne({
          email: value.toLowerCase(),
          status: 'active',
          is_deleted: false,
        });
      } else if (type === 'mobile') {
        bounced = await BouncedMobile.findOne({
          mobile: value.trim(),
          status: 'active',
          is_deleted: false,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Use email or mobile',
        });
      }

      res.json({
        success: true,
        data: {
          is_bounced: !!bounced,
          bounce_info: bounced || null,
        },
      });
    } catch (error) {
      logger.error('Check bounced user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check bounced user',
      });
    }
  }

  /**
   * Get bounced user list
   */
  async getBouncedUserList(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 10, status = 'active' } = req.query;

      let Model;
      if (type === 'email') {
        Model = BouncedEmail;
      } else if (type === 'mobile') {
        Model = BouncedMobile;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Use email or mobile',
        });
      }

      const query = { status, is_deleted: false };
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [data, total] = await Promise.all([
        Model.find(query).sort({ created_at: -1 }).skip(skip).limit(parseInt(limit)),
        Model.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          items: data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      logger.error('Get bounced user list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bounced user list',
      });
    }
  }

  /**
   * Delete bounced user
   */
  async deleteBouncedUser(req, res) {
    try {
      const { type } = req.params;
      const { value } = req.body;

      let Model;
      if (type === 'email') {
        Model = BouncedEmail;
      } else if (type === 'mobile') {
        Model = BouncedMobile;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Use email or mobile',
        });
      }

      await Model.findOneAndUpdate(
        type === 'email' ? { email: value.toLowerCase() } : { mobile: value.trim() },
        { is_deleted: true, status: 'inactive' }
      );

      res.json({
        success: true,
        message: `${type} removed from bounce list`,
      });
    } catch (error) {
      logger.error('Delete bounced user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete bounced user',
      });
    }
  }
}

module.exports = new SharedController();

