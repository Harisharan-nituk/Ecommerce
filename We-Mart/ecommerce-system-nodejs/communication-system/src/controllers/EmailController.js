const EmailService = require('../services/EmailService');
const BouncedEmail = require('../models/mongoose/BouncedEmail');
const EmailTemplate = require('../models/mongoose/EmailTemplate');
const logger = require('../utils/logger');

class EmailController {
  /**
   * Send email
   */
  async sendEmail(req, res) {
    try {
      const params = req.body;
      const userId = req.user?.iam_uuid || null;

      // Add user ID to params for event tracking
      if (userId) {
        params.created_by = userId;
      }

      const result = await EmailService.sendEmail(params);

      res.json({
        success: true,
        message: 'Email sent successfully',
        data: {
          messageId: result.messageId,
          eventId: result.eventId,
        },
      });
    } catch (error) {
      logger.error('Send email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send email',
      });
    }
  }

  /**
   * Create or update email template
   */
  async upsertTemplate(req, res) {
    try {
      const { code } = req.params;
      const templateData = req.body;
      const userId = req.user?.iam_uuid || null;

      const template = await EmailService.upsertTemplate(code, templateData, userId);

      res.json({
        success: true,
        message: 'Email template saved successfully',
        data: template,
      });
    } catch (error) {
      logger.error('Upsert email template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save email template',
      });
    }
  }

  /**
   * Get email template
   */
  async getTemplate(req, res) {
    try {
      const { code } = req.params;
      const template = await EmailService.getTemplate(code);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Email template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Get email template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get email template',
      });
    }
  }

  /**
   * Check if email is bounced
   */
  async checkBouncedEmail(req, res) {
    try {
      const { emailId } = req.params;
      const bounced = await BouncedEmail.findOne({
        email: emailId.toLowerCase(),
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
      logger.error('Check bounced email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check bounced email',
      });
    }
  }

  /**
   * Add bounced email
   */
  async addBouncedEmail(req, res) {
    try {
      const { email, bounce_type = 'hard', reason = null, template_id = null } = req.body;

      await EmailService.addBouncedEmail(email, bounce_type, reason, template_id);

      res.json({
        success: true,
        message: 'Email added to bounce list',
      });
    } catch (error) {
      logger.error('Add bounced email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add bounced email',
      });
    }
  }

  /**
   * Unsubscribe email
   */
  async unsubscribeEmail(req, res) {
    try {
      const { email, reason = null, template_id = null } = req.body;

      await EmailService.addBouncedEmail(email, 'unsubscribe', reason, template_id);

      res.json({
        success: true,
        message: 'Email unsubscribed successfully',
      });
    } catch (error) {
      logger.error('Unsubscribe email error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unsubscribe email',
      });
    }
  }
}

module.exports = new EmailController();

