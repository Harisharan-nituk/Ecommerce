const WhatsAppService = require('../services/WhatsAppService');
const logger = require('../utils/logger');

class WhatsAppController {
  /**
   * Send WhatsApp
   */
  async sendWhatsApp(req, res) {
    try {
      const params = req.body;
      const userId = req.user?.iam_uuid || null;

      // Add user ID to params for event tracking
      if (userId) {
        params.created_by = userId;
      }

      const result = await WhatsAppService.sendWhatsApp(params);

      res.json({
        success: true,
        message: 'WhatsApp sent successfully',
        data: {
          messageId: result.messageId,
          eventId: result.eventId,
        },
      });
    } catch (error) {
      logger.error('Send WhatsApp error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send WhatsApp',
      });
    }
  }

  /**
   * Send HSM (Highly Structured Message)
   */
  async sendHSM(req, res) {
    try {
      const params = req.body;
      const userId = req.user?.iam_uuid || null;

      if (userId) {
        params.created_by = userId;
      }

      const result = await WhatsAppService.sendHSM(params);

      res.json({
        success: true,
        message: 'HSM sent successfully',
        data: {
          messageId: result.messageId,
          eventId: result.eventId,
        },
      });
    } catch (error) {
      logger.error('Send HSM error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send HSM',
      });
    }
  }

  /**
   * Create or update WhatsApp template
   */
  async upsertTemplate(req, res) {
    try {
      const { id } = req.params;
      const templateData = req.body;
      const userId = req.user?.iam_uuid || null;

      const template = await WhatsAppService.upsertTemplate(id, templateData, userId);

      res.json({
        success: true,
        message: 'WhatsApp template saved successfully',
        data: template,
      });
    } catch (error) {
      logger.error('Upsert WhatsApp template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save WhatsApp template',
      });
    }
  }

  /**
   * Get WhatsApp template
   */
  async getTemplate(req, res) {
    try {
      const { code } = req.params;
      const template = await WhatsAppService.getTemplate(code);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'WhatsApp template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Get WhatsApp template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get WhatsApp template',
      });
    }
  }
}

module.exports = new WhatsAppController();

