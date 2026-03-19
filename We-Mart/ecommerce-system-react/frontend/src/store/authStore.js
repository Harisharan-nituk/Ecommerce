import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],

      login: (userData, token, roles, permissions) => {
        set({
          user: userData,
          token,
          roles,
          permissions,
          isAuthenticated: true,
        });
        // Store token in localStorage for API calls
        localStorage.setItem('token', token);
      },

      // Fetch permissions from database based on roles
      fetchPermissions: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return null;

          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
          const response = await fetch(`${API_URL}/auth/permissions`, {
            headers: {
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({
                permissions: data.data.permissions,
                roles: data.data.roles,
              });
              return data.data;
            }
          }
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        }
        return null;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
        });
        localStorage.removeItem('token');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      hasPermission: (permission) => {
        const state = useAuthStore.getState();
        return (
          state.permissions.includes(permission) ||
          state.roles.includes('Super Admin')
        );
      },

      hasRole: (role) => {
        const state = useAuthStore.getState();
        return state.roles.includes(role);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAuthStore };

