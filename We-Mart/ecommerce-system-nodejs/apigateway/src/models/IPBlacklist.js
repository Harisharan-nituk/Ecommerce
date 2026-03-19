const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * IP Blacklist Model - Manages blocked IP addresses
 */
const IPBlacklist = sequelize.define('IPBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'ip_address',
    comment: 'IP address or CIDR range to block'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for blocking'
  },
  blockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'blocked_until',
    comment: 'Block expiration time (null = permanent)'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether block is active'
  }
}, {
  tableName: 'ip_blacklist',
  indexes: [
    {
      fields: ['ip_address']
    },
    {
      fields: ['enabled', 'blocked_until']
    }
  ]
});

module.exports = IPBlacklist;

