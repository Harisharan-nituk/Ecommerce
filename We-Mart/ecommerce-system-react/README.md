# E-Commerce System - React Frontend

Modern React frontend for the E-Commerce System built with React 18, Vite, Zustand, and React Query. Features authentication, product management, shopping cart, orders, admin dashboard, and seller portal.

## 🚀 Features

### Core Features
- **Authentication** - Login, Register, OTP verification with JWT tokens
- **Product Browsing** - Product listing, search, filters, detailed product views
- **Shopping Cart** - Add/remove items, quantity management, cart persistence
- **Checkout** - Order placement with payment integration
- **Order Management** - View order history, track orders, order status
- **User Profile** - Manage user information and preferences
- **Customer Wallet** - Wallet balance and transactions

### Admin Features
- **Admin Dashboard** - Statistics, analytics, and overview
- **Product Management** - Full CRUD operations for products
- **Order Management** - View and manage all orders
- **User Management** - Manage users and roles
- **Role & Permission Management** - RBAC system
- **Seller Management** - Manage seller accounts
- **Commission Rules** - Configure commission rates
- **Payout Management** - Handle seller payouts
- **Reports & Analytics** - Sales, commission, and payout reports

### Seller Features
- **Seller Dashboard** - Seller statistics and overview
- **Product Management** - Add, edit, delete own products
- **Order Management** - View and manage seller orders
- **Seller Wallet** - Track earnings and balance
- **Payout Requests** - Request payouts
- **Seller Reports** - Earnings, commission, and payout reports
- **Seller Registration** - Apply to become a seller

### UI/UX Features
- **Responsive Design** - Mobile-first, works on all devices
- **Modern UI** - Beautiful gradients, animations, and transitions
- **Loading States** - Spinners and skeleton loaders
- **Error Handling** - Error boundaries and user-friendly messages
- **Toast Notifications** - Success/error notifications
- **Empty States** - Helpful messages when no data
- **Protected Routes** - Authentication and role-based access
- **Role-Based Menu** - Dynamic navigation based on user role

## 📁 Project Structure

```
ecommerce-system-react/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Layout/          # Main layout wrapper
│   │   ├── Navbar/          # Navigation bar with cart badge
│   │   ├── Footer/          # Footer component
│   │   ├── ProductCard/     # Product card component
│   │   ├── Loading/         # Loading spinner component
│   │   ├── EmptyState/      # Empty state component
│   │   ├── ErrorBoundary/   # Error boundary component
│   │   ├── ProtectedRoute/   # Route protection
│   │   ├── AdminRoute/      # Admin route protection
│   │   ├── SellerRoute/     # Seller route protection
│   │   ├── RoleBasedMenuBar/ # Role-based navigation
│   │   └── RoleBasedSidebar/ # Role-based sidebar
│   ├── pages/               # Page components
│   │   ├── Home/           # Homepage with featured products
│   │   ├── Products/       # Product listing with search
│   │   ├── ProductDetail/  # Product detail page
│   │   ├── Cart/           # Shopping cart
│   │   ├── Checkout/       # Checkout process
│   │   ├── Auth/           # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── LoginOTP.jsx
│   │   ├── Orders/         # Order history
│   │   ├── Profile/        # User profile
│   │   ├── Customer/       # Customer pages
│   │   │   └── Wallet/     # Customer wallet
│   │   ├── Seller/         # Seller portal pages
│   │   │   ├── Dashboard/
│   │   │   ├── Products/
│   │   │   ├── Orders/
│   │   │   ├── Wallet/
│   │   │   ├── Reports/
│   │   │   └── Register/
│   │   └── Admin/          # Admin dashboard pages
│   │       ├── Dashboard/
│   │       ├── Products/
│   │       ├── Orders/
│   │       ├── Users/
│   │       ├── Roles/
│   │       ├── Sellers/
│   │       ├── Payouts/
│   │       ├── Reports/
│   │       └── CommissionRules/
│   ├── store/              # Zustand stores
│   │   ├── authStore.js    # Authentication state
│   │   └── cartStore.js    # Shopping cart state
│   ├── services/           # API services
│   │   └── api.js          # Axios API client
│   ├── hooks/              # Custom React hooks
│   │   └── usePermissions.js
│   ├── config/             # Configuration
│   │   └── menuConfig.js   # Menu configuration
│   ├── App.jsx             # Main app component with routes
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Installation

### Prerequisites
- **Node.js** >= 16.0.0 (recommended: 18.x or 20.x)
- **npm** >= 8.0.0
- **Backend API** running on `http://localhost:3001` (ecommerce-system-nodejs)

### Quick Start

1. **Install dependencies:**
   ```bash
   cd ecommerce-system-react
   npm install
   ```

2. **Configure environment (optional):**
   ```bash
   # Create .env file if needed
   echo "VITE_API_URL=http://localhost:3001/api/v1" > .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/v1

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📡 API Integration

The frontend connects directly to the Node.js backend API.

### API Configuration

**Default API URL**: `http://localhost:3001/api/v1`

Configure via environment variable:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### Authentication

All API requests automatically include JWT token from localStorage:
- Token stored in `localStorage.getItem('token')`
- Added to headers: `x-auth-token` and `Authorization: Bearer <token>`

### API Endpoints Used

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `POST /auth/validate` - Validate token

#### Products
- `GET /products` - List products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin/seller)
- `PUT /products/:id` - Update product (admin/seller)
- `DELETE /products/:id` - Delete product (admin/seller)

#### Cart
- `GET /cart` - Get user cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove from cart

#### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `GET /orders/admin/all` - Get all orders (admin)

#### Seller
- `POST /seller/apply` - Apply for seller account
- `GET /seller/products` - Get seller products
- `POST /seller/products` - Create seller product
- `GET /seller/orders` - Get seller orders
- `GET /seller/wallet` - Get seller wallet
- `POST /seller/payout/request` - Request payout

#### Admin
- `GET /users` - Get all users
- `GET /roles` - Get all roles
- `GET /permissions` - Get all permissions
- `GET /seller/applications` - Get seller applications
- `GET /admin/payouts` - Get all payouts

## 🔐 Authentication Flow

1. **Login/Register** → Token received from API
2. **Token Storage** → Saved in Zustand store + localStorage
3. **Auto-Auth** → Token automatically added to all API requests via axios interceptor
4. **Protected Routes** → Check authentication status before rendering
5. **Role-Based Access** → Check user roles for admin/seller routes
6. **Token Refresh** → Handle token expiration and refresh

## 🎨 State Management

### Zustand Stores

#### Auth Store (`store/authStore.js`)
- User information
- Authentication status
- User roles and permissions
- Login/logout functions
- Token management

#### Cart Store (`store/cartStore.js`)
- Cart items
- Cart total
- Add/remove/update functions
- Cart persistence (localStorage)

### React Query

Used for server state management:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

## 🛡️ Route Protection

### Protected Routes
- `/cart` - Requires authentication
- `/checkout` - Requires authentication
- `/orders` - Requires authentication
- `/profile` - Requires authentication

### Admin Routes
- `/admin/*` - Requires admin role
- Protected by `AdminRoute` component

### Seller Routes
- `/seller/*` - Requires seller role
- Protected by `SellerRoute` component

## 🎨 Styling

- **CSS Modules** - Component-scoped styles
- **CSS Variables** - Theming support
- **Responsive Design** - Mobile-first approach
- **Modern UI** - Gradients, shadows, animations
- **Icons** - React Icons library
- **Animations** - Framer Motion for smooth transitions

## 📦 Build for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

Output will be in the `dist/` directory.

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔧 Configuration

### Vite Configuration (`vite.config.js`)

- **Port**: 5173 (default)
- **Proxy**: Configured for API Gateway (optional)
- **Build**: Output to `dist/` directory

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 5174
}
```

### API Connection Failed
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors
- Verify backend CORS allows `http://localhost:5173`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues
- Check token in localStorage
- Verify token format in browser console
- Check backend JWT_SECRET matches
- Clear localStorage and login again

## 📚 Key Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Framer Motion** - Animations
- **React Icons** - Icon library

## 🚀 Features by Role

### Customer
- Browse products
- Search and filter
- Add to cart
- Checkout
- View orders
- Manage profile
- Wallet management

### Seller
- Seller dashboard
- Product management
- Order management
- Wallet and earnings
- Payout requests
- Reports and analytics

### Admin
- Admin dashboard
- User management
- Product management
- Order management
- Seller management
- Role & permission management
- Commission rules
- Payout management
- Reports and analytics

## 📝 Next Steps

1. ✅ Basic structure created
2. ✅ All pages implemented
3. ✅ Authentication working
4. ✅ Cart functionality
5. ✅ Admin dashboard
6. ✅ Seller portal
7. ⏭️ Add more features (wishlist, reviews, etc.)
8. ⏭️ Add tests
9. ⏭️ Optimize performance
10. ⏭️ Add PWA support

## 🔗 Integration

This frontend is designed to work with:
- **Backend**: ecommerce-system-nodejs (Node.js + Express)
- **API**: RESTful API on port 3001
- **Authentication**: JWT tokens
- **Database**: MySQL + MongoDB (handled by backend)

---

**Built with React 18 + Vite + Zustand + React Query**

For detailed setup instructions, see [SETUP.md](./SETUP.md)
