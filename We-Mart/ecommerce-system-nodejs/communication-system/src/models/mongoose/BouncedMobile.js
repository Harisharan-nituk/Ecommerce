const mongoose = require('mongoose');

/**
 * Bounced Mobile Schema
 */
const bouncedMobileSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  bounce_type: {
    type: String,
    enum: ['hard', 'soft', 'invalid'],
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
  collection: 'bounced_mobiles',
});

// Indexes
bouncedMobileSchema.index({ mobile: 1, status: 1 });
bouncedMobileSchema.index({ status: 1, is_deleted: 1 });

const BouncedMobile = mongoose.model('BouncedMobile', bouncedMobileSchema);

module.exports = BouncedMobile;

