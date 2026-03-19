import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { getMenuConfig } from '../../config/menuConfig';
import { FiX, FiLogOut } from 'react-icons/fi';
import './RoleBasedSidebar.css';

const RoleBasedSidebar = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, hasRole, roles, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = hasRole('Super Admin') || hasRole('Admin');
  const isSeller = hasRole('Vendor/Seller') || 
                   hasRole('Seller') || 
                   hasRole('seller') || 
                   hasRole('Vendor') ||
                   hasRole('vendor');
  const isSuperAdmin = hasRole('Super Admin');

  // Get menu configuration based on user role
  const menuConfig = getMenuConfig(isAuthenticated, isAdmin, isSeller, isSuperAdmin);
  const { title: menuTitle, description: menuDescription, items: menuItems, sections: menuSections } = menuConfig;

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            className="role-based-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <div className="sidebar-title-section">
                <h2 className="sidebar-title">{menuTitle}</h2>
                {isAuthenticated && user && (
                  <div className="sidebar-user-info">
                    <p className="user-name">
                      Welcome, <strong>{user.first_name || user.full_name || 'User'}</strong>
                    </p>
                    {roles.length > 0 && (
                      <div className="user-roles">
                        {roles.map((role, idx) => (
                          <span key={idx} className="role-badge">{role}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                <FiX />
              </button>
            </div>

            <div className="sidebar-content">
              {menuSections.length > 0 ? (
                menuSections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="menu-section">
                    <h3 className="section-title">{section.title}</h3>
                    <nav className="menu-nav">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path || 
                                       location.pathname.startsWith(item.path + '/');
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${isActive ? 'active' : ''}`}
                            onClick={handleLinkClick}
                          >
                            <span className="menu-item-icon"><IconComponent /></span>
                            <span className="menu-item-label">{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))
              ) : (
                <nav className="menu-nav">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`menu-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                      >
                        <span className="menu-item-icon"><IconComponent /></span>
                        <span className="menu-item-label">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Logout Button */}
            {isAuthenticated && (
              <div className="sidebar-footer">
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <FiLogOut className="logout-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoleBasedSidebar;

