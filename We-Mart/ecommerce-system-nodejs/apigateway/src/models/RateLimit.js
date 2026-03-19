const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Rate Limit Model - Stores rate limit data in database
 */
const RateLimit = sequelize.define('RateLimit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  identifier: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'IP address or user ID'
  },
  route: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'API route path'
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Request count'
  },
  windowStart: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'window_start',
    comment: 'Rate limit window start time'
  },
  windowEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'window_end',
    comment: 'Rate limit window end time'
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this identifier is blocked'
  },
  blockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'blocked_until',
    comment: 'Block expiration time'
  }
}, {
  tableName: 'rate_limits',
  indexes: [
    {
      fields: ['identifier', 'route', 'window_start']
    },
    {
      fields: ['identifier']
    },
    {
      fields: ['window_end']
    }
  ]
});

module.exports = RateLimit;

