const express = require('express');
const router = express.Router();
const RouteConfig = require('../models/RouteConfig');
const AllowedDomain = require('../models/AllowedDomain');
const IPWhitelist = require('../models/IPWhitelist');
const IPBlacklist = require('../models/IPBlacklist');
const RateLimit = require('../models/RateLimit');
const ApiLog = require('../models/ApiLog');
const routingService = require('../services/RoutingService');
const logger = require('../utils/logger');

/**
 * Route Management
 */
router.get('/routes', async (req, res) => {
  try {
    const routes = await RouteConfig.findAll({
      order: [['path', 'ASC']]
    });
    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    logger.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get routes'
    });
  }
});

router.post('/routes', async (req, res) => {
  try {
    const route = await RouteConfig.create(req.body);
    await routingService.loadRoutes(); // Reload routes
    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    logger.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create route'
    });
  }
});

router.put('/routes/:id', async (req, res) => {
  try {
    const route = await RouteConfig.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    await route.update(req.body);
    await routingService.loadRoutes(); // Reload routes
    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    logger.error('Update route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update route'
    });
  }
});

router.delete('/routes/:id', async (req, res) => {
  try {
    const route = await RouteConfig.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    await route.destroy();
    await routingService.loadRoutes(); // Reload routes
    res.json({
      success: true,
      message: 'Route deleted'
    });
  } catch (error) {
    logger.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete route'
    });
  }
});

/**
 * Domain Management
 */
router.get('/domains', async (req, res) => {
  try {
    const domains = await AllowedDomain.findAll();
    res.json({
      success: true,
      data: domains
    });
  } catch (error) {
    logger.error('Get domains error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get domains'
    });
  }
});

router.post('/domains', async (req, res) => {
  try {
    const domain = await AllowedDomain.create(req.body);
    res.status(201).json({
      success: true,
      data: domain
    });
  } catch (error) {
    logger.error('Create domain error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create domain'
    });
  }
});

/**
 * IP Whitelist Management
 */
router.get('/ip-whitelist', async (req, res) => {
  try {
    const ips = await IPWhitelist.findAll();
    res.json({
      success: true,
      data: ips
    });
  } catch (error) {
    logger.error('Get IP whitelist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IP whitelist'
    });
  }
});

router.post('/ip-whitelist', async (req, res) => {
  try {
    const ip = await IPWhitelist.create(req.body);
    res.status(201).json({
      success: true,
      data: ip
    });
  } catch (error) {
    logger.error('Create IP whitelist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add IP to whitelist'
    });
  }
});

/**
 * IP Blacklist Management
 */
router.get('/ip-blacklist', async (req, res) => {
  try {
    const ips = await IPBlacklist.findAll();
    res.json({
      success: true,
      data: ips
    });
  } catch (error) {
    logger.error('Get IP blacklist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get IP blacklist'
    });
  }
});

router.post('/ip-blacklist', async (req, res) => {
  try {
    const ip = await IPBlacklist.create(req.body);
    res.status(201).json({
      success: true,
      data: ip
    });
  } catch (error) {
    logger.error('Create IP blacklist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add IP to blacklist'
    });
  }
});

/**
 * Rate Limit Management
 */
router.get('/rate-limits', async (req, res) => {
  try {
    const limits = await RateLimit.findAll({
      where: { blocked: true },
      order: [['created_at', 'DESC']],
      limit: 100
    });
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    logger.error('Get rate limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limits'
    });
  }
});

/**
 * API Logs
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const logs = await ApiLog.findAll({
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get logs'
    });
  }
});

module.exports = router;

