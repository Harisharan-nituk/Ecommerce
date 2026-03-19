const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * API Log Model - Stores API request/response logs
 */
const ApiLog = sequelize.define('ApiLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requestId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'request_id',
    comment: 'Unique request ID'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'HTTP method'
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Request path'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
    comment: 'Client IP address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
    comment: 'User agent string'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    comment: 'Authenticated user ID'
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'status_code',
    comment: 'HTTP status code'
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'response_time',
    comment: 'Response time in milliseconds'
  },
  requestBody: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'request_body',
    comment: 'Request body (sanitized)'
  },
  responseBody: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_body',
    comment: 'Response body (truncated)'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if any'
  }
}, {
  tableName: 'api_logs',
  indexes: [
    {
      fields: ['request_id']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['status_code']
    }
  ]
});

module.exports = ApiLog;

