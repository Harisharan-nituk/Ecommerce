const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config/app');

/**
 * Encrypt data
 */
function encrypt(text) {
  if (!text) return null;
  
  try {
    const key = crypto.scryptSync(config.encryption.key, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(config.encryption.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

/**
 * Decrypt data
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
    
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
 * Hash data (one-way)
 */
function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt sensitive headers
 */
function encryptHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'x-auth-token', 'cookie'];
  const encrypted = { ...headers };
  
  for (const header of sensitiveHeaders) {
    if (encrypted[header]) {
      encrypted[header] = encrypt(encrypted[header]);
    }
  }
  
  return encrypted;
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password using bcrypt
 */
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  encryptHeaders,
  hashPassword,
  verifyPassword
};

