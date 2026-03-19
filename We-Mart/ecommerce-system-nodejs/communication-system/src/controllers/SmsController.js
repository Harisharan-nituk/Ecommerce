const SmsService = require('../services/SmsService');
const BouncedMobile = require('../models/mongoose/BouncedMobile');
const logger = require('../utils/logger');

class SmsController {
  /**
   * Send SMS
   */
  async sendSms(req, res) {
    try {
      const params = req.body;
      const userId = req.user?.iam_uuid || null;

      // Add user ID to params for event tracking
      if (userId) {
        params.created_by = userId;
      }

      const result = await SmsService.sendSms(params);

      res.json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          messageId: result.messageId,
          eventId: result.eventId,
        },
      });
    } catch (error) {
      logger.error('Send SMS error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send SMS',
      });
    }
  }

  /**
   * Create or update SMS template
   */
  async upsertTemplate(req, res) {
    try {
      const { code } = req.params;
      const templateData = req.body;
      const userId = req.user?.iam_uuid || null;

      const template = await SmsService.upsertTemplate(code, templateData, userId);

      res.json({
        success: true,
        message: 'SMS template saved successfully',
        data: template,
      });
    } catch (error) {
      logger.error('Upsert SMS template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save SMS template',
      });
    }
  }

  /**
   * Get SMS template
   */
  async getTemplate(req, res) {
    try {
      const { code } = req.params;
      const template = await SmsService.getTemplate(code);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'SMS template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Get SMS template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get SMS template',
      });
    }
  }

  /**
   * Check if mobile is bounced
   */
  async checkBouncedMobile(req, res) {
    try {
      const { mobileNo } = req.params;
      const bounced = await BouncedMobile.findOne({
        mobile: mobileNo.trim(),
        status: 'active',
        is_deleted: false,
      });

      res.json({
        success: true,
        data: {
          is_bounced: !!bounced,
          bounce_info: bounced || null,
        },
      });
    } catch (error) {
      logger.error('Check bounced mobile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check bounced mobile',
      });
    }
  }

  /**
   * Add bounced mobile
   */
  async addBouncedMobile(req, res) {
    try {
      const { mobile, bounce_type = 'hard', reason = null, template_id = null } = req.body;

      await SmsService.addBouncedMobile(mobile, bounce_type, reason, template_id);

      res.json({
        success: true,
        message: 'Mobile added to bounce list',
      });
    } catch (error) {
      logger.error('Add bounced mobile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add bounced mobile',
      });
    }
  }
}

module.exports = new SmsController();

