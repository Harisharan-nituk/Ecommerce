import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useHasPermission } from '../../../hooks/usePermissions';
import Loading from '../../../components/Loading/Loading';
import './Dashboard.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const canViewReports = useHasPermission('vendor.report.own_sales');
  const canManageProducts = useHasPermission('vendor.product.manage_own');
  const canManageOrders = useHasPermission('vendor.order.manage_own');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDashboardStats();
  }, [isAuthenticated, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <p>Welcome to your seller portal</p>
      </div>

      <div className="stats-grid">
        {/* Products Stats */}
        <div className="stat-card products">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Products</h3>
            <div className="stat-numbers">
              <div className="stat-main">{stats.products?.total || 0}</div>
              <div className="stat-details">
                <span className="active">{stats.products?.active || 0} Active</span>
                <span className="low-stock">{stats.products?.lowStock || 0} Low Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Stats */}
        <div className="stat-card orders">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Orders</h3>
            <div className="stat-numbers">
              <div className="stat-main">{stats.orders?.total || 0}</div>
              <div className="stat-details">
                <span className="pending">{stats.orders?.pending || 0} Pending</span>
                <span className="processing">{stats.orders?.processing || 0} Processing</span>
                <span className="completed">{stats.orders?.completed || 0} Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <div className="stat-numbers">
              <div className="stat-main">
                ₹{(stats.revenue?.total || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="stat-details">
                <span>Total Earnings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card - Clickable */}
        <div 
          className="stat-card wallet" 
          onClick={() => navigate('/seller/wallet')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>Wallet Balance</h3>
            <div className="stat-numbers">
              <div className="stat-main">
                ₹{(stats.wallet?.available_balance || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="stat-details">
                <span className="available">Available</span>
                {stats.wallet?.pending_balance > 0 && (
                  <span className="pending">₹{stats.wallet.pending_balance.toFixed(2)} Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!canViewReports && (
        <div className="error-message" style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
          ⚠️ You don't have permission to view sales reports. Please contact admin.
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          {canManageProducts && (
            <>
              <button
                className="action-btn primary"
                onClick={() => navigate('/seller/products/new')}
              >
                ➕ Add New Product
              </button>
              <button
                className="action-btn"
                onClick={() => navigate('/seller/products')}
              >
                📦 Manage Products
              </button>
            </>
          )}
          {canManageOrders && (
            <button
              className="action-btn"
              onClick={() => navigate('/seller/orders')}
            >
              📋 View Orders
            </button>
          )}
          <button
            className="action-btn wallet-btn"
            onClick={() => navigate('/seller/wallet')}
          >
            💰 My Wallet
          </button>
          <button
            className="action-btn reports-btn"
            onClick={() => navigate('/seller/reports/earnings')}
          >
            📊 Reports
          </button>
          {!canManageProducts && !canManageOrders && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No actions available. Please contact admin to assign permissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

