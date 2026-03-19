import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FiLayout,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiShield,
  FiDollarSign,
  FiSettings,
  FiTrendingUp,
  FiCreditCard,
  FiMenu,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();

  // Debug: Log if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('AdminLayout: User is not authenticated');
    }
    if (!user) {
      console.warn('AdminLayout: User data is missing');
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FiLayout,
      path: '/admin/dashboard',
      exact: true
    },
    {
      title: 'Manage',
      icon: FiSettings,
      children: [
        {
          title: 'Products',
          icon: FiPackage,
          path: '/admin/products'
        },
        {
          title: 'Orders',
          icon: FiShoppingBag,
          path: '/admin/orders'
        },
        {
          title: 'Users',
          icon: FiUsers,
          path: '/admin/users'
        },
        {
          title: 'Roles & Permissions',
          icon: FiShield,
          path: '/admin/roles'
        },
        {
          title: 'Sellers',
          icon: FiUsers,
          path: '/admin/sellers'
        },
        {
          title: 'Payouts',
          icon: FiDollarSign,
          path: '/admin/payouts'
        },
        {
          title: 'Commission Rules',
          icon: FiTrendingUp,
          path: '/admin/commissions/rules'
        },
        {
          title: 'Commission Report',
          icon: FiTrendingUp,
          path: '/admin/commissions/report'
        },
        {
          title: 'Payout Analytics',
          icon: FiDollarSign,
          path: '/admin/payouts/analytics'
        },
        {
          title: 'Seller Wallets',
          icon: FiCreditCard,
          path: '/admin/wallets'
        }
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isParentActive = (children) => {
    return children.some(child => location.pathname.startsWith(child.path));
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">Admin</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.children) {
              // Parent menu with children
              const parentActive = isParentActive(item.children);
              return (
                <div key={index} className={`nav-group ${parentActive ? 'active' : ''}`}>
                  <div className="nav-group-header">
                    <item.icon className="nav-icon" />
                    {sidebarOpen && <span className="nav-title">Manage</span>}
                  </div>
                  {sidebarOpen && (
                    <ul className="nav-group-items">
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link
                            to={child.path}
                            className={`nav-link ${isActive(child.path) ? 'active' : ''}`}
                          >
                            <child.icon className="nav-icon" />
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            } else {
              // Single menu item
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                >
                  <item.icon className="nav-icon" />
                  {sidebarOpen && <span>{item.title}</span>}
                </Link>
              );
            }
          })}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">
                {user?.first_name?.[0] || 'A'}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.first_name} {user?.last_name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {location.pathname === '/admin' || location.pathname === '/admin/' ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Loading Admin Dashboard...</h1>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

