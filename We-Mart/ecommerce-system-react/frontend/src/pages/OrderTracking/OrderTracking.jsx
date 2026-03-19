import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ordersAPI } from '../../services/api';
import { format } from 'date-fns';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();

  const { data: orderData, isLoading: orderLoading } = useQuery(
    ['order', id],
    () => ordersAPI.getById(id),
    { enabled: !!id }
  );

  const { data: trackingData, isLoading: trackingLoading, refetch } = useQuery(
    ['order-tracking', id],
    () => ordersAPI.getTracking(id),
    { 
      enabled: !!id,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'processing':
        return '📦';
      case 'shipped':
        return '🚚';
      case 'out_for_delivery':
        return '🚛';
      case 'delivered':
        return '🎉';
      case 'cancelled':
        return '❌';
      case 'returned':
        return '↩️';
      case 'refunded':
        return '💰';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'processing':
        return '#8b5cf6';
      case 'shipped':
        return '#06b6d4';
      case 'out_for_delivery':
        return '#10b981';
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      case 'returned':
        return '#f97316';
      case 'refunded':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned',
      'refunded': 'Refunded',
    };
    return labels[status] || status;
  };

  if (orderLoading || trackingLoading) {
    return <Loading message="Loading order tracking..." />;
  }

  const order = orderData?.data?.data;
  const trackingHistory = trackingData?.data?.data || [];

  if (!order) {
    return (
      <div className="order-tracking-container">
        <EmptyState 
          message="Order not found"
          action={<Link to="/orders">Back to Orders</Link>}
        />
      </div>
    );
  }

  const currentStatus = order.status || 'pending';
  const latestTracking = trackingHistory[trackingHistory.length - 1];

  return (
    <div className="order-tracking-container">
      <div className="order-tracking-header">
        <div className="order-info">
          <h1>Order Tracking</h1>
          <div className="order-details">
            <p><strong>Order ID:</strong> #{order._id || order.id}</p>
            <p><strong>Order Date:</strong> {
              order.created_at 
                ? format(new Date(order.created_at), 'PPpp')
                : order.createdAt 
                ? format(new Date(order.createdAt), 'PPpp')
                : 'N/A'
            }</p>
            <p><strong>Total Amount:</strong> ₹{(order.total_amount || order.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p><strong>Payment Status:</strong> 
              <span className={`payment-status payment-${order.payment_status || order.paymentStatus || 'pending'}`}>
                {(order.payment_status || order.paymentStatus || 'Pending').charAt(0).toUpperCase() + (order.payment_status || order.paymentStatus || 'Pending').slice(1)}
              </span>
            </p>
          </div>
        </div>
        <Link to="/orders" className="back-button">← Back to Orders</Link>
      </div>

      <div className="tracking-status-card">
        <div className="current-status">
          <div 
            className="status-icon" 
            style={{ backgroundColor: getStatusColor(currentStatus) }}
          >
            {getStatusIcon(currentStatus)}
          </div>
          <div className="status-info">
            <h2>Current Status: {getStatusLabel(currentStatus)}</h2>
            {latestTracking && (
              <p className="status-description">{latestTracking.description}</p>
            )}
            {latestTracking?.location && (
              <p className="status-location">📍 {latestTracking.location}</p>
            )}
            {latestTracking?.tracking_number && (
              <p className="tracking-number">
                <strong>Tracking Number:</strong> {latestTracking.tracking_number}
              </p>
            )}
            {latestTracking?.carrier && (
              <p className="carrier">
                <strong>Carrier:</strong> {latestTracking.carrier}
              </p>
            )}
            {latestTracking?.estimated_delivery && (
              <p className="estimated-delivery">
                <strong>Estimated Delivery:</strong> {
                  latestTracking.estimated_delivery 
                    ? format(new Date(latestTracking.estimated_delivery), 'PP')
                    : 'N/A'
                }
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="tracking-timeline">
        <h3>Tracking History</h3>
        {trackingHistory.length === 0 ? (
          <EmptyState message="No tracking information available yet" />
        ) : (
          <div className="timeline">
            {trackingHistory.map((tracking, index) => {
              const isLast = index === trackingHistory.length - 1;
              const isActive = isLast;
              
              return (
                <div key={tracking._id || index} className={`timeline-item ${isActive ? 'active' : ''}`}>
                  <div className="timeline-marker">
                    <div 
                      className="marker-dot" 
                      style={{ backgroundColor: getStatusColor(tracking.status) }}
                    >
                      {getStatusIcon(tracking.status)}
                    </div>
                    {!isLast && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{getStatusLabel(tracking.status)}</h4>
                      <span className="timeline-date">
                        {tracking.created_at 
                          ? format(new Date(tracking.created_at), 'PPpp')
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="timeline-description">{tracking.description}</p>
                    {tracking.location && (
                      <p className="timeline-location">📍 {tracking.location}</p>
                    )}
                    {tracking.tracking_number && (
                      <p className="timeline-tracking">
                        <strong>Tracking:</strong> {tracking.tracking_number}
                      </p>
                    )}
                    {tracking.carrier && (
                      <p className="timeline-carrier">
                        <strong>Carrier:</strong> {tracking.carrier}
                      </p>
                    )}
                    {tracking.updated_by && (
                      <p className="timeline-updated-by">
                        Updated by: {tracking.updated_by?.first_name || 'System'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {order.items && order.items.length > 0 && (
        <div className="order-items-section">
          <h3>Order Items</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <h4>{item.product?.name || item.product?.title || item.product_id || 'Product'}</h4>
                  <p>Quantity: {item.quantity || 1}</p>
                  <p>Price: ₹{(item.price || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="item-total">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ₹{(order.total_amount || order.totalAmount || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
