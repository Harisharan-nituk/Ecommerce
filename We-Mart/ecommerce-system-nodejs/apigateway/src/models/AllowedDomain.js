const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Allowed Domain Model - Manages allowed domains for CORS
 */
const AllowedDomain = sequelize.define('AllowedDomain', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  domain: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Allowed domain (e.g., https://example.com)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Domain description'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether domain is enabled'
  }
}, {
  tableName: 'allowed_domains',
  indexes: [
    {
      fields: ['domain']
    },
    {
      fields: ['enabled']
    }
  ]
});

module.exports = AllowedDomain;

