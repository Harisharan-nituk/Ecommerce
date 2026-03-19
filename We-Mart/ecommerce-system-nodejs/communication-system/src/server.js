const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/app');
const { connect, isConnected } = require('./config/database');
const logger = require('./utils/logger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Health check route (before auth)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: config.serviceName,
    status: isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Communication System API',
    version: '1.0.0',
    service: config.serviceName,
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/health-check',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connect();

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Communication System running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🔗 Service: ${config.serviceName}`);
      logger.info(`🌐 MongoDB connected: ${isConnected()}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  const { disconnect } = require('./config/database');
  await disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  const { disconnect } = require('./config/database');
  await disconnect();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;

