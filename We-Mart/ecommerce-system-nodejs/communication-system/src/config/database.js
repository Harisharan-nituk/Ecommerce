const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Connection for Communication System
 */
const connectMongoDB = async () => {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;
  if (!connectionString) {
    logger.error('MONGODB_CONNECTION_STRING not found in environment variables');
    return;
  }

  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('✅ MongoDB connected successfully for Communication System');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected from Communication System');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error.message);
  }
};

const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connect: connectMongoDB,
  disconnect: disconnectMongoDB,
  isConnected,
  mongoose,
};

