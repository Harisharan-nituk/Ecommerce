const crypto = require('crypto');
const config = require('../config/app');
const logger = require('../utils/logger');
const Otp = require('../models/mongoose/Otp');
const { getClientIP, getIPInfo } = require('../utils/ipUtils');
// Lazy load services to avoid circular dependencies
const getEmailService = () => require('./EmailService');
const getSmsService = () => require('./SmsService');

class OtpService {
  /**
   * Generate random OTP code
   */
  generateOtpCode() {
    const length = config.otp.length;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Generate auth token
   */
  generateAuthToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send OTP
   */
  async sendOtp(params, req = null) {
    const {
      mobile,
      email,
      otp_type = 'sms',
    } = params;

    if (!mobile && !email) {
      throw new Error('Mobile number or email is required');
    }

    try {
      // Get IP information
      const ipAddress = req ? getClientIP(req) : '0.0.0.0';
      const userAgent = req?.headers['user-agent'] || 'Unknown';
      const ipInfo = getIPInfo(ipAddress);

      // Generate OTP
      const otpCode = this.generateOtpCode();
      const expiresAt = new Date(Date.now() + config.otp.expiry);

      // Check for existing active OTP
      const existingOtp = await Otp.findOne({
        $or: [{ mobile }, { email }],
        is_active: true,
        is_verified: false,
        expires_at: { $gt: new Date() },
      });

      let sentCount = 1;
      let otpRecord;

      if (existingOtp) {
        // Update existing OTP
        sentCount = existingOtp.sent_count + 1;
        if (sentCount > config.otp.maxResend) {
          throw new Error('Maximum OTP resend attempts reached. Please try again later.');
        }

        existingOtp.otp_code = otpCode;
        existingOtp.sent_count = sentCount;
        existingOtp.expires_at = expiresAt;
        existingOtp.ip_address = ipAddress;
        existingOtp.user_agent = userAgent;
        existingOtp.country = ipInfo.country;
        existingOtp.city = ipInfo.city;
        await existingOtp.save();
        otpRecord = existingOtp;
      } else {
        // Create new OTP
        otpRecord = await Otp.create({
          mobile: mobile || null,
          email: email || null,
          otp_code: otpCode,
          otp_type,
          ip_address: ipAddress,
          user_agent: userAgent,
          country: ipInfo.country,
          city: ipInfo.city,
          expires_at: expiresAt,
        });
      }

      // Send OTP via SMS or Email
      if (otp_type === 'sms' && mobile) {
        const SmsService = getSmsService();
        await SmsService.sendSms({
          to: mobile,
          message: `Your OTP is ${otpCode}. Valid for ${config.otp.expiry / 60000} minutes.`,
        });
      } else if (otp_type === 'email' && email) {
        const EmailService = getEmailService();
        await EmailService.sendEmail({
          to: email,
          subject: 'Your OTP Code',
          body: `<p>Your OTP is <strong>${otpCode}</strong>. Valid for ${config.otp.expiry / 60000} minutes.</p>`,
        });
      }

      logger.info(`OTP sent to ${mobile || email} from IP ${ipAddress}`);

      return {
        success: true,
        auth_code: otpRecord.auth_code,
        expires_at: expiresAt,
        sent_count: sentCount,
      };
    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(params) {
    const {
      auth_code,
      otp,
      mobile,
      email,
    } = params;

    if (!auth_code || !otp) {
      throw new Error('Auth code and OTP are required');
    }

    try {
      // Find OTP record
      const query = {
        auth_code,
        is_active: true,
        is_verified: false,
        expires_at: { $gt: new Date() },
      };

      if (mobile) query.mobile = mobile;
      if (email) query.email = email;

      const otpRecord = await Otp.findOne(query);

      if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      // Increment attempt count
      otpRecord.attempt_count += 1;

      // Check if OTP matches
      if (otpRecord.otp_code !== otp) {
        if (otpRecord.attempt_count >= config.otp.maxAttempts) {
          otpRecord.is_active = false;
          await otpRecord.save();
          throw new Error('Maximum OTP verification attempts reached');
        }
        await otpRecord.save();
        throw new Error('Invalid OTP');
      }

      // OTP is valid - mark as verified
      const authToken = this.generateAuthToken();
      otpRecord.is_verified = true;
      otpRecord.is_active = false;
      otpRecord.auth_token = authToken;
      otpRecord.verified_at = new Date();
      await otpRecord.save();

      logger.info(`OTP verified successfully for ${mobile || email}`);

      return {
        success: true,
        auth_token: authToken,
        verified_at: otpRecord.verified_at,
      };
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(authCode, req = null) {
    try {
      const otpRecord = await Otp.findOne({
        auth_code: authCode,
        is_active: true,
        is_verified: false,
      });

      if (!otpRecord) {
        throw new Error('Active OTP request not found');
      }

      if (otpRecord.sent_count >= config.otp.maxResend) {
        otpRecord.is_active = false;
        await otpRecord.save();
        throw new Error('Maximum OTP resend attempts reached');
      }

      // Regenerate OTP and update
      const newOtpCode = this.generateOtpCode();
      const newExpiresAt = new Date(Date.now() + config.otp.expiry);
      const ipAddress = req ? getClientIP(req) : otpRecord.ip_address;
      const ipInfo = getIPInfo(ipAddress);

      otpRecord.otp_code = newOtpCode;
      otpRecord.sent_count += 1;
      otpRecord.expires_at = newExpiresAt;
      otpRecord.ip_address = ipAddress;
      otpRecord.country = ipInfo.country;
      otpRecord.city = ipInfo.city;
      await otpRecord.save();

      // Resend OTP
      if (otpRecord.otp_type === 'sms' && otpRecord.mobile) {
        const SmsService = getSmsService();
        await SmsService.sendSms({
          to: otpRecord.mobile,
          message: `Your OTP is ${newOtpCode}. Valid for ${config.otp.expiry / 60000} minutes.`,
        });
      } else if (otpRecord.otp_type === 'email' && otpRecord.email) {
        const EmailService = getEmailService();
        await EmailService.sendEmail({
          to: otpRecord.email,
          subject: 'Your OTP Code',
          body: `<p>Your OTP is <strong>${newOtpCode}</strong>. Valid for ${config.otp.expiry / 60000} minutes.</p>`,
        });
      }

      logger.info(`OTP resent to ${otpRecord.mobile || otpRecord.email}`);

      return {
        success: true,
        auth_code: otpRecord.auth_code,
        expires_at: newExpiresAt,
        sent_count: otpRecord.sent_count,
      };
    } catch (error) {
      logger.error('Error resending OTP:', error);
      throw error;
    }
  }
}

module.exports = new OtpService();

