const mongoose = require('mongoose');

/**
 * RolePermission Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_role_permissions for easy migration
 * Links roles to permissions
 */
const rolePermissionSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  },
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'role_permissions',
  timestamps: false,
});

// Compound index for unique role-permission pairs
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;

