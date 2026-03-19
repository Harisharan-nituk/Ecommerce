import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI, productsAPI, inventoryAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'analytics-orders',
    () => ordersAPI.getAllAdmin({ limit: 100 })
  );

  const { data: productsData, isLoading: productsLoading } = useQuery(
    'analytics-products',
    () => productsAPI.getAll({ limit: 100 })
  );

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery(
    'analytics-inventory',
    () => inventoryAPI.getSummary()
  );

  if (ordersLoading || productsLoading || inventoryLoading) {
    return <Loading message="Loading analytics..." />;
  }

  const orders = ordersData?.data?.data || [];
  const products = productsData?.data?.data || [];
  const inventory = inventoryData?.data?.data || {};

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount || order.totalAmount || 0));
  }, 0);

  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const conversionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;

  // Status distribution
  const statusDistribution = {
    delivered: orders.filter(o => o.status === 'delivered').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      change: '+12.5%',
      trend: 'up',
      icon: FiDollarSign,
      color: 'success',
      gradient: 'gradient-success'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      change: '+8.2%',
      trend: 'up',
      icon: FiShoppingCart,
      color: 'primary',
      gradient: 'gradient-primary'
    },
    {
      title: 'Total Products',
      value: products.length,
      change: '+5.1%',
      trend: 'up',
      icon: FiPackage,
      color: 'info',
      gradient: 'gradient-info'
    },
    {
      title: 'Avg Order Value',
      value: `₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      change: '+3.7%',
      trend: 'up',
      icon: FiTrendingUp,
      color: 'purple',
      gradient: 'gradient-purple'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up',
      icon: FiBarChart2,
      color: 'pink',
      gradient: 'gradient-pink'
    },
    {
      title: 'Inventory Value',
      value: `₹${(inventory.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      change: '0%',
      trend: 'neutral',
      icon: FiPieChart,
      color: 'warning',
      gradient: 'gradient-warning'
    }
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="subtitle">Track your business performance and insights</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-analytics">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card-analytics ${stat.gradient}`}>
              <div className="stat-card-content">
                <div className="stat-icon-wrapper">
                  <Icon className="stat-icon" />
                </div>
                <div className="stat-info">
                  <p className="stat-label">{stat.title}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <div className={`stat-change ${stat.trend}`}>
                    {stat.trend === 'up' && <FiTrendingUp />}
                    {stat.trend === 'down' && <FiTrendingDown />}
                    <span>{stat.change}</span>
                    <span className="stat-period">vs last period</span>
                  </div>
                </div>
              </div>
              <div className="stat-card-glow"></div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Order Status Distribution</h3>
            <FiPieChart className="chart-icon" />
          </div>
          <div className="chart-content">
            <div className="status-chart">
              {Object.entries(statusDistribution).map(([status, count]) => {
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                const colors = {
                  delivered: 'var(--success)',
                  processing: 'var(--info)',
                  shipped: 'var(--primary)',
                  pending: 'var(--warning)',
                  cancelled: 'var(--danger)'
                };
                return (
                  <div key={status} className="status-item">
                    <div className="status-bar-wrapper">
                      <div 
                        className="status-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[status]
                        }}
                      />
                    </div>
                    <div className="status-info">
                      <span className="status-name">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      <span className="status-count">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Quick Insights</h3>
            <FiBarChart2 className="chart-icon" />
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon success">✓</div>
              <div className="insight-content">
                <p className="insight-title">Completed Orders</p>
                <p className="insight-value">{completedOrders}</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon warning">⏳</div>
              <div className="insight-content">
                <p className="insight-title">Pending Orders</p>
                <p className="insight-value">{pendingOrders}</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon danger">✗</div>
              <div className="insight-content">
                <p className="insight-title">Cancelled Orders</p>
                <p className="insight-value">{cancelledOrders}</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon info">📦</div>
              <div className="insight-content">
                <p className="insight-title">Low Stock Items</p>
                <p className="insight-value">{inventory.lowStock || 0}</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon danger">⚠️</div>
              <div className="insight-content">
                <p className="insight-title">Out of Stock</p>
                <p className="insight-value">{inventory.outOfStock || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-card">
        <h3>Recent Orders Summary</h3>
        <div className="activity-list">
          {orders.slice(0, 5).map((order, index) => (
            <div key={order._id || order.id || index} className="activity-item">
              <div className="activity-icon">
                <FiShoppingCart />
              </div>
              <div className="activity-content">
                <p className="activity-title">Order #{order._id || order.id}</p>
                <p className="activity-details">
                  ₹{(order.total_amount || order.totalAmount || 0).toLocaleString('en-IN')} • {order.status}
                </p>
              </div>
              <div className="activity-badge">
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
