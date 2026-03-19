# Setup & Configuration Guide

Complete guide for setting up and configuring the E-Commerce System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Initial Setup](#initial-setup)
6. [RBAC Setup](#rbac-setup)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** >= 16.0.0 (recommended: 18.x or 20.x)
- **npm** >= 8.0.0
- **MySQL** 8.0+ (for relational data)
- **MongoDB** (for logs, analytics, and document storage)

### Optional

- MongoDB Atlas account (cloud MongoDB)
- Stripe account (for payments)
- Git (for version control)

---

## Installation

### Step 1: Clone Repository

```bash
cd /path/to/project
# If using git:
git clone <repository-url>
cd ecommerce-system-nodejs
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js
- Mongoose (MongoDB ORM)
- MySQL2
- JWT
- Bcrypt
- Winston (logging)
- And more...

### Step 3: Install Missing Dependencies (if needed)

If you encounter missing module errors:

```bash
npm install mongoose-update-if-current
```

---

## Environment Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1

# MySQL Database (Optional - for relational data)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ecommerce_system

# MongoDB (Required - for logs and analytics)
MONGODB_ENABLED=true
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_ALGORITHM=aes-256-cbc

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:3001

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Super Admin (for initial setup)
SUPER_ADMIN_EMAIL=admin@ecommerce.com
SUPER_ADMIN_PASSWORD=Admin@123456
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com
```

### Important Notes

- **JWT_SECRET**: Generate a strong random string (use `openssl rand -base64 32`)
- **ENCRYPTION_KEY**: Must be exactly 32 characters
- **MONGODB_CONNECTION_STRING**: URL-encode special characters (e.g., `@` becomes `%40`)
- **CORS_ORIGIN**: Comma-separated list of allowed origins

---

## Database Setup

### MySQL Setup (Optional)

If using MySQL for relational data:

1. **Create Database:**
   ```sql
   CREATE DATABASE ecommerce_system;
   ```

2. **Import Schema (if available):**
   ```bash
   mysql -u root -p ecommerce_system < database/schema.sql
   ```

3. **Verify Connection:**
   Update `.env` with your MySQL credentials and test connection.

### MongoDB Setup

#### Option 1: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Whitelist your IP address
5. Update `MONGODB_CONNECTION_STRING` in `.env`

#### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/ecommerce_system`

#### Verify MongoDB Connection

The application will automatically connect to MongoDB on startup. Check logs for connection status.

---

## Initial Setup

### Step 1: Seed Permissions and Roles

Create system permissions and default roles:

```bash
node scripts/seed-permissions.js
```

This creates:
- All system permissions
- Default roles (Super Admin, Admin, Manager, Customer, Vendor, etc.)
- Role-permission assignments

### Step 2: Create Super Admin

Create the initial Super Admin user:

```bash
node scripts/create-super-admin.js
```

This creates:
- Super Admin user with email/password from `.env`
- Super Admin role (if not exists)
- Assigns all permissions to Super Admin

### Step 3: Seed Categories (Optional)

Create default product categories:

```bash
node scripts/seed-categories.js
```

---

## RBAC Setup

### Understanding RBAC

The system uses Role-Based Access Control (RBAC) with:

1. **Roles**: Groups of users (Super Admin, Admin, Customer, etc.)
2. **Permissions**: Granular actions (user.create, product.delete, etc.)
3. **Role-Permission Mapping**: Which permissions each role has

### Default Roles

- **Super Admin**: All permissions
- **Admin**: Store management, reports, user management
- **Manager**: Inventory, orders, sales reports
- **Customer**: Browse, purchase, manage account
- **Vendor/Seller**: Manage own products and orders
- **Support Staff**: Handle customer queries
- **Content Manager**: Website content and SEO
- **Finance Manager**: Payment reconciliation

### Managing Roles and Permissions

#### Via API (Super Admin only)

```bash
# Get all roles
curl -H "x-auth-token: YOUR_TOKEN" http://localhost:3000/api/v1/roles

# Create new role
curl -X POST -H "x-auth-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Role", "description": "Description"}' \
  http://localhost:3000/api/v1/roles

# Assign permissions to role
curl -X POST -H "x-auth-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds": ["perm1", "perm2"]}' \
  http://localhost:3000/api/v1/roles/:roleId/permissions
```

#### Via Database

You can also manage roles and permissions directly in the database.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Uses `nodemon` for auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Build Executable (Windows)

```bash
npm run build:win
```

Creates standalone executable in `dist/` folder.

### Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:3000/api/v1/health

# Check homepage
curl http://localhost:3000/
```

Expected output:
- Server running on port 3000 (or configured port)
- Database connections successful
- API endpoints accessible

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Database Connection Failed

**MySQL Error**:
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE ecommerce_system;`

**MongoDB Error**:
- Check connection string format
- Verify IP is whitelisted (MongoDB Atlas)
- Test connection: `mongosh "your-connection-string"`
- Set `MONGODB_ENABLED=false` to disable MongoDB features

### Missing Dependencies

**Error**: `Cannot find module 'module-name'`

**Solution**:
```bash
npm install
# Or install specific module
npm install module-name
```

### Permission Errors

**Error**: "Permission denied" or "Insufficient permissions"

**Solution**:
1. Ensure you're logged in as Super Admin
2. Run seed script: `node scripts/seed-permissions.js`
3. Create Super Admin: `node scripts/create-super-admin.js`
4. Check JWT token includes required permissions

### JWT Token Issues

**Error**: "Invalid token" or "Token expired"

**Solution**:
- Login again to get new token
- Check `JWT_SECRET` in `.env` matches
- Verify token format in request header
- Check token expiration time

### File Upload Issues

**Error**: "File upload failed"

**Solution**:
- Check `UPLOAD_DIR` exists and is writable
- Verify file size within `MAX_FILE_SIZE` limit
- Check file type is in `ALLOWED_FILE_TYPES`
- Ensure sufficient disk space

### Logs Not Writing

**Error**: No log files created

**Solution**:
```bash
# Create logs directory
mkdir -p logs

# Check write permissions
chmod 755 logs
```

---

## Next Steps

After successful setup:

1. **Login as Super Admin**
   - Use credentials from `.env` (SUPER_ADMIN_EMAIL/SUPER_ADMIN_PASSWORD)
   - Or create via script: `node scripts/create-super-admin.js`

2. **Create Additional Users**
   - Via API: `POST /api/v1/auth/register`
   - Or via admin interface

3. **Configure Payment Gateways**
   - Add Stripe keys for payment processing
   - Configure webhooks for payment callbacks

4. **Set Up Categories and Products**
   - Create product categories
   - Add products to catalog

5. **Test API Endpoints**
   - Use Postman or curl
   - Test authentication flow
   - Test CRUD operations

---

## Additional Configuration

### Email Configuration (Optional)

For email notifications:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com
```

### Stripe Configuration

For payment processing:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Rate Limiting

Adjust rate limiting:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max requests per window
```

---

## Support

For additional help:
- Check application logs: `logs/app.log` and `logs/error.log`
- Review API documentation in README.md
- Check GitHub issues
- Contact support team

---

**Setup Complete! 🎉**

Your e-commerce system is now ready to use.
