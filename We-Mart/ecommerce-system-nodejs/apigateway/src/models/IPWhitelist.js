const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * IP Whitelist Model - Manages allowed IP addresses
 */
const IPWhitelist = sequelize.define('IPWhitelist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'ip_address',
    comment: 'IP address or CIDR range (e.g., 192.168.1.1 or 192.168.1.0/24)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'IP description'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether IP is enabled'
  }
}, {
  tableName: 'ip_whitelist',
  indexes: [
    {
      fields: ['ip_address']
    },
    {
      fields: ['enabled']
    }
  ]
});

module.exports = IPWhitelist;

