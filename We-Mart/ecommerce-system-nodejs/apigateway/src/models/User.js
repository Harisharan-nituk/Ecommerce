const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * User Schema for API Gateway
 * Following ITMS pattern: Only iam_uuid for unique user identification
 * Fields: iam_uuid, email, password (hashed), role_id, mobile_number
 */
const userSchema = new mongoose.Schema({
  // Primary identifier - Only IAM UUID
  iam_uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true,
    required: true,
  },
  
  // User credentials
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    set: encrypt, // Encrypt email before saving
    get: decrypt, // Decrypt email when retrieving
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't return password by default
  },
  mobile_number: {
    type: String,
    required: true,
    index: true,
    set: encrypt, // Encrypt mobile before saving
    get: decrypt, // Decrypt mobile when retrieving
  },
  
  // Role assignment
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null,
    index: true,
  },
  
  // User information
  first_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  user_name: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  
  // Status and metadata
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
  
  // Additional fields (like ITMS)
  emp_code: {
    type: String,
    default: null,
    index: true,
  },
  parent_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  user_type: {
    type: String,
    default: null,
  },
  gender: {
    type: Boolean,
    default: null,
  },
  
  // Verification
  is_email_verified: {
    type: Boolean,
    default: false,
  },
  is_phone_verified: {
    type: Boolean,
    default: false,
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  collection: 'gateway_users',
  timestamps: false, // We manage timestamps manually
  toJSON: { getters: true, setters: true },
  toObject: { getters: true, setters: true },
});

// Indexes for performance (removed duplicates - already defined in schema fields)
userSchema.index({ created_at: -1 });

// Virtual for full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name || ''} ${this.last_name || ''}`.trim();
});

// Pre-save hook
userSchema.pre('save', async function(next) {
  // Generate iam_uuid if not present
  if (this.isNew && !this.iam_uuid) {
    this.iam_uuid = uuidv4();
  }
  
  // Update timestamp
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  
  next();
});

// Instance method to decrypt email
userSchema.methods.getDecryptedEmail = function() {
  return decrypt(this.email);
};

// Instance method to decrypt mobile
userSchema.methods.getDecryptedMobile = function() {
  return this.mobile_number ? decrypt(this.mobile_number) : null;
};

// Static method to find user by decrypted email
userSchema.statics.findByEmail = async function(email) {
  const users = await this.find({}).select('+password');
  for (const user of users) {
    if (decrypt(user.email) === email) {
      return user;
    }
  }
  return null;
};

// Static method to find user by decrypted mobile
userSchema.statics.findByMobile = async function(mobile) {
  const users = await this.find({}).select('+password');
  for (const user of users) {
    if (decrypt(user.mobile_number) === mobile) {
      return user;
    }
  }
  return null;
};

// Static method to find user by iam_uuid
userSchema.statics.findByIamUUID = async function(iamUuid) {
  return await this.findOne({ iam_uuid: iamUuid });
};

// Static method to create user with encryption and UUID
userSchema.statics.createUser = async function(userData) {
  const { hashPassword } = require('../utils/encryption');
  
  // Hash password if provided as plain text
  let hashedPassword = userData.password;
  if (userData.password && !userData.password.startsWith('$2')) {
    // Not already hashed (bcrypt hashes start with $2)
    hashedPassword = await hashPassword(userData.password);
  }
  
  const iam_uuid = uuidv4();
  
  const user = new this({
    ...userData,
    password: hashedPassword,
    iam_uuid,
    // Email and mobile will be encrypted by setters
  });
  
  return await user.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
