const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/app');
const { testConnection, syncDatabase } = require('./config/database');
const mongooseConnection = require('./config/mongoose');
const logger = require('./utils/logger');
const routingService = require('./services/RoutingService');
const requestLogger = require('./middleware/requestLogger');
const checkIPAccess = require('./middleware/ipCheck');
const checkAllowedDomain = require('./middleware/domainCheck');
const { validateToken, optionalTokenValidation } = require('./middleware/auth');
const { createRateLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Request logging
app.use(requestLogger);

// IP and domain checks
app.use(checkIPAccess);
app.use(checkAllowedDomain);

// Health check route (before routing)
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'ok',
      gateway: config.gatewayName,
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      routes: routingService.routes.size
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Load routes from database
routingService.loadRoutes().then(() => {
  // Dynamic routing - handle all API requests
  app.all('/api/*', async (req, res, next) => {
    try {
      const method = req.method;
      const path = req.path;

      // Find matching route
      const route = routingService.findRoute(method, path);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found',
          path: path
        });
      }

      // Attach route to request
      req.route = route;

      // Apply rate limiting
      const rateLimiter = createRateLimiter(route);
      await new Promise((resolve, reject) => {
        rateLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check authentication if required
      if (route.requiresAuth || route.requires_auth) {
        await new Promise((resolve, reject) => {
          validateToken(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        // Optional authentication
        await new Promise((resolve) => {
          optionalTokenValidation(req, res, () => resolve());
        });
      }

      // Create and use proxy
      const proxy = routingService.createProxy(route);
      proxy(req, res, next);
    } catch (error) {
      logger.error('Routing error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Routing error',
          error: error.message
        });
      }
    }
  });

  // Gateway management routes
  app.use('/gateway', require('./routes/gateway'));
  
  // User management routes (from API Gateway)
  app.use('/gateway/users', require('./routes/users'));
  
  // Authentication routes (login, logout, profile)
  app.use('/gateway/auth', require('./routes/auth'));
  
  // OTP management routes
  app.use('/gateway/otp', require('./routes/otp'));

  // Communication System routes (proxy to communication service)
  const { createProxyMiddleware } = require('http-proxy-middleware');
  app.use('/communication', createProxyMiddleware({
    target: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/communication': '/api/v1',
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward authentication headers
      if (req.headers['authorization']) {
        proxyReq.setHeader('authorization', req.headers['authorization']);
      }
      if (req.headers['x-auth-token']) {
        proxyReq.setHeader('x-auth-token', req.headers['x-auth-token']);
      }
      // Forward user info if available
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id || '');
        proxyReq.setHeader('x-iam-uuid', req.user.iam_uuid || '');
      }
    },
    onError: (err, req, res) => {
      logger.error('Communication service proxy error:', err);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Communication service unavailable',
        });
      }
    },
  }));

  // Root route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'E-Commerce API Gateway',
      version: '1.0.0',
      gateway: config.gatewayName,
      endpoints: {
        health: '/health',
        api: '/api/*',
        gateway: '/gateway/*',
        communication: '/communication/*'
      },
      routes: routingService.routes.size
    });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Start server
  async function startServer() {
    try {
      // Test database connection
      await testConnection();

      // Connect to MongoDB (for user management)
      await mongooseConnection.connect();

      // Sync database models
      if (config.env === 'development') {
        await syncDatabase(false);
      }

      // Reload routes periodically
      setInterval(async () => {
        await routingService.loadRoutes();
      }, 60000); // Reload every minute

      const PORT = config.port;
      app.listen(PORT, () => {
        logger.info(`🚀 API Gateway running on port ${PORT}`);
        logger.info(`📝 Environment: ${config.env}`);
        logger.info(`🔗 Gateway: ${config.gatewayName}`);
        logger.info(`📊 Routes loaded: ${routingService.routes.size}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  // Start the server
  if (require.main === module) {
    startServer();
  }
}).catch(error => {
  logger.error('Failed to load routes:', error);
  process.exit(1);
});

module.exports = app;

