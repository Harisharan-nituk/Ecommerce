const mongoose = require('mongoose');

/**
 * UserToken Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_user_tokens for easy migration
 */
const userTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  access_token: {
    type: String,
    required: true,
    index: true,
  },
  refresh_token: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'user_tokens',
  timestamps: false,
});

// Indexes
userTokenSchema.index({ user_id: 1, status: 1 });
userTokenSchema.index({ access_token: 1, status: 1 });

// Pre-save hook
userTokenSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  if (next && typeof next === 'function') {
    next();
  }
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;

