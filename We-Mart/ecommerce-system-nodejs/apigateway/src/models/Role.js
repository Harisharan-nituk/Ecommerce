const mongoose = require('mongoose');

/**
 * Role Schema for API Gateway
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  collection: 'gateway_roles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Indexes (name and status already indexed in schema fields)

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

