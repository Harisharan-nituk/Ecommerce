const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Route Configuration Model - Stores routing rules
 */
const RouteConfig = sequelize.define('RouteConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'API route path pattern'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'ALL',
    comment: 'HTTP method (GET, POST, PUT, DELETE, ALL)'
  },
  targetService: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'target_service',
    comment: 'Target backend service name'
  },
  targetUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'target_url',
    comment: 'Target backend service URL'
  },
  requiresAuth: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'requires_auth',
    comment: 'Whether route requires authentication'
  },
  rateLimitMax: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'rate_limit_max',
    comment: 'Maximum requests per window'
  },
  rateLimitWindow: {
    type: DataTypes.INTEGER,
    defaultValue: 900000,
    field: 'rate_limit_window',
    comment: 'Rate limit window in milliseconds'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether route is enabled'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Route description'
  }
}, {
  tableName: 'route_configs',
  indexes: [
    {
      fields: ['path', 'method']
    },
    {
      fields: ['enabled']
    }
  ]
});

module.exports = RouteConfig;

