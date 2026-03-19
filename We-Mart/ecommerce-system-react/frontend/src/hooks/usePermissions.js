import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

/**
 * Hook to fetch and refresh permissions from database
 * Permissions are loaded based on roles in JWT
 */
export const usePermissions = () => {
  const { token, isAuthenticated, fetchPermissions } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Fetch permissions on mount and when token changes
      fetchPermissions();
    }
  }, [isAuthenticated, token, fetchPermissions]);

  return {
    refreshPermissions: fetchPermissions,
  };
};

/**
 * Hook to check if user has permission
 */
export const useHasPermission = (permission) => {
  const { permissions, roles } = useAuthStore();
  
  // Super Admin has all permissions
  if (roles.includes('Super Admin')) {
    return true;
  }
  
  return permissions.includes(permission);
};

/**
 * Hook to check if user has any of the permissions
 */
export const useHasAnyPermission = (...requiredPermissions) => {
  const { permissions, roles } = useAuthStore();
  
  // Super Admin has all permissions
  if (roles.includes('Super Admin')) {
    return true;
  }
  
  return requiredPermissions.some(perm => permissions.includes(perm));
};

/**
 * Hook to check if user has role
 */
export const useHasRole = (role) => {
  const { roles } = useAuthStore();
  return roles.includes(role);
};

