// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  // Payment errors
  if (err.type === 'StripeCardError') {
    error = {
      message: err.message,
      statusCode: 402
    };
  }

  if (err.type === 'StripeInvalidRequestError') {
    error = {
      message: 'Invalid payment request',
      statusCode: 400
    };
  }

  // Database connection errors
  if (err.name === 'MongoServerError') {
    error = {
      message: 'Database connection error',
      statusCode: 500
    };
  }

  // Network errors
  if (err.code === 'ECONNREFUSED') {
    error = {
      message: 'Service unavailable',
      statusCode: 503
    };
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429
    };
  }

  // Permission errors
  if (err.message && err.message.includes('permission')) {
    error = {
      message: 'Permission denied',
      statusCode: 403
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  const message = `Invalid input data: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

// Duplicate field error handler
const handleDuplicateFieldError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  return new AppError(message, 400);
};

// Cast error handler
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

// Global error handler for development
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Global error handler for production
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  
  return res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  AppError,
  handleValidationError,
  handleDuplicateFieldError,
  handleCastError,
  sendErrorDev,
  sendErrorProd
};