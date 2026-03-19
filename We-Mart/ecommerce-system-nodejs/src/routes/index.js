const express = require('express');
const router = express.Router();
const config = require('../config/app');
const dbManager = require('../config/database');

// Health check route
router.get('/health', async (req, res) => {
  try {
    const connections = await dbManager.testConnections();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      databases: {
        mysql: {
          status: connections.mysql ? 'connected' : 'disconnected',
          error: connections.errors?.mysql || null
        },
        mongodb: {
          status: connections.mongodb ? 'connected' : 'disconnected',
          error: connections.errors?.mongodb || null,
          enabled: dbManager.getMongoDB().isConnected()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// API routes
router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/categories', require('./categories')); // Category routes
router.use('/cart', require('./cart'));
router.use('/orders', require('./orders'));
router.use('/payments', require('./payments'));
router.use('/roles', require('./roles'));
router.use('/permissions', require('./permissions'));
router.use('/seller', require('./seller'));
router.use('/seller', require('./sellerAccount')); // Seller account/wallet routes
router.use('/seller', require('./payout')); // Seller payout routes
router.use('/seller', require('./sellerReports')); // Seller report routes
router.use('/admin', require('./adminPayout')); // Admin payout management routes
router.use('/admin', require('./adminReports')); // Admin report routes
router.use('/customer', require('./customerWallet')); // Customer wallet routes
router.use('/users', require('./users'));
router.use('/inventory', require('./inventory')); // Inventory management routes
router.use('/upload', require('./upload')); // Image upload routes
router.use('/brands', require('./brands')); // Brand management routes
router.use('/returns', require('./returns')); // Return/Exchange routes
router.use('/reviews', require('./reviews')); // Review/Rating routes

module.exports = router;

