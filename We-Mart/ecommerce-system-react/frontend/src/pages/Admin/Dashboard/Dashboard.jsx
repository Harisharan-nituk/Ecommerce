import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI, inventoryAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiBox,
  FiBarChart2,
  FiBell
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery(
    'admin-orders',
    () => ordersAPI.getAllAdmin({ limit: 10 }),
    { retry: false, refetchOnWindowFocus: false }
  );
  
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery(
    'admin-products',
    () => productsAPI.getAll({ limit: 10 }),
    { retry: false, refetchOnWindowFocus: false }
  );

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery(
    'admin-inventory-summary',
    () => inventoryAPI.getSummary()
  );

  if (ordersLoading || productsLoading || inventoryLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  const orders = ordersData?.data?.data || [];
  const products = productsData?.data?.data || [];
  const inventory = inventoryData?.data?.data || {};

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount || order.totalAmount || 0));
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const lowStockItems = inventory.lowStock || 0;
  const outOfStockItems = inventory.outOfStock || 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: FiDollarSign,
      color: 'success',
      gradient: 'gradient-success',
      link: '/admin/analytics',
      change: '+12.5%'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: FiShoppingCart,
      color: 'primary',
      gradient: 'gradient-primary',
      link: '/admin/orders',
      change: '+8.2%'
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: FiPackage,
      color: 'info',
      gradient: 'gradient-info',
      link: '/admin/products',
      change: '+5.1%'
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems,
      icon: FiBox,
      color: 'warning',
      gradient: 'gradient-warning',
      link: '/admin/inventory',
      change: 'Action needed'
    }
  ];

  const quickActions = [
    { icon: FiPackage, label: 'Add Product', path: '/admin/products', color: 'primary' },
    { icon: FiShoppingCart, label: 'View Orders', path: '/admin/orders', color: 'info' },
    { icon: FiBox, label: 'Manage Inventory', path: '/admin/inventory', color: 'warning' },
    { icon: FiBarChart2, label: 'View Analytics', path: '/admin/analytics', color: 'purple' },
    { icon: FiUsers, label: 'Manage Users', path: '/admin/users', color: 'success' },
    { icon: FiBell, label: 'Notifications', path: '/admin/notifications', color: 'pink' }
  ];

  return (
    <div className="admin-dashboard-enhanced">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/analytics" className="btn btn-secondary">
            <FiBarChart2 /> View Analytics
          </Link>
        </div>
      </div>

      {(ordersError || productsError) && (
        <div className="error-banner">
          <p>⚠️ Note: Some data may not be available. API connection issues detected.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid-enhanced">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link} className="stat-card-enhanced">
              <div className={`stat-card-inner ${stat.gradient}`}>
                <div className="stat-icon-wrapper">
                  <Icon className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{stat.title}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <div className="stat-change">
                    <FiTrendingUp />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="stat-arrow">
                  <FiArrowRight />
                </div>
              </div>
              <div className="stat-glow"></div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.path} className="quick-action-card">
                <div className={`action-icon ${action.color}`}>
                  <Icon />
                </div>
                <span className="action-label">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-grid">
        <div className="recent-orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="orders-list">
            {orders.slice(0, 5).length === 0 ? (
              <p className="empty-message">No recent orders</p>
            ) : (
              orders.slice(0, 5).map((order, index) => (
                <div key={order._id || order.id || index} className="order-item">
                  <div className="order-info">
                    <p className="order-id">Order #{order._id || order.id}</p>
                    <p className="order-amount">
                      ₹{(order.total_amount || order.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="inventory-alerts-card">
          <div className="card-header">
            <h3>Inventory Alerts</h3>
            <Link to="/admin/inventory" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="alerts-list">
            {lowStockItems > 0 && (
              <div className="alert-item warning">
                <FiBox />
                <div>
                  <p className="alert-title">Low Stock Items</p>
                  <p className="alert-count">{lowStockItems} products need attention</p>
                </div>
              </div>
            )}
            {outOfStockItems > 0 && (
              <div className="alert-item danger">
                <FiPackage />
                <div>
                  <p className="alert-title">Out of Stock</p>
                  <p className="alert-count">{outOfStockItems} products are out of stock</p>
                </div>
              </div>
            )}
            {lowStockItems === 0 && outOfStockItems === 0 && (
              <p className="empty-message">All inventory levels are good! ✅</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
