const mongoose = require('mongoose');

/**
 * UserRole Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_user_roles for easy migration
 * Links users to roles
 */
const userRoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'user_roles',
  timestamps: false,
});

// Compound index for unique user-role pairs
userRoleSchema.index({ user_id: 1, role_id: 1 }, { unique: true });

const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = UserRole;

