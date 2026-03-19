const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../../utils/encryption');

/**
 * User Schema - MongoDB with Mongoose
 * Structure matches MySQL tbl_users for easy migration
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  },
  is_login: {
    type: Boolean,
    default: false,
  },
  failed_login_attempts: {
    type: Number,
    default: 0,
  },
  last_login_time: {
    type: Date,
    default: null,
  },
  phone_verification_code: {
    type: String,
    default: null,
  },
  phone_verification_expiry: {
    type: Date,
    default: null,
  },
  is_phone_verified: {
    type: Boolean,
    default: false,
  },
  email_verification_token: {
    type: String,
    default: null,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
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
  collection: 'users', // Collection name in MongoDB
  timestamps: false, // We manage timestamps manually
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ created_at: -1 });

// Virtual for full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Note: updated_at is handled manually in methods that need it
// Pre-save hook removed to avoid "next is not a function" errors

// Instance method to decrypt email
userSchema.methods.getDecryptedEmail = function() {
  return decrypt(this.email);
};

// Instance method to decrypt phone
userSchema.methods.getDecryptedPhone = function() {
  return this.phone ? decrypt(this.phone) : null;
};

// Static method to find user by decrypted email
userSchema.statics.findByEmail = async function(email) {
  const users = await this.find({});
  for (const user of users) {
    if (decrypt(user.email) === email) {
      return user;
    }
  }
  return null;
};

// Static method to create user with encryption
userSchema.statics.createUser = async function(userData) {
  // Encrypt email and phone before creating
  const encryptedEmail = encrypt(userData.email);
  const encryptedPhone = userData.phone ? encrypt(userData.phone) : null;
  
  // Create user with encrypted data
  const user = new this({
    email: encryptedEmail,
    password: userData.password,
    phone: encryptedPhone,
    first_name: userData.first_name,
    last_name: userData.last_name,
    status: userData.status || 'active',
    is_email_verified: userData.is_email_verified || false,
    is_phone_verified: userData.is_phone_verified || false,
  });
  
  return await user.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;

