require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  gatewayName: process.env.GATEWAY_NAME || 'ecommerce-gateway',

  // Backend Services
  services: {
    ecommerce: {
      url: process.env.ECOMMERCE_API_URL || 'http://localhost:3000',
      version: process.env.ECOMMERCE_API_VERSION || 'v1'
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    validationEndpoint: process.env.JWT_VALIDATION_ENDPOINT || 'http://localhost:3000/api/v1/auth/validate'
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc'
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    storeType: process.env.RATE_LIMIT_STORE_TYPE || 'memory' // memory, database, redis
  },

  // Security
  security: {
    allowedDomains: (process.env.ALLOWED_DOMAINS || '').split(',').filter(Boolean),
    allowedIPs: (process.env.ALLOWED_IPS || '').split(',').filter(Boolean),
    blockedIPs: (process.env.BLOCKED_IPS || '').split(',').filter(Boolean),
    ipWhitelistEnabled: process.env.IP_WHITELIST_ENABLED === 'true',
    ipBlacklistEnabled: process.env.IP_BLACKLIST_ENABLED === 'true'
  },

  // CORS
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:8080').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // Request
  request: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000
  },

  // Circuit Breaker
  circuitBreaker: {
    enabled: process.env.CIRCUIT_BREAKER_ENABLED === 'true',
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000
  },

  // Redis
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/gateway.log'
  }
};

