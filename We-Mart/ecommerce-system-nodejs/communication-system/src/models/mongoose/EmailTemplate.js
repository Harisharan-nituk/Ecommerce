const mongoose = require('mongoose');

/**
 * Email Template Schema
 */
const emailTemplateSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  variables: [{
    type: String,
  }],
  category: {
    type: String,
    default: 'general',
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  created_by: {
    type: String, // iam_uuid
    default: null,
  },
  updated_by: {
    type: String, // iam_uuid
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'email_templates',
});

// Indexes
emailTemplateSchema.index({ code: 1, status: 1 });
emailTemplateSchema.index({ category: 1, status: 1 });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;

