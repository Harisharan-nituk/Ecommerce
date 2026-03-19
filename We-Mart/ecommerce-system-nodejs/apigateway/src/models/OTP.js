const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * OTP Schema for API Gateway
 * Following ITMS pattern: Stores OTP, auth_token, mobile_number, IP, and other details
 */
const otpSchema = new mongoose.Schema({
  // OTP details
  sms_otp: {
    type: String,
    default: null,
  },
  email_otp: {
    type: String,
    default: null,
  },
  otp_type: {
    type: String,
    enum: ['1', '2', '3', '4'], // 1=SMS, 2=Email, 3=SMS or Email, 4=SMS and Email
    default: '1',
  },
  
  // Authentication
  auth_code: {
    type: String,
    required: true,
    index: true,
  },
  auth_token: {
    type: String,
    default: null,
    index: true,
  },
  
  // Contact information (encrypted)
  mobile: {
    type: String,
    required: true,
    index: true,
    set: encrypt, // Encrypt mobile before saving
    get: decrypt, // Decrypt mobile when retrieving
  },
  email: {
    type: String,
    default: '',
    set: encrypt, // Encrypt email before saving
    get: decrypt, // Decrypt email when retrieving
  },
  
  // IP and location tracking
  ip_address: {
    type: String,
    required: true,
    index: true,
  },
  user_agent: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  
  // Counters
  sent_count: {
    type: Number,
    default: 1,
  },
  attempt_count: {
    type: Number,
    default: 0,
  },
  
  // Status
  is_active: {
    type: Boolean,
    default: true,
    index: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // Access control
  access_auth_key: {
    type: String,
    default: '',
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  verified_at: {
    type: Date,
    default: null,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  collection: 'gateway_otp',
  timestamps: false, // We manage timestamps manually
  toJSON: { getters: true, setters: true },
  toObject: { getters: true, setters: true },
});

// Indexes for performance
otpSchema.index({ mobile: 1 });
otpSchema.index({ email: 1 });
otpSchema.index({ auth_code: 1 });
otpSchema.index({ auth_token: 1 });
otpSchema.index({ ip_address: 1 });
otpSchema.index({ is_active: 1 });
otpSchema.index({ is_verified: 1 });
otpSchema.index({ created_at: -1 });
otpSchema.index({ expires_at: 1 });

// Compound indexes
otpSchema.index({ mobile: 1, is_active: 1 });
otpSchema.index({ auth_code: 1, is_verified: 1 });

// Instance methods
otpSchema.methods.getDecryptedMobile = function() {
  return decrypt(this.mobile);
};

otpSchema.methods.getDecryptedEmail = function() {
  return this.email ? decrypt(this.email) : null;
};

// Static method to find active OTP by mobile
otpSchema.statics.findActiveByMobile = async function(mobile) {
  const otps = await this.find({ is_active: true }).sort({ created_at: -1 });
  for (const otp of otps) {
    if (decrypt(otp.mobile) === mobile) {
      return otp;
    }
  }
  return null;
};

// Static method to find OTP by auth_code
otpSchema.statics.findByAuthCode = async function(authCode) {
  return await this.findOne({ auth_code: authCode, is_active: true });
};

// Static method to find OTP by auth_token
otpSchema.statics.findByAuthToken = async function(authToken) {
  return await this.findOne({ auth_token: authToken, is_active: true });
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;

