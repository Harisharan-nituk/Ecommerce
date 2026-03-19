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
  FiShield,
  FiHome,
  FiBox,
  FiBell,
  FiPieChart,
  FiHelpCircle
} from 'react-icons/fi';

/**
 * Menu Configuration
 * Defines menu items for different user roles
 */
export const menuConfig = {
  // Public/Guest Menu
  public: [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiShoppingBag, label: 'Products', path: '/products' }
  ],

  // Customer Menu
  customer: [
    { icon: FiShoppingBag, label: 'Products', path: '/products' },
    { icon: FiShoppingCart, label: 'Cart', path: '/cart' },
    { icon: FiPackage, label: 'My Orders', path: '/orders' },
    { icon: FiCreditCard, label: 'My Wallet', path: '/wallet' },
    { icon: FiFileText, label: 'Profile', path: '/profile' }
  ],

  // Seller Menu Sections
  seller: {
    sections: [
      {
        title: 'Shopping',
        items: [
          { icon: FiShoppingBag, label: 'Products', path: '/products' },
          { icon: FiShoppingCart, label: 'Cart', path: '/cart' },
          { icon: FiPackage, label: 'My Orders', path: '/orders' },
          { icon: FiCreditCard, label: 'My Wallet', path: '/wallet' },
          { icon: FiFileText, label: 'Profile', path: '/profile' }
        ]
      },
      {
        title: 'Seller Portal',
        items: [
          { icon: FiTrendingUp, label: 'Dashboard', path: '/seller/dashboard' },
          { icon: FiPackage, label: 'My Products', path: '/seller/products' },
          { icon: FiFileText, label: 'Orders', path: '/seller/orders' },
          { icon: FiCreditCard, label: 'Wallet', path: '/seller/wallet' },
          { icon: FiBarChart2, label: 'Earnings', path: '/seller/reports/earnings' },
          { icon: FiDollarSign, label: 'Commissions', path: '/seller/reports/commissions' },
          { icon: FiTrendingUp, label: 'Payouts', path: '/seller/reports/payouts' }
        ]
      }
    ]
  },

  // Admin Menu Sections
  admin: {
    sections: [
      {
        title: 'Admin Portal',
        items: [
          { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: FiPieChart, label: 'Analytics', path: '/admin/analytics' },
          { icon: FiPackage, label: 'Products', path: '/admin/products' },
          { icon: FiBox, label: 'Inventory', path: '/admin/inventory' },
          { icon: FiFileText, label: 'Orders', path: '/admin/orders' },
          { icon: FiUsers, label: 'Users', path: '/admin/users' },
          { icon: FiUsers, label: 'Sellers', path: '/admin/sellers' },
          { icon: FiDollarSign, label: 'Payouts', path: '/admin/payouts' },
          { icon: FiCreditCard, label: 'Wallets', path: '/admin/wallets' },
          { icon: FiTrendingUp, label: 'Commission Rules', path: '/admin/commissions/rules' },
          { icon: FiBarChart2, label: 'Commission Report', path: '/admin/commissions/report' },
          { icon: FiBell, label: 'Notifications', path: '/admin/notifications' },
          { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
          { icon: FiHelpCircle, label: 'Help & Support', path: '/admin/help' }
        ]
      }
    ]
  },

  // Super Admin Additional Items
  superAdmin: {
    sections: [
      {
        title: 'Admin Portal',
        items: [
          { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: FiPieChart, label: 'Analytics', path: '/admin/analytics' },
          { icon: FiPackage, label: 'Products', path: '/admin/products' },
          { icon: FiBox, label: 'Inventory', path: '/admin/inventory' },
          { icon: FiFileText, label: 'Orders', path: '/admin/orders' },
          { icon: FiUsers, label: 'Users', path: '/admin/users' },
          { icon: FiUsers, label: 'Sellers', path: '/admin/sellers' },
          { icon: FiDollarSign, label: 'Payouts', path: '/admin/payouts' },
          { icon: FiCreditCard, label: 'Wallets', path: '/admin/wallets' },
          { icon: FiTrendingUp, label: 'Commission Rules', path: '/admin/commissions/rules' },
          { icon: FiBarChart2, label: 'Commission Report', path: '/admin/commissions/report' },
          { icon: FiBell, label: 'Notifications', path: '/admin/notifications' },
          { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
          { icon: FiHelpCircle, label: 'Help & Support', path: '/admin/help' },
          { icon: FiShield, label: 'Roles & Permissions', path: '/admin/roles' }
        ]
      }
    ]
  }
};

/**
 * Get menu configuration based on user role
 */
export const getMenuConfig = (isAuthenticated, isAdmin, isSeller, isSuperAdmin) => {
  if (!isAuthenticated) {
    return {
      title: 'Navigation',
      description: 'Browse our products and services',
      items: menuConfig.public,
      sections: null
    };
  }

  if (isSuperAdmin) {
    return {
      title: 'Super Admin Portal',
      description: 'Manage all aspects of the platform',
      items: null,
      sections: menuConfig.superAdmin.sections
    };
  }

  if (isAdmin) {
    return {
      title: 'Admin Portal',
      description: 'Manage platform operations',
      items: null,
      sections: menuConfig.admin.sections
    };
  }

  if (isSeller) {
    return {
      title: 'Seller Portal',
      description: 'Manage your store and track earnings',
      items: null,
      sections: menuConfig.seller.sections
    };
  }

  return {
    title: 'My Account',
    description: 'Access your shopping features',
    items: menuConfig.customer,
    sections: null
  };
};

