const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * OTP Schema
 * Stores OTP requests and verifications
 */
const otpSchema = new mongoose.Schema({
  auth_code: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true,
    index: true,
  },
  auth_token: {
    type: String,
    default: null,
    index: true,
  },
  mobile: {
    type: String,
    required: false,
    index: true,
  },
  email: {
    type: String,
    required: false,
    index: true,
    lowercase: true,
  },
  otp_code: {
    type: String,
    required: true,
  },
  otp_type: {
    type: String,
    enum: ['sms', 'email', 'both'],
    default: 'sms',
  },
  ip_address: {
    type: String,
    required: true,
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
  sent_count: {
    type: Number,
    default: 1,
  },
  attempt_count: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
  verified_at: {
    type: Date,
    default: null,
  },
  created_by: {
    type: String, // iam_uuid
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'otps',
});

// Indexes
otpSchema.index({ mobile: 1, is_active: 1, is_verified: 1 });
otpSchema.index({ email: 1, is_active: 1, is_verified: 1 });
otpSchema.index({ auth_code: 1, is_active: 1 });
otpSchema.index({ expires_at: 1 }); // For cleanup

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;

