const mongoose = require('mongoose');

/**
 * Communication Event Schema
 * Tracks all communication attempts (Email, SMS, WhatsApp)
 */
const communicationEventSchema = new mongoose.Schema({
  template_code: {
    type: String,
    required: true,
    index: true,
  },
  template_name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'failed', 'default'],
    default: 'pending',
    index: true,
  },
  recipient: {
    type: String,
    required: true,
    index: true,
  },
  request_json: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  response_json: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  error_message: {
    type: String,
    default: null,
  },
  retry_count: {
    type: Number,
    default: 0,
  },
  processed_at: {
    type: Date,
    default: null,
  },
  created_by: {
    type: String, // iam_uuid
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'communication_events',
});

// Indexes
communicationEventSchema.index({ type: 1, status: 1, created_at: -1 });
communicationEventSchema.index({ recipient: 1, type: 1 });
communicationEventSchema.index({ template_code: 1, status: 1 });
communicationEventSchema.index({ created_at: 1 }); // For cleanup

const CommunicationEvent = mongoose.model('CommunicationEvent', communicationEventSchema);

module.exports = CommunicationEvent;

