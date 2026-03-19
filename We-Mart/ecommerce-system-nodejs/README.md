# E-Commerce System - Node.js Implementation

Complete e-commerce system built with Node.js, Express, MySQL, and MongoDB. Features role-based access control (RBAC), JWT authentication, product management, shopping cart, orders, payments, seller portal, and comprehensive admin features.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) with granular permissions
- Password encryption (bcrypt)
- Account lockout protection
- Session management
- OTP verification with IP tracking
- Super Admin interface

### Product Management
- CRUD operations for products
- Hierarchical category management
- Stock tracking and inventory management
- Advanced search and filtering
- Product images and media management
- Commission rules for sellers

### Shopping Cart & Orders
- Add/update/remove cart items
- Cart persistence across sessions
- Real-time totals calculation
- Order creation and management
- Order status tracking
- Order history for users
- Admin order management
- Invoice generation

### Payment Integration
- Stripe integration
- PayPal (placeholder)
- Razorpay (placeholder)
- Cash on Delivery (COD)
- Payment webhooks
- Transaction logging

### Seller Portal
- Seller account management
- Product listing for sellers
- Order management for sellers
- Commission tracking
- Payout requests
- Seller wallet system
- Seller reports and analytics

### Admin Features
- Comprehensive admin dashboard
- User management
- Role and permission management
- Product and category management
- Order management
- Payment reconciliation
- Reports and analytics
- Payout management
- Customer wallet management

### Database
- MySQL for relational data (users, products, orders)
- MongoDB for logs, analytics, and document storage
- Dual database support with automatic failover
- Mongoose ORM for MongoDB
- Data encryption at rest

### Security
- Data encryption (AES-256-CBC)
- Rate limiting (DDoS protection)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Audit logging
- IP-based security

### Logging & Monitoring
- Winston logger
- Audit logs (MongoDB)
- API request/response logging
- Error tracking
- Performance monitoring

## 📁 Project Structure

```
ecommerce-system-nodejs/
├── src/
│   ├── config/              # Configuration files
│   │   ├── app.js          # App configuration
│   │   ├── database.js      # MySQL connection
│   │   └── mongoose.js      # MongoDB connection
│   ├── controllers/         # Request handlers
│   │   ├── AuthController.js
│   │   ├── ProductController.js
│   │   ├── CartController.js
│   │   ├── OrderController.js
│   │   ├── PaymentController.js
│   │   ├── SellerController.js
│   │   ├── RoleController.js
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── permissions.js  # RBAC permission checks
│   │   ├── errorHandler.js # Error handling
│   │   └── auditLog.js     # Audit logging
│   ├── models/             # Data access layer
│   │   ├── UserModel.js
│   │   ├── ProductModel.js
│   │   ├── CartModel.js
│   │   ├── OrderModel.js
│   │   └── mongoose/       # MongoDB models
│   ├── routes/             # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── seller.js
│   │   └── ...
│   ├── services/           # Business logic services
│   │   ├── CommissionCalculationService.js
│   │   ├── SellerWalletService.js
│   │   ├── CustomerWalletService.js
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── encryption.js
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── ipUtils.js
│   └── server.js           # Express app entry point
├── scripts/                 # Utility scripts
│   ├── create-super-admin.js
│   ├── seed-permissions.js
│   ├── seed-categories.js
│   └── ...
├── apigateway/            # API Gateway service
├── apigateway/            # API Gateway service
├── communication-system/   # Communication service
├── logs/                  # Application logs
├── .env.example           # Environment variables template
└── package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL 8.0+ (optional, for relational data)
- MongoDB (for logs and analytics)

### Quick Start

1. **Clone and navigate:**
   ```bash
   cd ecommerce-system-nodejs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see SETUP.md for details)

4. **Start server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📡 API Endpoints

**Base URL**: `http://localhost:3000/api/v1` (or port configured in `.env`)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `POST /auth/validate` - Validate token
- `POST /auth/refresh` - Refresh access token

### Products
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (requires permission)
- `PUT /products/:id` - Update product (requires permission)
- `DELETE /products/:id` - Delete product (requires permission)

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Cart
- `GET /cart` - Get user cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove from cart
- `DELETE /cart` - Clear cart

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order by ID
- `GET /orders/admin/all` - Get all orders (admin)
- `PUT /orders/:id/status` - Update order status

### Payments
- `POST /payments/process` - Process payment
- `POST /payments/webhook/stripe` - Stripe webhook
- `GET /payments/:id` - Get payment details

### Seller
- `POST /seller/apply` - Apply for seller account
- `GET /seller/products` - Get seller products
- `POST /seller/products` - Create seller product
- `GET /seller/orders` - Get seller orders
- `GET /seller/wallet` - Get seller wallet
- `POST /seller/payout/request` - Request payout

### Roles & Permissions
- `GET /roles` - Get all roles
- `POST /roles` - Create role (Super Admin only)
- `PUT /roles/:id` - Update role
- `GET /permissions` - Get all permissions
- `POST /roles/:id/permissions` - Assign permissions

### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Health Check
- `GET /health` - Check database connections

## 🔐 Authentication

All protected routes require JWT token in header:

```
x-auth-token: <your-jwt-token>
```

Or:

```
Authorization: Bearer <your-jwt-token>
```

### JWT Payload Structure

```json
{
  "userId": "user_id",
  "roles": ["Super Admin"],
  "permissions": ["user.create", "user.read", ...],
  "type": "access",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 🎭 Roles & Permissions

### Default Roles

- **Super Admin** - Full access to all features
- **Admin** - Store management, CMS, reports
- **Manager** - Inventory and orders
- **Customer** - Buy products
- **Vendor/Seller** - Manage own products
- **Support Staff** - Handle customer queries
- **Content Manager** - Manage website content
- **Finance Manager** - Payment reconciliation

### Permission System

Permissions are organized by modules:
- `user.*` - User management
- `product.*` - Product management
- `order.*` - Order management
- `payment.*` - Payment processing
- `seller.*` - Seller portal
- `admin.*` - Admin features

## 💳 Payment Integration

### Stripe
Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env` to enable Stripe payments.

### Other Payment Gateways
PayPal and Razorpay are placeholders - implement actual SDK integration as needed.

## 📊 Database

### MySQL Tables (Relational Data)
- `tbl_users` - User accounts
- `tbl_roles` - User roles
- `tbl_permissions` - System permissions
- `tbl_products` - Product catalog
- `tbl_categories` - Product categories
- `tbl_cart` - Shopping cart
- `tbl_orders` - Orders
- `tbl_order_items` - Order items
- And more...

### MongoDB Collections (Document Data)
- `users` - User accounts (MongoDB)
- `roles` - User roles
- `permissions` - System permissions
- `audit_logs` - User actions
- `api_logs` - API requests/responses
- `otp_logs` - OTP verification logs
- `seller_applications` - Seller account applications
- `seller_wallets` - Seller wallet transactions
- `customer_wallets` - Customer wallet transactions

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📝 Logging

Logs are written to:
- Console (development)
- `logs/app.log` (all logs)
- `logs/error.log` (errors only)
- MongoDB (audit logs)

## 🔧 Configuration

Edit `src/config/app.js` or environment variables for configuration. See SETUP.md for detailed configuration options.

## 🚨 Error Handling

All errors are handled by middleware and return JSON responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## 🔒 Security Features

1. **Helmet** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS protection
4. **JWT Authentication** - Token-based auth
5. **RBAC** - Permission checks
6. **Input Validation** - Data sanitization
7. **Encryption** - Sensitive data protection
8. **Audit Logging** - Track all actions

## 🚀 Production Deployment

### Build for Production

```bash
# Windows executable
npm run build:win

# All platforms
npm run build:all
```

### Environment Variables

Ensure all production environment variables are set:
- Use production database connections
- Set secure JWT secrets
- Configure CORS for production domain
- Set `NODE_ENV=production`
- Configure payment gateway keys

## 📚 Additional Resources

- [SETUP.md](./SETUP.md) - Detailed setup and configuration guide
- API Gateway documentation in `apigateway/README.md`
- Communication system documentation in `communication-system/README.md`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Database Connection Failed
- Check MySQL/MongoDB is running
- Verify credentials in `.env`
- Ensure database exists
- Check IP whitelist (MongoDB Atlas)

### Missing Dependencies
```bash
npm install
```

### Permission Errors
- Run `node scripts/seed-permissions.js`
- Create Super Admin: `node scripts/create-super-admin.js`

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js and Express**
