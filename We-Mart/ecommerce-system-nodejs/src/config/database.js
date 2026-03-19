const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const mongooseConnection = require('./mongoose');
require('dotenv').config();

/**
 * MySQL Database Connection
 */
class MySQLDatabase {
  constructor() {
    this.pool = null;
    this.connection = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'ecommerce_system',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });

      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      console.log('✅ MySQL connected successfully');
      return this.pool;
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }

  async query(sql, params) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('MySQL query error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('MySQL connection closed');
    }
  }
}

/**
 * MongoDB Database Connection
 */
class MongoDBDatabase {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      if (!process.env.MONGODB_ENABLED || process.env.MONGODB_ENABLED === 'false') {
        console.log('⚠️  MongoDB disabled in configuration');
        return null;
      }

      const connectionString = process.env.MONGODB_CONNECTION_STRING;
      if (!connectionString) {
        console.log('⚠️  MongoDB connection string not provided');
        return null;
      }

      this.client = new MongoClient(connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });

      await this.client.connect();
      this.db = this.client.db();
      
      // Test connection
      await this.db.admin().ping();
      
      console.log('✅ MongoDB connected successfully');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      // Don't throw - allow app to continue without MongoDB
      return null;
    }
  }

  getCollection(collectionName) {
    if (!this.db) {
      return null;
    }
    return this.db.collection(collectionName);
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  isConnected() {
    return this.client !== null && this.db !== null;
  }
}

/**
 * Database Manager - Unified interface for both databases
 */
class DatabaseManager {
  constructor() {
    this.mysql = new MySQLDatabase();
    this.mongodb = new MongoDBDatabase();
  }

  async initialize() {
    // Initialize MongoDB with Mongoose (primary database)
    if (process.env.USE_MONGODB !== 'false') {
      await mongooseConnection.connect();
    }
    
    // Initialize MySQL (optional, for future migration)
    if (process.env.USE_MYSQL === 'true') {
      await this.mysql.connect();
    }
    
    // Initialize native MongoDB client (optional, for direct access)
    if (process.env.USE_NATIVE_MONGODB === 'true') {
      await this.mongodb.connect();
    }
  }

  getMySQL() {
    return this.mysql;
  }

  getMongoDB() {
    return this.mongodb;
  }

  async testConnections() {
    const results = {
      mysql: false,
      mongodb: false,
      errors: {}
    };

    // Test MySQL
    try {
      await this.mysql.query('SELECT 1');
      results.mysql = true;
    } catch (error) {
      results.errors.mysql = error.message;
    }

    // Test MongoDB
    if (this.mongodb.isConnected()) {
      try {
        await this.mongodb.db.admin().ping();
        results.mongodb = true;
      } catch (error) {
        results.errors.mongodb = error.message;
      }
    }

    return results;
  }

  getMongoose() {
    return mongooseConnection;
  }

  async close() {
    await mongooseConnection.disconnect();
    await this.mysql.close();
    await this.mongodb.close();
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;

