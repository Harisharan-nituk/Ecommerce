const mongoose = require('mongoose');
require('dotenv').config();

/**
 * MongoDB Connection using Mongoose ORM for API Gateway
 */
class MongooseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      if (!process.env.MONGODB_ENABLED || process.env.MONGODB_ENABLED === 'false') {
        console.log('⚠️  MongoDB disabled in API Gateway configuration');
        return null;
      }

      const connectionString = process.env.MONGODB_CONNECTION_STRING;
      if (!connectionString) {
        console.log('⚠️  MongoDB connection string not provided in API Gateway');
        return null;
      }

      // Mongoose connection options
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(connectionString, options);
      
      console.log('✅ API Gateway MongoDB connected successfully via Mongoose');
      console.log(`   Database: ${mongoose.connection.db.databaseName}`);
      
      return this.connection;
    } catch (error) {
      console.error('❌ API Gateway MongoDB connection failed:', error.message);
      // Don't throw - allow gateway to continue without MongoDB
      return null;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('API Gateway MongoDB connection closed');
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getConnection() {
    return mongoose.connection;
  }
}

// Singleton instance
const mongooseConnection = new MongooseConnection();

module.exports = mongooseConnection;

