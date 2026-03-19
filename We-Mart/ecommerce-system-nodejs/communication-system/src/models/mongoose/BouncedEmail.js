const mongoose = require('mongoose');

/**
 * Bounced Email Schema
 */
const bouncedEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  bounce_type: {
    type: String,
    enum: ['hard', 'soft', 'unsubscribe'],
    default: 'hard',
  },
  bounce_sub_type: {
    type: String,
    default: null,
  },
  template_id: {
    type: String,
    default: null,
  },
  reason: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'bounced_emails',
});

// Indexes
bouncedEmailSchema.index({ email: 1, status: 1 });
bouncedEmailSchema.index({ status: 1, is_deleted: 1 });

const BouncedEmail = mongoose.model('BouncedEmail', bouncedEmailSchema);

module.exports = BouncedEmail;

