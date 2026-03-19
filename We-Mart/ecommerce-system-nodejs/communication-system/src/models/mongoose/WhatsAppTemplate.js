const mongoose = require('mongoose');

/**
 * WhatsApp Template Schema
 */
const whatsappTemplateSchema = new mongoose.Schema({
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
  message: {
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
  collection: 'whatsapp_templates',
});

// Indexes
whatsappTemplateSchema.index({ code: 1, status: 1 });
whatsappTemplateSchema.index({ category: 1, status: 1 });

const WhatsAppTemplate = mongoose.model('WhatsAppTemplate', whatsappTemplateSchema);

module.exports = WhatsAppTemplate;

