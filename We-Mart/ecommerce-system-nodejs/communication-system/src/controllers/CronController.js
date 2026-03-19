const CommunicationEvent = require('../models/mongoose/CommunicationEvent');
const Otp = require('../models/mongoose/Otp');
const config = require('../config/app');
const logger = require('../utils/logger');
const EmailService = require('../services/EmailService');
const SmsService = require('../services/SmsService');
const WhatsAppService = require('../services/WhatsAppService');

class CronController {
  /**
   * Process communication events
   */
  async processCommunicationEvents(req, res) {
    try {
      const { type, limit = config.communicationEvent.batchSize } = req.query;

      const query = {
        status: 'pending',
      };
      if (type) {
        query.type = type;
      }

      const events = await CommunicationEvent.find(query)
        .sort({ created_at: 1 })
        .limit(parseInt(limit));

      let processed = 0;
      let failed = 0;

      for (const event of events) {
        try {
          // Retry sending based on event type
          if (event.type === 'email') {
            await EmailService.sendEmail({
              ...event.request_json,
              eventId: event._id.toString(),
            });
          } else if (event.type === 'sms') {
            await SmsService.sendSms({
              ...event.request_json,
              eventId: event._id.toString(),
            });
          } else if (event.type === 'whatsapp') {
            await WhatsAppService.sendWhatsApp({
              ...event.request_json,
              eventId: event._id.toString(),
            });
          }

          processed++;
        } catch (error) {
          logger.error(`Failed to process event ${event._id}:`, error);
          await CommunicationEvent.findByIdAndUpdate(event._id, {
            status: 'failed',
            error_message: error.message,
            retry_count: event.retry_count + 1,
          });
          failed++;
        }
      }

      res.json({
        success: true,
        message: 'Communication events processed',
        data: {
          total: events.length,
          processed,
          failed,
        },
      });
    } catch (error) {
      logger.error('Process communication events error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process communication events',
      });
    }
  }

  /**
   * Clean old communication events
   */
  async cleanCommunicationEvents(req, res) {
    try {
      const { days = config.communicationEvent.cleanupDays } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await CommunicationEvent.deleteMany({
        created_at: { $lt: cutoffDate },
        status: { $in: ['done', 'failed'] },
      });

      res.json({
        success: true,
        message: 'Communication events cleaned',
        data: {
          deleted: result.deletedCount,
        },
      });
    } catch (error) {
      logger.error('Clean communication events error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to clean communication events',
      });
    }
  }

  /**
   * Clean expired OTPs
   */
  async cleanOtp(req, res) {
    try {
      const { days = 7 } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await Otp.deleteMany({
        expires_at: { $lt: cutoffDate },
        is_verified: true,
      });

      res.json({
        success: true,
        message: 'Expired OTPs cleaned',
        data: {
          deleted: result.deletedCount,
        },
      });
    } catch (error) {
      logger.error('Clean OTP error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to clean OTPs',
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(req, res) {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new CronController();

