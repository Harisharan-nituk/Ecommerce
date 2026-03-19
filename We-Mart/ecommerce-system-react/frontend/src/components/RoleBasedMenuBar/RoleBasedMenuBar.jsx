import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  FiShoppingBag,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiDollarSign,
  FiLayers,
  FiShield,
  FiHome
} from 'react-icons/fi';
import './RoleBasedMenuBar.css';

const RoleBasedMenuBar = () => {
  const { isAuthenticated, user, hasRole, roles } = useAuthStore();

  const isAdmin = hasRole('Super Admin') || hasRole('Admin');
  const isSeller = hasRole('Vendor/Seller') || 
                   hasRole('Seller') || 
                   hasRole('seller') || 
                   hasRole('Vendor') ||
                   hasRole('vendor');
  const isSuperAdmin = hasRole('Super Admin');

  // Guest/Public Menu Items
  const publicMenuItems = [
    { icon: <FiShoppingBag />, label: 'Products', path: '/products' },
    { icon: <FiHome />, label: 'Home', path: '/' }
  ];

  // Customer Menu Items
  const customerMenuItems = [
    { icon: <FiShoppingBag />, label: 'Products', path: '/products' },
    { icon: <FiShoppingCart />, label: 'Cart', path: '/cart' },
    { icon: <FiPackage />, label: 'My Orders', path: '/orders' },
    { icon: <FiCreditCard />, label: 'My Wallet', path: '/wallet' },
    { icon: <FiFileText />, label: 'Profile', path: '/profile' }
  ];

  // Seller Menu Items
  const sellerMenuItems = [
    { icon: <FiTrendingUp />, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: <FiPackage />, label: 'My Products', path: '/seller/products' },
    { icon: <FiFileText />, label: 'Orders', path: '/seller/orders' },
    { icon: <FiCreditCard />, label: 'Wallet', path: '/seller/wallet' },
    { icon: <FiBarChart2 />, label: 'Earnings', path: '/seller/reports/earnings' },
    { icon: <FiDollarSign />, label: 'Commissions', path: '/seller/reports/commissions' },
    { icon: <FiTrendingUp />, label: 'Payouts', path: '/seller/reports/payouts' }
  ];

  // Admin Menu Items
  const adminMenuItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <FiPackage />, label: 'Products', path: '/admin/products' },
    { icon: <FiFileText />, label: 'Orders', path: '/admin/orders' },
    { icon: <FiUsers />, label: 'Users', path: '/admin/users' },
    { icon: <FiUsers />, label: 'Sellers', path: '/admin/sellers' },
    { icon: <FiDollarSign />, label: 'Payouts', path: '/admin/payouts' },
    { icon: <FiCreditCard />, label: 'Wallets', path: '/admin/wallets' },
    { icon: <FiTrendingUp />, label: 'Commission Rules', path: '/admin/commissions/rules' },
    { icon: <FiBarChart2 />, label: 'Analytics', path: '/admin/payouts/analytics' },
    { icon: <FiBarChart2 />, label: 'Commission Report', path: '/admin/commissions/report' }
  ];

  // Super Admin Additional Items
  const superAdminMenuItems = [
    { icon: <FiShield />, label: 'Roles & Permissions', path: '/admin/roles' }
  ];

  // Determine which menu items to show
  let menuItems = [];
  let menuTitle = 'Quick Access';
  let menuDescription = 'Navigate to your key features';

  if (!isAuthenticated) {
    menuItems = publicMenuItems;
    menuTitle = 'Explore';
    menuDescription = 'Browse our products and services';
  } else if (isSuperAdmin) {
    menuItems = [...adminMenuItems, ...superAdminMenuItems];
    menuTitle = 'Admin Portal';
    menuDescription = 'Manage all aspects of the platform';
  } else if (isAdmin) {
    menuItems = adminMenuItems;
    menuTitle = 'Admin Portal';
    menuDescription = 'Manage platform operations';
  } else if (isSeller) {
    menuItems = [...customerMenuItems, ...sellerMenuItems];
    menuTitle = 'Seller Portal';
    menuDescription = 'Manage your store and track earnings';
  } else {
    menuItems = customerMenuItems;
    menuTitle = 'My Account';
    menuDescription = 'Access your shopping features';
  }

  return (
    <motion.section 
      className="role-based-menu-bar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="menu-header">
          <h2 className="menu-title">{menuTitle}</h2>
          <p className="menu-description">{menuDescription}</p>
          {isAuthenticated && user && (
            <div className="user-greeting">
              Welcome back, <strong>{user.first_name || user.full_name || 'User'}</strong>!
              {roles.length > 0 && (
                <span className="user-roles">
                  {roles.map((role, idx) => (
                    <span key={idx} className="role-badge">{role}</span>
                  ))}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link to={item.path} className="menu-item">
                <div className="menu-item-icon">{item.icon}</div>
                <div className="menu-item-label">{item.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default RoleBasedMenuBar;

