const mongoose = require('mongoose');

/**
 * Role Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_roles for easy migration
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'roles',
  timestamps: false,
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ status: 1 });

// Pre-save hook removed - we handle updated_at manually in controllers
// This avoids "next is not a function" errors with Mongoose

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

