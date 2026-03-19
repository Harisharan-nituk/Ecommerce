const OTP = require('../models/OTP');
const { generateToken } = require('../utils/encryption');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { getClientIP, getIPInfo } = require('../utils/ipUtils');

class OTPController {
  /**
   * Send OTP to mobile number
   * Creates OTP record with mobile, OTP code, auth_token, IP address, etc.
   */
  async sendOTP(req, res) {
    try {
      const { mobile, email, otp_type = '1' } = req.body;

      if (!mobile) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required',
        });
      }

      // Get client IP and location info
      const ipAddress = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipInfo = getIPInfo(ipAddress);

      // Generate OTP (6 digits)
      const smsOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const emailOtp = otp_type === '2' || otp_type === '4' 
        ? Math.floor(100000 + Math.random() * 900000).toString() 
        : null;

      // Generate auth_code and auth_token
      const auth_code = uuidv4();
      const auth_token = generateToken(32);

      // Calculate expiry (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Create OTP record
      const otp = new OTP({
        sms_otp: smsOtp,
        email_otp: emailOtp,
        otp_type,
        auth_code,
        auth_token,
        mobile,
        email: email || '',
        ip_address: ipAddress,
        user_agent: userAgent,
        country: ipInfo.country,
        city: ipInfo.city,
        sent_count: 1,
        attempt_count: 0,
        is_active: true,
        is_verified: false,
        expires_at: expiresAt,
      });

      await otp.save();

      logger.info(`OTP sent to ${mobile} from IP ${ipAddress} - Auth Code: ${auth_code}`);

      // TODO: Send SMS/Email OTP via service
      // await smsService.sendOTP(mobile, smsOtp);
      // if (email) await emailService.sendOTP(email, emailOtp);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          auth_code, // Client uses this to verify OTP
          auth_token, // Client uses this for authenticated requests
          expires_at: expiresAt,
          otp_type,
        },
      });
    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: error.message,
      });
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req, res) {
    try {
      const { auth_code, otp, mobile } = req.body;

      if (!auth_code || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Auth code and OTP are required',
        });
      }

      // Find OTP by auth_code
      const otpRecord = await OTP.findByAuthCode(auth_code);

      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          message: 'Invalid auth code or OTP expired',
        });
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expires_at) {
        otpRecord.is_active = false;
        await otpRecord.save();
        return res.status(400).json({
          success: false,
          message: 'OTP has expired',
        });
      }

      // Check if already verified
      if (otpRecord.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'OTP already verified',
        });
      }

      // Verify OTP
      const isOTPValid = otpRecord.sms_otp === otp || otpRecord.email_otp === otp;

      if (!isOTPValid) {
        // Increment attempt count
        otpRecord.attempt_count += 1;
        await otpRecord.save();

        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
          attempts_remaining: Math.max(0, 3 - otpRecord.attempt_count),
        });
      }

      // Mark as verified
      otpRecord.is_verified = true;
      otpRecord.verified_at = new Date();
      await otpRecord.save();

      logger.info(`OTP verified for mobile ${otpRecord.getDecryptedMobile()} - Auth Code: ${auth_code}`);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          auth_token: otpRecord.auth_token,
          mobile: otpRecord.getDecryptedMobile(),
          email: otpRecord.getDecryptedEmail(),
        },
      });
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
        error: error.message,
      });
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req, res) {
    try {
      const { auth_code } = req.body;

      if (!auth_code) {
        return res.status(400).json({
          success: false,
          message: 'Auth code is required',
        });
      }

      // Find existing OTP
      const existingOTP = await OTP.findByAuthCode(auth_code);

      if (!existingOTP) {
        return res.status(404).json({
          success: false,
          message: 'Invalid auth code',
        });
      }

      // Check sent count (max 3)
      if (existingOTP.sent_count >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum resend attempts reached',
        });
      }

      // Generate new OTP
      const smsOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const emailOtp = existingOTP.otp_type === '2' || existingOTP.otp_type === '4'
        ? Math.floor(100000 + Math.random() * 900000).toString()
        : null;

      // Update OTP record
      existingOTP.sms_otp = smsOtp;
      if (emailOtp) existingOTP.email_otp = emailOtp;
      existingOTP.sent_count += 1;
      existingOTP.expires_at = new Date(Date.now() + 10 * 60 * 1000);
      await existingOTP.save();

      // TODO: Send SMS/Email OTP
      // await smsService.sendOTP(existingOTP.getDecryptedMobile(), smsOtp);

      res.json({
        success: true,
        message: 'OTP resent successfully',
        data: {
          auth_code: existingOTP.auth_code,
          expires_at: existingOTP.expires_at,
        },
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        error: error.message,
      });
    }
  }

  /**
   * Get OTP by auth_token
   */
  async getOTPByToken(req, res) {
    try {
      const { auth_token } = req.params;

      const otp = await OTP.findByAuthToken(auth_token);

      if (!otp) {
        return res.status(404).json({
          success: false,
          message: 'OTP not found',
        });
      }

      res.json({
        success: true,
        data: {
          mobile: otp.getDecryptedMobile(),
          email: otp.getDecryptedEmail(),
          is_verified: otp.is_verified,
          expires_at: otp.expires_at,
          created_at: otp.created_at,
        },
      });
    } catch (error) {
      logger.error('Get OTP by token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get OTP',
        error: error.message,
      });
    }
  }
}

module.exports = new OTPController();

