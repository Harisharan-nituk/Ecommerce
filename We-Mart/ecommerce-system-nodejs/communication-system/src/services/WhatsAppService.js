const config = require('../config/app');
const logger = require('../utils/logger');
const WhatsAppTemplate = require('../models/mongoose/WhatsAppTemplate');
const CommunicationEvent = require('../models/mongoose/CommunicationEvent');

// Twilio client for WhatsApp (optional)
let twilioClient = null;
if (config.whatsapp.enabled && config.whatsapp.provider === 'twilio' && config.whatsapp.twilio.accountSid) {
  const twilio = require('twilio');
  twilioClient = twilio(config.whatsapp.twilio.accountSid, config.whatsapp.twilio.authToken);
}

class WhatsAppService {
  /**
   * Replace template variables
   */
  replaceVariables(template, variables = {}) {
    let content = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key] || '');
    });
    return content;
  }

  /**
   * Send WhatsApp using Twilio
   */
  async sendWhatsAppTwilio(to, message) {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${config.whatsapp.twilio.fromNumber}`,
        to: `whatsapp:${to}`,
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      logger.error('Twilio WhatsApp error:', error);
      throw error;
    }
  }

  /**
   * Send HSM (Highly Structured Message) via Twilio
   */
  async sendHSMTwilio(to, templateSid, variables = {}) {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      // Build content variables for HSM
      const contentVariables = JSON.stringify(
        Object.keys(variables).map(key => ({
          type: 'text',
          text: variables[key],
        }))
      );

      const result = await twilioClient.messages.create({
        from: `whatsapp:${config.whatsapp.twilio.fromNumber}`,
        to: `whatsapp:${to}`,
        contentSid: templateSid,
        contentVariables,
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      logger.error('Twilio HSM error:', error);
      throw error;
    }
  }

  /**
   * Send WhatsApp
   */
  async sendWhatsApp(params) {
    const {
      to,
      template_code,
      variables = {},
      message,
    } = params;

    try {
      let finalMessage = message;

      // Get template if template_code provided
      if (template_code) {
        const template = await WhatsAppTemplate.findOne({
          code: template_code,
          status: 'active',
        });

        if (!template) {
          throw new Error(`WhatsApp template not found: ${template_code}`);
        }

        finalMessage = this.replaceVariables(template.message, variables);
      }

      // Create communication event
      const event = await CommunicationEvent.create({
        template_code: template_code || 'direct',
        template_name: template_code || 'Direct WhatsApp',
        type: 'whatsapp',
        status: 'pending',
        recipient: to,
        request_json: params,
      });

      // Send WhatsApp based on provider
      let result;
      if (config.whatsapp.provider === 'twilio') {
        result = await this.sendWhatsAppTwilio(to, finalMessage);
      } else {
        throw new Error('WhatsApp provider not configured');
      }

      // Update event as done
      await CommunicationEvent.findByIdAndUpdate(event._id, {
        status: 'done',
        response_json: result,
        processed_at: new Date(),
      });

      logger.info(`WhatsApp sent successfully to ${to}: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        eventId: event._id.toString(),
      };
    } catch (error) {
      logger.error('Error sending WhatsApp:', error);

      // Update event as failed
      if (params.eventId) {
        await CommunicationEvent.findByIdAndUpdate(params.eventId, {
          status: 'failed',
          error_message: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Send HSM (Highly Structured Message)
   */
  async sendHSM(params) {
    const {
      to,
      template_sid,
      variables = {},
    } = params;

    try {
      // Create communication event
      const event = await CommunicationEvent.create({
        template_code: template_sid || 'hsm',
        template_name: template_sid || 'HSM Message',
        type: 'whatsapp',
        status: 'pending',
        recipient: to,
        request_json: params,
      });

      // Send HSM via Twilio
      const result = await this.sendHSMTwilio(to, template_sid, variables);

      // Update event as done
      await CommunicationEvent.findByIdAndUpdate(event._id, {
        status: 'done',
        response_json: result,
        processed_at: new Date(),
      });

      logger.info(`HSM sent successfully to ${to}: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        eventId: event._id.toString(),
      };
    } catch (error) {
      logger.error('Error sending HSM:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp template
   */
  async getTemplate(code) {
    return await WhatsAppTemplate.findOne({ code, status: 'active' });
  }

  /**
   * Create or update WhatsApp template
   */
  async upsertTemplate(code, templateData, userId = null) {
    const {
      name,
      message,
      variables = [],
      category = 'general',
      status = 'active',
    } = templateData;

    return await WhatsAppTemplate.findOneAndUpdate(
      { code },
      {
        code,
        name,
        message,
        variables,
        category,
        status,
        updated_by: userId,
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new WhatsAppService();

