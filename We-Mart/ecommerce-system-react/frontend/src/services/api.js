import axios from 'axios';

// Direct connection to Node.js E-Commerce API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Connected to Node.js E-Commerce Backend
export const authAPI = {
  // Login with email + password
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  // Register (Signup)
  register: (userData) =>
    api.post('/auth/register', userData),
  
  // Logout
  logout: () =>
    api.post('/auth/logout'),
  
  // Get profile
  getProfile: () =>
    api.get('/auth/profile'),
  
  // Get permissions
  getPermissions: () =>
    api.get('/auth/permissions'),
};

// Products API
export const productsAPI = {
  getAll: (params) =>
    api.get('/products', { params }),
  
  getById: (id) =>
    api.get(`/products/${id}`),
  
  create: (data) =>
    api.post('/products', data),
  
  update: (id, data) =>
    api.put(`/products/${id}`, data),
  
  delete: (id) =>
    api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) =>
    api.get('/categories', { params }),
  
  getById: (id) =>
    api.get(`/categories/${id}`),
  
  create: (data) =>
    api.post('/categories', data),
  
  update: (id, data) =>
    api.put(`/categories/${id}`, data),
  
  delete: (id) =>
    api.delete(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  get: () =>
    api.get('/cart'),
  
  addItem: (data) =>
    api.post('/cart', data),
  
  updateItem: (id, quantity) =>
    api.put(`/cart/${id}`, { quantity }),
  
  removeItem: (id) =>
    api.delete(`/cart/${id}`),
  
  clear: () =>
    api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) =>
    api.post('/orders', data),
  
  getAll: (params) =>
    api.get('/orders', { params }),
  
  getById: (id) =>
    api.get(`/orders/${id}`),
  
  getAllAdmin: (params) =>
    api.get('/orders/admin/all', { params }),
  
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
  
  // Order Tracking
  getTracking: (id) =>
    api.get(`/orders/${id}/tracking`),
  
  addTrackingUpdate: (id, data) =>
    api.post(`/orders/${id}/tracking`, data),
};

// Payments API
export const paymentsAPI = {
  process: (data) =>
    api.post('/payments/process', data),
};

// Roles API
export const rolesAPI = {
  getAll: () =>
    api.get('/roles'),
  
  getById: (id) =>
    api.get(`/roles/${id}`),
  
  create: (data) =>
    api.post('/roles', data),
  
  update: (id, data) =>
    api.put(`/roles/${id}`, data),
  
  delete: (id) =>
    api.delete(`/roles/${id}`),
  
  assignPermissions: (roleId, permissions) =>
    api.post(`/roles/${roleId}/permissions`, { permissions }),
};

// Permissions API
export const permissionsAPI = {
  getAll: (params) =>
    api.get('/permissions', { params }),
  
  getById: (id) =>
    api.get(`/permissions/${id}`),
  
  create: (data) =>
    api.post('/permissions', data),
  
  update: (id, data) =>
    api.put(`/permissions/${id}`, data),
  
  delete: (id) =>
    api.delete(`/permissions/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (params) =>
    api.get('/users', { params }),
  
  getById: (id) =>
    api.get(`/users/${id}`),
  
  updateStatus: (id, status) =>
    api.put(`/users/${id}/status`, { status }),
  
  assignRole: (id, role_id) =>
    api.post(`/users/${id}/roles`, { role_id }),
  
  removeRole: (id, role_id) =>
    api.delete(`/users/${id}/roles`, { data: { role_id } }),
  
  updateUserRoles: (id, role_ids) =>
    api.put(`/users/${id}/roles`, { role_ids }),
  
  approveSellerApplication: (applicationId, roleId) =>
    api.post(`/users/seller-applications/${applicationId}/approve`, { role_id: roleId }),
  
  rejectSellerApplication: (applicationId, reason) =>
    api.post(`/users/seller-applications/${applicationId}/reject`, { reason }),
};

// Seller API
export const sellerAPI = {
  // Register as Seller
  registerAsSeller: (data) =>
    api.post('/seller/register', data),
  
  // Dashboard
  getDashboardStats: () =>
    api.get('/seller/dashboard'),
  
  // Products
  getMyProducts: (params) =>
    api.get('/seller/products', { params }),
  
  createProduct: (data) =>
    api.post('/seller/products', data),
  
  updateProduct: (id, data) =>
    api.put(`/seller/products/${id}`, data),
  
  deleteProduct: (id) =>
    api.delete(`/seller/products/${id}`),
  
  // Orders
  getMyOrders: (params) =>
    api.get('/seller/orders', { params }),
  
  updateOrderStatus: (id, status) =>
    api.put(`/seller/orders/${id}/status`, { status }),
  
  // Wallet
  getWallet: () =>
    api.get('/seller/account/wallet'),
  
  getAccount: () =>
    api.get('/seller/account'),
  
  getTransactions: () =>
    api.get('/seller/account/transactions'),
  
  updateBankDetails: (data) =>
    api.put('/seller/account/bank-details', data),
  
  updatePayoutSettings: (data) =>
    api.put('/seller/account/payout-settings', data),
  
  // Reports
  getEarningsReport: (params) =>
    api.get('/seller/reports/earnings', { params }),
  
  getCommissionReport: (params) =>
    api.get('/seller/reports/commissions', { params }),
  
  getPayoutReport: (params) =>
    api.get('/seller/reports/payouts', { params }),
};

// Admin API
export const adminAPI = {
  // Payouts
  getPendingPayouts: () =>
    api.get('/admin/payouts/pending'),
  
  getPayoutSummary: (params) =>
    api.get('/admin/payouts/summary', { params }),
  
  getPayoutAnalytics: (params) =>
    api.get('/admin/payouts/analytics', { params }),
  
  approvePayout: (id) =>
    api.post(`/admin/payouts/${id}/approve`),
  
  rejectPayout: (id, reason) =>
    api.post(`/admin/payouts/${id}/reject`, { reason }),
  
  processPayout: (id) =>
    api.post(`/admin/payouts/${id}/process`),
  
  // Reports
  getCommissionReport: (params) =>
    api.get('/admin/commissions/report', { params }),
  
  // Commission Rules
  getCommissionRules: () =>
    api.get('/admin/commissions/rules'),
  
  createCommissionRule: (data) =>
    api.post('/admin/commissions/rules', data),
  
  updateCommissionRule: (id, data) =>
    api.put(`/admin/commissions/rules/${id}`, data),
  
  deleteCommissionRule: (id) =>
    api.delete(`/admin/commissions/rules/${id}`),
};

// Customer API
export const customerAPI = {
  getWallet: () =>
    api.get('/customer/wallet'),
  
  getWalletSummary: () =>
    api.get('/customer/wallet/summary'),
  
  getWalletTransactions: (params) =>
    api.get('/customer/wallet/transactions', { params }),
  
  useWalletBalance: (data) =>
    api.post('/customer/wallet/use', data),
};

// Inventory API
export const inventoryAPI = {
  getSummary: () =>
    api.get('/inventory/summary'),
  
  getList: (params) =>
    api.get('/inventory', { params }),
  
  getLowStock: (threshold) =>
    api.get('/inventory/low-stock', { params: { threshold } }),
  
  getProductHistory: (productId, limit) =>
    api.get(`/inventory/product/${productId}/history`, { params: { limit } }),
  
  updateStock: (productId, data) =>
    api.put(`/inventory/product/${productId}/stock`, data),
  
  bulkUpdateStock: (updates) =>
    api.put('/inventory/bulk-update', { updates }),
};

// Return/Exchange API
export const returnsAPI = {
  createReturn: (data) =>
    api.post('/returns', data),
  
  getMyReturns: (params) =>
    api.get('/returns/my-returns', { params }),
  
  getReturn: (id) =>
    api.get(`/returns/${id}`),
  
  calculateRefund: (data) =>
    api.get('/returns/calculate-refund', { params: data }),
  
  cancelReturn: (id) =>
    api.put(`/returns/${id}/cancel`),
  
  // Admin
  getAllReturns: (params) =>
    api.get('/returns/admin/all', { params }),
  
  updateReturn: (id, data) =>
    api.put(`/returns/admin/${id}`, data),
};

// Review/Rating API
export const reviewsAPI = {
  createReview: (data) =>
    api.post('/reviews', data),
  
  getProductReviews: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  
  getProductRatingStats: (productId) =>
    api.get(`/reviews/product/${productId}/stats`),
  
  getUserReviews: (params) =>
    api.get('/reviews/user/my-reviews', { params }),
  
  getReview: (id) =>
    api.get(`/reviews/${id}`),
  
  updateReview: (id, data) =>
    api.put(`/reviews/${id}`, data),
  
  deleteReview: (id) =>
    api.delete(`/reviews/${id}`),
  
  markHelpful: (id) =>
    api.post(`/reviews/${id}/helpful`),
  
  // Admin
  moderateReview: (id, data) =>
    api.put(`/reviews/admin/${id}/moderate`, data),
};

// Brands API
export const brandsAPI = {
  getAll: (params) => api.get('/brands', { params }),
  getById: (id) => api.get(`/brands/${id}`),
  getBySlug: (slug) => api.get(`/brands/slug/${slug}`),
  getWithCount: (params) => api.get('/brands/with-count', { params }),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
};

// Upload API - For Supabase image uploads
export const uploadAPI = {
  // Upload single image
  uploadImage: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upload multiple images
  uploadMultipleImages: (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete image
  deleteImage: (filePath) => api.delete('/upload/image', { data: { filePath } }),
};

export default api;
