import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useHasPermission } from '../../../hooks/usePermissions';
import Loading from '../../../components/Loading/Loading';
import { toast } from 'react-toastify';
import './Orders.css';

const SellerOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const canManageOrders = useHasPermission('vendor.order.manage_own');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getMyOrders();
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
      console.error('Orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await sellerAPI.updateOrderStatus(orderId, newStatus);
      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#e65100',
      processing: '#1565c0',
      shipped: '#7b1fa2',
      delivered: '#2e7d32',
      cancelled: '#c62828',
    };
    return colors[status] || '#666';
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  if (!canManageOrders) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to manage orders.</p>
        <p>Required permission: <strong>vendor.order.manage_own</strong></p>
        <p>Please contact admin to assign this permission.</p>
      </div>
    );
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="status-filters">
          <button
            className={statusFilter === 'all' ? 'active' : ''}
            onClick={() => setStatusFilter('all')}
          >
            All ({orders.length})
          </button>
          <button
            className={statusFilter === 'pending' ? 'active' : ''}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={statusFilter === 'processing' ? 'active' : ''}
            onClick={() => setStatusFilter('processing')}
          >
            Processing
          </button>
          <button
            className={statusFilter === 'shipped' ? 'active' : ''}
            onClick={() => setStatusFilter('shipped')}
          >
            Shipped
          </button>
          <button
            className={statusFilter === 'delivered' ? 'active' : ''}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No orders found</h2>
          <p>{statusFilter === 'all' ? 'You don\'t have any orders yet.' : `No ${statusFilter} orders.`}</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id || order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id || order._id}</h3>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items && order.items.length > 0 ? (
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        <span className="item-name">{item.product_id?.name || 'Product'}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items found</p>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ${order.total_amount?.toFixed(2) || '0.00'}</strong>
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button
                      className="btn-status"
                      onClick={() => handleStatusUpdate(order.id || order._id, 'processing')}
                    >
                      Mark as Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      className="btn-status"
                      onClick={() => handleStatusUpdate(order.id || order._id, 'shipped')}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      className="btn-status"
                      onClick={() => handleStatusUpdate(order.id || order._id, 'delivered')}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;

