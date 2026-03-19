const crypto = require('crypto');
const config = require('../config/app');

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return null;
  
  const key = crypto.scryptSync(config.encryption.key, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(config.encryption.algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const key = crypto.scryptSync(config.encryption.key, 'salt', 32);
    const decipher = crypto.createDecipheriv(config.encryption.algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const saltRounds = config.bcryptRounds;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password
 */
async function verifyPassword(password, hash) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
}

/**
 * Generate random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken
};

