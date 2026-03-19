import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { format } from 'date-fns';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Orders.css';

const Orders = () => {
  const { data, isLoading, error } = useQuery(
    'user-orders',
    () => ordersAPI.getAll(),
    {
      staleTime: 2 * 60 * 1000,
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <Loading message="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Failed to load orders. Please try again later.</p>
      </div>
    );
  }

  const orders = data?.data?.data || [];

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders yet"
            message="Start shopping to see your orders here!"
            actionLabel="Start Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id || order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id || order.id}</h3>
                    <p className="order-date">
                      {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <div className="order-info">
                    <p><strong>Total:</strong> ₹{order.total_amount?.toLocaleString() || '0.00'}</p>
                    <p><strong>Payment:</strong> {order.payment_method || 'N/A'}</p>
                    {order.shipping_address?.city && (
                      <p><strong>Shipping to:</strong> {order.shipping_address.city}, {order.shipping_address.state}</p>
                    )}
                  </div>
                  <div className="order-actions">
                    <Link to={`/orders/${order._id || order.id}/tracking`} className="btn btn-primary">
                      Track Order
                    </Link>
                    <Link to={`/orders/${order._id || order.id}`} className="btn btn-secondary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

