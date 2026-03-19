require('dotenv').config();

module.exports = {
  // Server
  port: process.env.COMMUNICATION_PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  serviceName: 'communication-system',

  // MongoDB
  mongodb: {
    connectionString: process.env.MONGODB_CONNECTION_STRING,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Email Configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  // SMS Configuration
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    provider: process.env.SMS_PROVIDER || 'twilio', // twilio, custom
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
  },

  // WhatsApp Configuration
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    provider: process.env.WHATSAPP_PROVIDER || 'twilio', // twilio, custom
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_WHATSAPP_FROM,
    },
  },

  // OTP Configuration
  otp: {
    expiry: parseInt(process.env.OTP_EXPIRY) || 600000, // 10 minutes in ms
    length: parseInt(process.env.OTP_LENGTH) || 6,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 3,
    maxResend: parseInt(process.env.OTP_MAX_RESEND) || 3,
  },

  // Communication Event
  communicationEvent: {
    cleanupDays: parseInt(process.env.COMMUNICATION_CLEANUP_DAYS) || 30,
    batchSize: parseInt(process.env.COMMUNICATION_BATCH_SIZE) || 100,
  },

  // CORS
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/communication.log',
  },
};

