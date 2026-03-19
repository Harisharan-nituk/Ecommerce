import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const SellerRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has seller role (Vendor/Seller or any role with "seller" in name)
  const isSeller = hasRole('Vendor/Seller') || 
                   hasRole('Seller') || 
                   hasRole('seller') ||
                   hasRole('Vendor');

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  // If a specific permission is required, check it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required permission: <strong>{requiredPermission}</strong></p>
      </div>
    );
  }

  return children;
};

export default SellerRoute;

