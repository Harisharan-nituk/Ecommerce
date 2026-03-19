const mongoose = require('mongoose');

/**
 * Communication Category Schema
 */
const communicationCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'communication_categories',
});

// Indexes
communicationCategorySchema.index({ name: 1, status: 1 });

const CommunicationCategory = mongoose.model('CommunicationCategory', communicationCategorySchema);

module.exports = CommunicationCategory;

