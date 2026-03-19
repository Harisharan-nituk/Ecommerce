const User = require('../models/User');
const OTP = require('../models/OTP');
const { verifyPassword, hashPassword } = require('../utils/encryption');
const { generateToken } = require('../utils/encryption');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { getClientIP, getIPInfo } = require('../utils/ipUtils');
const jwt = require('jsonwebtoken');
const config = require('../config/app');

class AuthController {
  /**
   * Login with Email/Username and Password
   */
  async loginWithPassword(req, res) {
    try {
      const { email, username, password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required',
        });
      }

      if (!email && !username) {
        return res.status(400).json({
          success: false,
          message: 'Email or username is required',
        });
      }

      // Find user by email or username
      let user = null;
      if (email) {
        // Check if it's an email or username
        const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
        if (isEmail) {
          user = await User.findByEmail(email);
        } else {
          // Treat as username
          user = await User.findOne({ user_name: email }).select('+password');
        }
      } else if (username) {
        user = await User.findOne({ user_name: username }).select('+password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password',
        });
      }

      // Check account status
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active',
        });
      }

      // Check account lockout
      if (user.failed_login_attempts >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Account locked due to too many failed login attempts',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        // Increment failed attempts
        user.failed_login_attempts += 1;
        await user.save();

        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password',
          attempts_remaining: Math.max(0, 5 - user.failed_login_attempts),
        });
      }

      // Reset failed attempts on successful login
      user.failed_login_attempts = 0;
      user.is_login = true;
      user.last_login_time = new Date();
      await user.save();

      // Get role name if role_id exists
      let roleName = null;
      if (user.role_id) {
        const Role = require('../models/Role');
        const role = await Role.findById(user.role_id);
        roleName = role?.name || null;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          iam_uuid: user.iam_uuid,
          role_id: user.role_id?.toString(),
        },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      logger.info(`User logged in: ${user.iam_uuid} (${user.getDecryptedEmail()})`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            iam_uuid: user.iam_uuid,
            email: user.getDecryptedEmail(),
            mobile_number: user.getDecryptedMobile(),
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            role_id: user.role_id?.toString(),
            role_name: roleName,
          },
          token,
          roles: roleName ? [roleName] : [],
          permissions: [], // Permissions fetched separately if needed
        },
      });
    } catch (error) {
      logger.error('Login with password error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  /**
   * Login with Mobile and OTP
   */
  async loginWithOTP(req, res) {
    try {
      const { mobile, otp, auth_code } = req.body;

      if (!mobile || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number and OTP are required',
        });
      }

      // Find OTP record
      let otpRecord = null;
      if (auth_code) {
        otpRecord = await OTP.findByAuthCode(auth_code);
      } else {
        // Find by mobile
        otpRecord = await OTP.findActiveByMobile(mobile);
      }

      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          message: 'OTP not found or expired. Please request a new OTP.',
        });
      }

      // Verify mobile matches
      if (otpRecord.getDecryptedMobile() !== mobile) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number mismatch',
        });
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expires_at) {
        otpRecord.is_active = false;
        await otpRecord.save();
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new OTP.',
        });
      }

      // Check if already verified
      if (otpRecord.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'OTP already used. Please request a new OTP.',
        });
      }

      // Verify OTP
      const isOTPValid = otpRecord.sms_otp === otp || otpRecord.email_otp === otp;

      if (!isOTPValid) {
        // Increment attempt count
        otpRecord.attempt_count += 1;
        await otpRecord.save();

        if (otpRecord.attempt_count >= 3) {
          otpRecord.is_active = false;
          await otpRecord.save();
          return res.status(400).json({
            success: false,
            message: 'Maximum OTP verification attempts reached. Please request a new OTP.',
          });
        }

        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
          attempts_remaining: Math.max(0, 3 - otpRecord.attempt_count),
        });
      }

      // Mark OTP as verified
      otpRecord.is_verified = true;
      otpRecord.verified_at = new Date();
      await otpRecord.save();

      // Find or create user by mobile
      let user = await User.findByMobile(mobile);

      if (!user) {
        // Create new user if doesn't exist
        const hashedPassword = await hashPassword(generateToken(16)); // Random password
        user = await User.createUser({
          email: otpRecord.getDecryptedEmail() || `${mobile}@mobile.user`,
          password: hashedPassword,
          mobile_number: mobile,
          first_name: 'User',
          last_name: 'Mobile',
          user_name: `user_${mobile}`,
          status: 'active',
          is_phone_verified: true,
        });
        logger.info(`Created new user via OTP login: ${user.iam_uuid}`);
      }

      // Check account status
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active',
        });
      }

      // Update login status
      user.is_login = true;
      user.last_login_time = new Date();
      user.is_phone_verified = true;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          iam_uuid: user.iam_uuid,
          role_id: user.role_id?.toString(),
        },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      logger.info(`User logged in via OTP: ${user.iam_uuid} (${mobile})`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            iam_uuid: user.iam_uuid,
            email: user.getDecryptedEmail(),
            mobile_number: user.getDecryptedMobile(),
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            role_id: user.role_id,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Login with OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  /**
   * Logout
   */
  async logout(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.is_login = false;
          await user.save();
        }
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const user = await User.findById(userId).populate('role_id');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: user._id.toString(),
          iam_uuid: user.iam_uuid,
          email: user.getDecryptedEmail(),
          mobile_number: user.getDecryptedMobile(),
          first_name: user.first_name,
          last_name: user.last_name,
          user_name: user.user_name,
          role_id: user.role_id,
          role_name: user.role_id?.name,
          status: user.status,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
      });
    }
  }
}

module.exports = new AuthController();

