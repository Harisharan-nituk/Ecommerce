const nodemailer = require('nodemailer');
const config = require('../config/app');
const logger = require('../utils/logger');
const EmailTemplate = require('../models/mongoose/EmailTemplate');
const BouncedEmail = require('../models/mongoose/BouncedEmail');
const CommunicationEvent = require('../models/mongoose/CommunicationEvent');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    if (!config.email.enabled) {
      logger.warn('Email service is disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: config.email.smtp.auth.user ? {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass,
        } : undefined,
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

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
   * Check if email is bounced/blacklisted
   */
  async isBouncedEmail(email) {
    const bounced = await BouncedEmail.findOne({
      email: email.toLowerCase(),
      status: 'active',
      is_deleted: false,
    });
    return !!bounced;
  }

  /**
   * Add email to bounce list
   */
  async addBouncedEmail(email, bounceType = 'hard', reason = null, templateId = null) {
    try {
      await BouncedEmail.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          email: email.toLowerCase(),
          bounce_type: bounceType,
          reason,
          template_id: templateId,
          status: 'active',
          is_deleted: false,
        },
        { upsert: true, new: true }
      );
      logger.info(`Email added to bounce list: ${email}`);
    } catch (error) {
      logger.error('Error adding bounced email:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(params) {
    const {
      to,
      template_code,
      variables = {},
      subject,
      body,
      cc = [],
      bcc = [],
      from = config.email.from,
    } = params;

    try {
      // Check if email is bounced
      const isBounced = await this.isBouncedEmail(to);
      if (isBounced) {
        throw new Error(`Email ${to} is blacklisted/bounced`);
      }

      let finalSubject = subject;
      let finalBody = body;

      // Get template if template_code provided
      if (template_code) {
        const template = await EmailTemplate.findOne({
          code: template_code,
          status: 'active',
        });

        if (!template) {
          throw new Error(`Email template not found: ${template_code}`);
        }

        finalSubject = this.replaceVariables(template.subject, variables);
        finalBody = this.replaceVariables(template.body, variables);
      }

      // Create communication event
      const event = await CommunicationEvent.create({
        template_code: template_code || 'direct',
        template_name: template_code || 'Direct Email',
        type: 'email',
        status: 'pending',
        recipient: to,
        request_json: params,
      });

      // Send email
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from,
        to,
        cc: cc.length > 0 ? cc : undefined,
        bcc: bcc.length > 0 ? bcc : undefined,
        subject: finalSubject,
        html: finalBody,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Update event as done
      await CommunicationEvent.findByIdAndUpdate(event._id, {
        status: 'done',
        response_json: { messageId: info.messageId, response: info.response },
        processed_at: new Date(),
      });

      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        eventId: event._id.toString(),
      };
    } catch (error) {
      logger.error('Error sending email:', error);

      // Update event as failed
      if (params.eventId) {
        await CommunicationEvent.findByIdAndUpdate(params.eventId, {
          status: 'failed',
          error_message: error.message,
        });
      }

      // Add to bounce list if it's a bounce error
      if (error.message.includes('bounce') || error.message.includes('blacklist')) {
        await this.addBouncedEmail(to, 'hard', error.message);
      }

      throw error;
    }
  }

  /**
   * Get email template
   */
  async getTemplate(code) {
    return await EmailTemplate.findOne({ code, status: 'active' });
  }

  /**
   * Create or update email template
   */
  async upsertTemplate(code, templateData, userId = null) {
    const {
      name,
      subject,
      body,
      variables = [],
      category = 'general',
      status = 'active',
    } = templateData;

    return await EmailTemplate.findOneAndUpdate(
      { code },
      {
        code,
        name,
        subject,
        body,
        variables,
        category,
        status,
        updated_by: userId,
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new EmailService();

