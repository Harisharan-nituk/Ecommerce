const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Sequelize ORM Configuration
 */
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'apigateway_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

/**
 * Test database connection
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Sync database models
 */
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database models synchronized');
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};

