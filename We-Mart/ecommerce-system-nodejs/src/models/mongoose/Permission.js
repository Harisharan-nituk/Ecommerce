const mongoose = require('mongoose');

/**
 * Permission Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_permissions for easy migration
 */
const permissionSchema = new mongoose.Schema({
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
  module: {
    type: String,
    default: null,
    index: true,
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
  collection: 'permissions',
  timestamps: false,
});

// Indexes
permissionSchema.index({ name: 1 });
permissionSchema.index({ module: 1 });
permissionSchema.index({ status: 1 });

// Pre-save hook
permissionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  if (next && typeof next === 'function') {
    next();
  }
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;

