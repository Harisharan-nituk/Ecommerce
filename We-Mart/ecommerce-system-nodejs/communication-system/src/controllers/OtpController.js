const OtpService = require('../services/OtpService');
const Otp = require('../models/mongoose/Otp');
const logger = require('../utils/logger');

class OtpController {
  /**
   * Send OTP
   */
  async sendOtp(req, res) {
    try {
      const params = req.body;
      const userId = req.user?.iam_uuid || null;

      if (userId) {
        params.created_by = userId;
      }

      const result = await OtpService.sendOtp(params, req);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          auth_code: result.auth_code,
          expires_at: result.expires_at,
          sent_count: result.sent_count,
        },
      });
    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP',
      });
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(req, res) {
    try {
      const params = req.body;
      const result = await OtpService.verifyOtp(params);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          auth_token: result.auth_token,
          verified_at: result.verified_at,
        },
      });
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify OTP',
      });
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(req, res) {
    try {
      const { auth_code } = req.body;
      const result = await OtpService.resendOtp(auth_code, req);

      res.json({
        success: true,
        message: 'OTP resent successfully',
        data: {
          auth_code: result.auth_code,
          expires_at: result.expires_at,
          sent_count: result.sent_count,
        },
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend OTP',
      });
    }
  }

  /**
   * Get OTP by auth token
   */
  async getOtpByToken(req, res) {
    try {
      const { auth_token } = req.params;
      const otp = await Otp.findOne({
        auth_token,
        is_verified: true,
      }).select('-otp_code'); // Don't return OTP code

      if (!otp) {
        return res.status(404).json({
          success: false,
          message: 'OTP token not found',
        });
      }

      res.json({
        success: true,
        data: otp,
      });
    } catch (error) {
      logger.error('Get OTP by token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get OTP',
      });
    }
  }
}

module.exports = new OtpController();

