import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import TestRender from './components/TestRender/TestRender';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Auth/Login';
import LoginOTP from './pages/Auth/LoginOTP';
import Register from './pages/Auth/Register';
import Orders from './pages/Orders/Orders';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import Profile from './pages/Profile/Profile';
import Returns from './pages/Returns/Returns';
import Wishlist from './pages/Wishlist/Wishlist';
import Men from './pages/Shop/Men';
import Women from './pages/Shop/Women';
import Kids from './pages/Shop/Kids';
import HomeLiving from './pages/Shop/HomeLiving';
import Beauty from './pages/Shop/Beauty';
import Electronics from './pages/Shop/Electronics';
import AdminLayout from './components/AdminLayout/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard/Dashboard';
import AdminProducts from './pages/Admin/Products/Products';
import AdminOrders from './pages/Admin/Orders/Orders';
import AdminRoles from './pages/Admin/Roles/Roles';
import AdminUsers from './pages/Admin/Users/Users';
import AdminPayouts from './pages/Admin/Payouts/Payouts';
import AdminCommissionRules from './pages/Admin/CommissionRules/CommissionRules';
import AdminSellerWallets from './pages/Admin/SellerWallets/SellerWallets';
import AdminSellers from './pages/Admin/Sellers/Sellers';
import AdminInventory from './pages/Admin/Inventory/Inventory';
import AdminAnalytics from './pages/Admin/Analytics/Analytics';
import AdminSettings from './pages/Admin/Settings/Settings';
import AdminNotifications from './pages/Admin/Notifications/Notifications';
import AdminHelp from './pages/Admin/Help/Help';
import SellerDashboard from './pages/Seller/Dashboard/Dashboard';
import SellerProducts from './pages/Seller/Products/Products';
import ProductForm from './pages/Seller/Products/ProductForm';
import SellerOrders from './pages/Seller/Orders/Orders';
import SellerWallet from './pages/Seller/Wallet/Wallet';
import SellerEarningsReport from './pages/Seller/Reports/EarningsReport';
import SellerCommissionReport from './pages/Seller/Reports/CommissionReport';
import SellerPayoutReport from './pages/Seller/Reports/PayoutReport';
import AdminPayoutAnalytics from './pages/Admin/Reports/PayoutAnalytics';
import AdminCommissionReport from './pages/Admin/Reports/CommissionReport';
import CustomerWallet from './pages/Customer/Wallet/Wallet';
import SellerRegister from './pages/Seller/Register/Register';
import Contact from './pages/Contact/Contact';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import SellerRoute from './components/SellerRoute/SellerRoute';

function App() {
  let isAuthenticated = false;
  
  try {
    const authState = useAuthStore();
    isAuthenticated = authState.isAuthenticated;
  } catch (error) {
    console.error('Error accessing auth store:', error);
  }

  return (
    <ErrorBoundary>
      <Routes>
      {/* Test route - remove after debugging */}
      <Route path="/test" element={<TestRender />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="shop/men" element={<Men />} />
        <Route path="shop/women" element={<Women />} />
        <Route path="shop/kids" element={<Kids />} />
        <Route path="shop/home-living" element={<HomeLiving />} />
        <Route path="shop/beauty" element={<Beauty />} />
        <Route path="shop/electronics" element={<Electronics />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route 
          path="login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="login/otp" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginOTP />} 
        />
        <Route 
          path="register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />
        <Route 
          path="seller/register" 
          element={<SellerRegister />} 
        />
        
        {/* Protected Routes */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id/tracking"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes with Layout */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="payouts/analytics" element={<AdminPayoutAnalytics />} />
          <Route path="commissions/rules" element={<AdminCommissionRules />} />
          <Route path="commissions/report" element={<AdminCommissionReport />} />
          <Route path="wallets" element={<AdminSellerWallets />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="help" element={<AdminHelp />} />
        </Route>
        
        {/* Seller Routes */}
        <Route
          path="seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route
          path="seller/products"
          element={
            <SellerRoute>
              <SellerProducts />
            </SellerRoute>
          }
        />
        <Route
          path="seller/products/new"
          element={
            <SellerRoute>
              <ProductForm />
            </SellerRoute>
          }
        />
        <Route
          path="seller/products/:id/edit"
          element={
            <SellerRoute>
              <ProductForm />
            </SellerRoute>
          }
        />
        <Route
          path="seller/orders"
          element={
            <SellerRoute>
              <SellerOrders />
            </SellerRoute>
          }
        />
        <Route
          path="seller/wallet"
          element={
            <SellerRoute>
              <SellerWallet />
            </SellerRoute>
          }
        />
        <Route
          path="seller/reports/earnings"
          element={
            <SellerRoute>
              <SellerEarningsReport />
            </SellerRoute>
          }
        />
        <Route
          path="seller/reports/commissions"
          element={
            <SellerRoute>
              <SellerCommissionReport />
            </SellerRoute>
          }
        />
        <Route
          path="seller/reports/payouts"
          element={
            <SellerRoute>
              <SellerPayoutReport />
            </SellerRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute>
              <CustomerWallet />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
    </ErrorBoundary>
  );
}

export default App;

