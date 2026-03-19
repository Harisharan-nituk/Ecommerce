const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/app');
const dbManager = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const auditLog = require('./middleware/auditLog');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api/', limiter);

// Audit logging (if MongoDB is available)
const mongooseConnection = require('./config/mongoose');
if (mongooseConnection.isConnected()) {
  app.use(auditLog);
}

// API routes
const apiVersion = config.apiVersion;
app.use(`/api/${apiVersion}`, require('./routes'));

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce System API - Backend Only',
    version: '1.0.0',
    apiVersion: apiVersion,
    note: 'This is a backend API server. Frontend is available separately.',
    endpoints: {
      health: `/api/${apiVersion}/health`,
      auth: `/api/${apiVersion}/auth`,
      products: `/api/${apiVersion}/products`,
      cart: `/api/${apiVersion}/cart`,
      orders: `/api/${apiVersion}/orders`,
      payments: `/api/${apiVersion}/payments`,
      seller: `/api/${apiVersion}/seller`,
      roles: `/api/${apiVersion}/roles`,
      permissions: `/api/${apiVersion}/permissions`
    }
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce System API',
    version: '1.0.0',
    apiVersion: apiVersion,
    endpoints: {
      health: `/api/${apiVersion}/health`,
      auth: `/api/${apiVersion}/auth`,
      products: `/api/${apiVersion}/products`,
      cart: `/api/${apiVersion}/cart`,
      orders: `/api/${apiVersion}/orders`,
      payments: `/api/${apiVersion}/payments`
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize databases
    await dbManager.initialize();
    
    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await dbManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await dbManager.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;

