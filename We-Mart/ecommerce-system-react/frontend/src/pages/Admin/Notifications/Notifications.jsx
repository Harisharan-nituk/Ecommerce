import React, { useState } from 'react';
import { 
  FiBell, 
  FiCheck, 
  FiX, 
  FiTrash2,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #12345 has been placed by John Doe',
      time: '2 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Product "Laptop Pro" is running low (5 items left)',
      time: '15 minutes ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹15,999 received for Order #12344',
      time: '1 hour ago',
      read: true,
      priority: 'high'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update Available',
      message: 'A new system update is available. Update now?',
      time: '2 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'order',
      title: 'Order Shipped',
      message: 'Order #12343 has been shipped to customer',
      time: '3 hours ago',
      read: true,
      priority: 'medium'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'inventory': return '📊';
      case 'payment': return '💳';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--info)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            <FiCheck /> Mark All Read
          </button>
        </div>
      </div>

      <div className="notifications-container">
        <div className="notifications-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button
                className={`filter-btn ${filter === 'order' ? 'active' : ''}`}
                onClick={() => setFilter('order')}
              >
                Orders ({notifications.filter(n => n.type === 'order').length})
              </button>
              <button
                className={`filter-btn ${filter === 'inventory' ? 'active' : ''}`}
                onClick={() => setFilter('inventory')}
              >
                Inventory ({notifications.filter(n => n.type === 'inventory').length})
              </button>
              <button
                className={`filter-btn ${filter === 'payment' ? 'active' : ''}`}
                onClick={() => setFilter('payment')}
              >
                Payments ({notifications.filter(n => n.type === 'payment').length})
              </button>
              <button
                className={`filter-btn ${filter === 'system' ? 'active' : ''}`}
                onClick={() => setFilter('system')}
              >
                System ({notifications.filter(n => n.type === 'system').length})
              </button>
            </div>
          </div>

          <div className="stats-section">
            <h3>Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{notifications.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unread</span>
              <span className="stat-value unread">{unreadCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Read</span>
              <span className="stat-value">{notifications.length - unreadCount}</span>
            </div>
          </div>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FiBell className="empty-icon" />
              <h3>No notifications</h3>
              <p>You're all caught up! No notifications to display.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-icon" style={{ backgroundColor: getPriorityColor(notification.priority) + '20' }}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-btn"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
