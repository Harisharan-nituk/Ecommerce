const config = require('../config/app');
const logger = require('../utils/logger');
const SmsTemplate = require('../models/mongoose/SmsTemplate');
const BouncedMobile = require('../models/mongoose/BouncedMobile');
const CommunicationEvent = require('../models/mongoose/CommunicationEvent');

// Twilio client (optional - can be replaced with custom provider)
let twilioClient = null;
if (config.sms.enabled && config.sms.provider === 'twilio' && config.sms.twilio.accountSid) {
  const twilio = require('twilio');
  twilioClient = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
}

class SmsService {
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
   * Check if mobile is bounced/blacklisted
   */
  async isBouncedMobile(mobile) {
    const bounced = await BouncedMobile.findOne({
      mobile: mobile.trim(),
      status: 'active',
      is_deleted: false,
    });
    return !!bounced;
  }

  /**
   * Add mobile to bounce list
   */
  async addBouncedMobile(mobile, bounceType = 'hard', reason = null, templateId = null) {
    try {
      await BouncedMobile.findOneAndUpdate(
        { mobile: mobile.trim() },
        {
          mobile: mobile.trim(),
          bounce_type: bounceType,
          reason,
          template_id: templateId,
          status: 'active',
          is_deleted: false,
        },
        { upsert: true, new: true }
      );
      logger.info(`Mobile added to bounce list: ${mobile}`);
    } catch (error) {
      logger.error('Error adding bounced mobile:', error);
    }
  }

  /**
   * Send SMS using Twilio
   */
  async sendSmsTwilio(mobile, message) {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: config.sms.twilio.fromNumber,
        to: mobile,
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      logger.error('Twilio SMS error:', error);
      throw error;
    }
  }

  /**
   * Send SMS using custom provider (placeholder for custom implementation)
   */
  async sendSmsCustom(mobile, message) {
    // TODO: Implement custom SMS provider
    logger.warn('Custom SMS provider not implemented');
    throw new Error('Custom SMS provider not implemented');
  }

  /**
   * Send SMS
   */
  async sendSms(params) {
    const {
      to,
      template_code,
      variables = {},
      message,
    } = params;

    try {
      // Check if mobile is bounced
      const isBounced = await this.isBouncedMobile(to);
      if (isBounced) {
        throw new Error(`Mobile ${to} is blacklisted/bounced`);
      }

      let finalMessage = message;

      // Get template if template_code provided
      if (template_code) {
        const template = await SmsTemplate.findOne({
          code: template_code,
          status: 'active',
        });

        if (!template) {
          throw new Error(`SMS template not found: ${template_code}`);
        }

        finalMessage = this.replaceVariables(template.message, variables);
      }

      // Create communication event
      const event = await CommunicationEvent.create({
        template_code: template_code || 'direct',
        template_name: template_code || 'Direct SMS',
        type: 'sms',
        status: 'pending',
        recipient: to,
        request_json: params,
      });

      // Send SMS based on provider
      let result;
      if (config.sms.provider === 'twilio') {
        result = await this.sendSmsTwilio(to, finalMessage);
      } else {
        result = await this.sendSmsCustom(to, finalMessage);
      }

      // Update event as done
      await CommunicationEvent.findByIdAndUpdate(event._id, {
        status: 'done',
        response_json: result,
        processed_at: new Date(),
      });

      logger.info(`SMS sent successfully to ${to}: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        eventId: event._id.toString(),
      };
    } catch (error) {
      logger.error('Error sending SMS:', error);

      // Update event as failed
      if (params.eventId) {
        await CommunicationEvent.findByIdAndUpdate(params.eventId, {
          status: 'failed',
          error_message: error.message,
        });
      }

      // Add to bounce list if it's a bounce error
      if (error.message.includes('bounce') || error.message.includes('blacklist')) {
        await this.addBouncedMobile(to, 'hard', error.message);
      }

      throw error;
    }
  }

  /**
   * Get SMS template
   */
  async getTemplate(code) {
    return await SmsTemplate.findOne({ code, status: 'active' });
  }

  /**
   * Create or update SMS template
   */
  async upsertTemplate(code, templateData, userId = null) {
    const {
      name,
      message,
      variables = [],
      category = 'general',
      status = 'active',
    } = templateData;

    return await SmsTemplate.findOneAndUpdate(
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

module.exports = new SmsService();

