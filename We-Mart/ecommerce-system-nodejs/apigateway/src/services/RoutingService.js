const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const RouteConfig = require('../models/RouteConfig');
const config = require('../config/app');
const logger = require('../utils/logger');

class RoutingService {
  constructor() {
    this.routes = new Map();
    this.serviceCache = new Map();
  }

  /**
   * Load routes from database
   */
  async loadRoutes() {
    try {
      const routes = await RouteConfig.findAll({
        where: { enabled: true }
      });

      this.routes.clear();
      
      for (const route of routes) {
        const key = `${route.method}:${route.path}`;
        this.routes.set(key, route);
      }

      logger.info(`Loaded ${routes.length} routes from database`);
      return routes;
    } catch (error) {
      logger.error('Failed to load routes:', error);
      // Load default routes if database fails
      return this.loadDefaultRoutes();
    }
  }

  /**
   * Load default routes from configuration
   */
  loadDefaultRoutes() {
    const defaultRoutes = [
      {
        path: '/api/v1/*',
        method: 'ALL',
        targetService: 'ecommerce',
        targetUrl: `${config.services.ecommerce.url}/api/${config.services.ecommerce.version}`,
        requiresAuth: true,
        rateLimitMax: 100,
        rateLimitWindow: 900000
      }
    ];

    for (const route of defaultRoutes) {
      const key = `${route.method}:${route.path}`;
      this.routes.set(key, route);
    }

    logger.info('Loaded default routes from configuration');
    return defaultRoutes;
  }

  /**
   * Find matching route
   */
  findRoute(method, path) {
    // Try exact match first
    const exactKey = `${method}:${path}`;
    if (this.routes.has(exactKey)) {
      return this.routes.get(exactKey);
    }

    // Try ALL method
    const allKey = `ALL:${path}`;
    if (this.routes.has(allKey)) {
      return this.routes.get(allKey);
    }

    // Try pattern matching
    for (const [key, route] of this.routes.entries()) {
      const [routeMethod, routePath] = key.split(':');
      
      if ((routeMethod === method || routeMethod === 'ALL') && this.matchPath(routePath, path)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Match path pattern (supports wildcards)
   */
  matchPath(pattern, path) {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Get target URL for route
   */
  getTargetUrl(route, originalPath) {
    if (!route) return null;

    let targetUrl = route.targetUrl || route.target_url;
    
    // Replace path variables if needed
    if (targetUrl.includes('*')) {
      // Extract the path after the route pattern
      const routePath = route.path || route.path;
      const pathSuffix = originalPath.replace(new RegExp(`^${routePath.replace(/\*/g, '.*')}`), '');
      targetUrl = targetUrl.replace('*', pathSuffix);
    }

    return targetUrl;
  }

  /**
   * Create proxy middleware for route
   */
  createProxy(route) {
    const targetUrl = route.targetUrl || route.target_url;
    const target = new URL(targetUrl).origin;

    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // Rewrite path to match target service
        const routePath = route.path || route.path;
        const basePath = new URL(targetUrl).pathname;
        
        // Remove gateway path prefix and add target path
        let newPath = path;
        if (routePath.includes('*')) {
          const pattern = routePath.replace(/\*/g, '.*');
          newPath = path.replace(new RegExp(`^${pattern}`), '');
        }
        
        return basePath + newPath;
      },
      onProxyReq: (proxyReq, req, res) => {
        // Forward original headers
        if (req.headers['x-auth-token']) {
          proxyReq.setHeader('x-auth-token', req.headers['x-auth-token']);
        }
        if (req.headers['authorization']) {
          proxyReq.setHeader('authorization', req.headers['authorization']);
        }
        
        // Add gateway headers
        proxyReq.setHeader('x-gateway-request-id', req.requestId || 'unknown');
        proxyReq.setHeader('x-forwarded-by', config.gatewayName);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add gateway headers to response
        proxyRes.headers['x-gateway'] = config.gatewayName;
      },
      onError: (err, req, res) => {
        logger.error('Proxy error:', err);
        res.status(502).json({
          success: false,
          message: 'Service unavailable',
          error: 'Backend service error'
        });
      },
      timeout: config.request.timeout
    });
  }

  /**
   * Health check for target service
   */
  async checkServiceHealth(serviceUrl) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new RoutingService();

