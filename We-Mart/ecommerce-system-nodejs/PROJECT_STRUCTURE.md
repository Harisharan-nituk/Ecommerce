# Project Structure Documentation

## Overview

This Node.js e-commerce system follows a clean, modular architecture with separation of concerns.

## Directory Structure

```
ecommerce-system-nodejs/
│
├── src/                          # Source code
│   ├── config/                   # Configuration files
│   │   ├── app.js               # App configuration (JWT, upload, security)
│   │   └── database.js          # MySQL & MongoDB connection management
│   │
│   ├── controllers/             # Request handlers (business logic)
│   │   ├── AuthController.js    # Authentication & authorization
│   │   ├── ProductController.js # Product CRUD operations
│   │   ├── CartController.js     # Shopping cart management
│   │   ├── OrderController.js    # Order processing
│   │   └── PaymentController.js  # Payment processing
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── permissions.js       # RBAC permission checks
│   │   ├── errorHandler.js      # Global error handling
│   │   └── auditLog.js          # Audit logging to MongoDB
│   │
│   ├── models/                   # Data access layer
│   │   ├── UserModel.js         # User database operations
│   │   ├── UserTokenModel.js    # Token management
│   │   ├── ProductModel.js      # Product database operations
│   │   ├── CartModel.js         # Cart database operations
│   │   └── OrderModel.js        # Order database operations
│   │
│   ├── routes/                  # API route definitions
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product routes
│   │   ├── cart.js              # Cart routes
│   │   ├── orders.js            # Order routes
│   │   ├── payments.js          # Payment routes
│   │   └── index.js             # Route aggregator & health check
│   │
│   ├── utils/                    # Utility functions
│   │   ├── encryption.js        # Data encryption/decryption
│   │   ├── logger.js            # Winston logger setup
│   │   └── validators.js        # Input validation rules
│   │
│   └── server.js                # Express app & server startup
│
├── logs/                         # Application logs (created at runtime)
│   ├── app.log                  # All logs
│   └── error.log                # Error logs only
│
├── uploads/                      # File uploads directory
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # NPM dependencies & scripts
└── README.md                    # Project documentation
```

## File Responsibilities

### Configuration (`src/config/`)

**app.js**
- Centralized application configuration
- Reads from environment variables
- Provides defaults

**database.js**
- MySQL connection pool management
- MongoDB client management
- Database connection testing
- Unified database interface

### Controllers (`src/controllers/`)

Handle HTTP requests and responses:
- Validate input
- Call models for data operations
- Format responses
- Handle errors

### Middleware (`src/middleware/`)

**auth.js**
- JWT token verification
- User authentication
- Optional authentication

**permissions.js**
- Role-based permission checks
- Super admin bypass
- Permission validation

**errorHandler.js**
- Global error catching
- Error formatting
- 404 handling

**auditLog.js**
- Logs user actions to MongoDB
- Captures request/response data
- Sanitizes sensitive information

### Models (`src/models/`)

Data access layer:
- Database queries
- Data transformation
- Business logic for data operations

### Routes (`src/routes/`)

API endpoint definitions:
- Route paths
- HTTP methods
- Middleware application
- Controller binding

### Utils (`src/utils/`)

**encryption.js**
- Password hashing (bcrypt)
- Data encryption/decryption
- Token generation

**logger.js**
- Winston logger configuration
- Log file management
- Log levels

**validators.js**
- Express-validator rules
- Input validation middleware
- Error formatting

## Data Flow

```
Request → Middleware → Route → Controller → Model → Database
                                                      ↓
Response ← Middleware ← Route ← Controller ← Model ← Database
```

1. **Request arrives** at Express server
2. **Middleware** processes (auth, logging, validation)
3. **Route** matches and calls controller
4. **Controller** validates and calls model
5. **Model** executes database queries
6. **Response** flows back through layers

## Database Architecture

### MySQL (Relational Data)
- Users, roles, permissions
- Products, categories
- Orders, cart
- Addresses

### MongoDB (Document Data)
- Audit logs
- API logs
- Analytics
- Sessions

## Security Layers

1. **Helmet** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS protection
4. **JWT Authentication** - Token-based auth
5. **RBAC** - Permission checks
6. **Input Validation** - Data sanitization
7. **Encryption** - Sensitive data protection

## Best Practices

1. **Separation of Concerns** - Each layer has specific responsibility
2. **Error Handling** - Centralized error handling
3. **Logging** - Comprehensive logging at all levels
4. **Validation** - Input validation at route level
5. **Security** - Multiple security layers
6. **Scalability** - Connection pooling, async operations
7. **Maintainability** - Clear structure, documentation

## Extension Points

To add new features:

1. **New Model** - Add to `src/models/`
2. **New Controller** - Add to `src/controllers/`
3. **New Routes** - Add to `src/routes/`
4. **Register Routes** - Add to `src/routes/index.js`
5. **Add Permissions** - Update database and middleware

---

**This structure ensures maintainability, scalability, and testability.**

