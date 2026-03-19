import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { returnsAPI, ordersAPI, productsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import { 
  FiPackage, 
  FiRefreshCw, 
  FiX, 
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiFileText,
  FiDollarSign
} from 'react-icons/fi';
import './Returns.css';

const Returns = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '',
    product_id: '',
    type: 'return',
    reason: '',
    reason_description: '',
    quantity: 1,
    exchange_product_id: '',
    exchange_size: '',
    exchange_color: '',
    refund_delivery_charges: false
  });

  // Fetch user's orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'user-orders',
    () => ordersAPI.getMyOrders({ limit: 50 })
  );

  // Fetch user's return requests
  const { data: returnsData, isLoading: returnsLoading } = useQuery(
    'my-returns',
    () => returnsAPI.getMyReturns()
  );

  // Calculate refund mutation
  const calculateRefundMutation = useMutation(
    (data) => returnsAPI.calculateRefund(data),
    {
      onSuccess: (data) => {
        // Refund calculation will be shown in the form
      }
    }
  );

  // Create return mutation
  const createReturnMutation = useMutation(
    (data) => returnsAPI.createReturn(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-returns');
        toast.success('Return/Exchange request submitted successfully!');
        setShowForm(false);
        setSelectedOrder(null);
        setFormData({
          order_id: '',
          product_id: '',
          type: 'return',
          reason: '',
          reason_description: '',
          quantity: 1,
          exchange_product_id: '',
          exchange_size: '',
          exchange_color: '',
          refund_delivery_charges: false
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit return request');
      }
    }
  );

  const orders = ordersData?.data?.data || [];
  const returns = returnsData?.data?.data || [];

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setFormData({
      ...formData,
      order_id: order._id || order.id
    });
    setShowForm(true);
  };

  const handleProductSelect = (productId) => {
    setFormData({
      ...formData,
      product_id: productId
    });
    
    // Calculate refund when product is selected
    if (formData.order_id && productId && formData.quantity) {
      calculateRefundMutation.mutate({
        order_id: formData.order_id,
        product_id: productId,
        quantity: formData.quantity,
        refund_delivery_charges: formData.refund_delivery_charges
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.order_id || !formData.product_id || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    createReturnMutation.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const refundCalculation = calculateRefundMutation.data?.data?.data;

  if (ordersLoading || returnsLoading) {
    return <Loading message="Loading returns..." />;
  }

  return (
    <div className="returns-page">
      <div className="returns-header">
        <div>
          <h1>Returns & Exchanges</h1>
          <p className="subtitle">Request a return or exchange for your orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPackage /> New Return Request
        </button>
      </div>

      {/* Terms and Conditions */}
      <div className="terms-section">
        <div className="terms-header">
          <FiFileText />
          <h3>Return & Exchange Policy</h3>
        </div>
        <div className="terms-content">
          <div className="terms-item">
            <strong>Return Window:</strong> Items can be returned within 7 days of delivery.
          </div>
          <div className="terms-item">
            <strong>Condition:</strong> Items must be unused, unwashed, and in original packaging with tags attached.
          </div>
          <div className="terms-item">
            <strong>Delivery Charges:</strong> 
            <ul>
              <li>Original delivery charges are non-refundable unless the product is defective or wrong item received.</li>
              <li>Return shipping charges may apply and will be deducted from the refund amount.</li>
              <li>For exchanges, return shipping is free if the exchange product value is equal or higher.</li>
            </ul>
          </div>
          <div className="terms-item">
            <strong>Refund Processing:</strong> Refunds will be processed within 5-7 business days after approval.
          </div>
          <div className="terms-item">
            <strong>Exchange:</strong> Exchanges are subject to product availability. Size/color exchanges are preferred.
          </div>
          <div className="terms-item">
            <strong>Non-Returnable Items:</strong> Personalized items, perishables, and items marked as non-returnable cannot be returned.
          </div>
        </div>
      </div>

      {/* Return Request Form */}
      {showForm && (
        <div className="return-form-section">
          <div className="form-header">
            <h2>Create Return/Exchange Request</h2>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="return-form">
            {/* Order Selection */}
            <div className="form-group">
              <label>Select Order *</label>
              {!selectedOrder ? (
                <div className="order-selector">
                  {orders.filter(o => o.status === 'delivered').length === 0 ? (
                    <p className="no-orders">No delivered orders available for return</p>
                  ) : (
                    orders
                      .filter(o => o.status === 'delivered')
                      .map(order => (
                        <div
                          key={order._id || order.id}
                          className="order-option"
                          onClick={() => handleOrderSelect(order)}
                        >
                          <div>
                            <strong>Order #{order._id || order.id}</strong>
                            <p>₹{(order.total_amount || order.totalAmount || 0).toLocaleString('en-IN')} • {new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <FiCheck />
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div className="selected-order">
                  <div>
                    <strong>Order #{selectedOrder._id || selectedOrder.id}</strong>
                    <p>₹{(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedOrder(null)}>
                    Change
                  </button>
                </div>
              )}
            </div>

            {selectedOrder && (
              <>
                {/* Product Selection */}
                <div className="form-group">
                  <label>Select Product to Return/Exchange *</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    required
                  >
                    <option value="">Select a product</option>
                    {selectedOrder.items?.map((item, index) => {
                      const productId = item.product_id?._id || item.product_id || item.product?._id || item.product;
                      const productName = item.product?.name || item.product?.title || `Product ${index + 1}`;
                      return (
                        <option key={index} value={productId}>
                          {productName} (Qty: {item.quantity || 1}) - ₹{(item.price || 0).toLocaleString('en-IN')}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Return Type */}
                <div className="form-group">
                  <label>Type *</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="return"
                        checked={formData.type === 'return'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      />
                      <span>Return for Refund</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="type"
                        value="exchange"
                        checked={formData.type === 'exchange'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      />
                      <span>Exchange Product</span>
                    </label>
                  </div>
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value);
                      setFormData({ ...formData, quantity: qty });
                      if (formData.order_id && formData.product_id) {
                        calculateRefundMutation.mutate({
                          order_id: formData.order_id,
                          product_id: formData.product_id,
                          quantity: qty,
                          refund_delivery_charges: formData.refund_delivery_charges
                        });
                      }
                    }}
                    required
                  />
                </div>

                {/* Reason */}
                <div className="form-group">
                  <label>Reason for Return/Exchange *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="defective">Defective Product</option>
                    <option value="wrong_item">Wrong Item Received</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="damaged">Damaged During Shipping</option>
                    <option value="size_issue">Size Issue</option>
                    <option value="color_issue">Color Issue</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="changed_mind">Changed Mind</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Reason Description */}
                <div className="form-group">
                  <label>Additional Details</label>
                  <textarea
                    value={formData.reason_description}
                    onChange={(e) => setFormData({ ...formData, reason_description: e.target.value })}
                    rows="4"
                    placeholder="Please provide more details about your return/exchange request..."
                  />
                </div>

                {/* Exchange Options */}
                {formData.type === 'exchange' && (
                  <>
                    <div className="form-group">
                      <label>Exchange Size</label>
                      <input
                        type="text"
                        value={formData.exchange_size}
                        onChange={(e) => setFormData({ ...formData, exchange_size: e.target.value })}
                        placeholder="e.g., Large, XL, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label>Exchange Color</label>
                      <input
                        type="text"
                        value={formData.exchange_color}
                        onChange={(e) => setFormData({ ...formData, exchange_color: e.target.value })}
                        placeholder="e.g., Red, Blue, etc."
                      />
                    </div>
                  </>
                )}

                {/* Delivery Charges Refund */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.refund_delivery_charges}
                      onChange={(e) => {
                        setFormData({ ...formData, refund_delivery_charges: e.target.checked });
                        if (formData.order_id && formData.product_id) {
                          calculateRefundMutation.mutate({
                            order_id: formData.order_id,
                            product_id: formData.product_id,
                            quantity: formData.quantity,
                            refund_delivery_charges: e.target.checked
                          });
                        }
                      }}
                    />
                    <span>Request refund of delivery charges (Only for defective/wrong items)</span>
                  </label>
                </div>

                {/* Refund Calculation */}
                {refundCalculation && (
                  <div className="refund-calculation">
                    <h4>Refund Calculation</h4>
                    <div className="calculation-item">
                      <span>Item Refund:</span>
                      <span>₹{refundCalculation.item_refund?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    {refundCalculation.delivery_refund > 0 && (
                      <div className="calculation-item">
                        <span>Delivery Charges Refund:</span>
                        <span>₹{refundCalculation.delivery_refund?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    )}
                    <div className="calculation-item total">
                      <span>Total Refund:</span>
                      <span>₹{refundCalculation.total_refund?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    {refundCalculation.original_delivery_charges > 0 && (
                      <p className="calculation-note">
                        <FiInfo /> Original delivery charges: ₹{refundCalculation.original_delivery_charges?.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createReturnMutation.isLoading}>
                    {createReturnMutation.isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* My Returns List */}
      <div className="returns-list-section">
        <h2>My Return/Exchange Requests</h2>
        {returns.length === 0 ? (
          <div className="empty-returns">
            <FiPackage />
            <p>No return/exchange requests yet</p>
          </div>
        ) : (
          <div className="returns-list">
            {returns.map((returnItem) => (
              <div key={returnItem._id || returnItem.id} className="return-card">
                <div className="return-header">
                  <div>
                    <h3>Request #{returnItem._id || returnItem.id}</h3>
                    <p className="return-date">
                      {new Date(returnItem.created_at || returnItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(returnItem.status)}`}>
                    {returnItem.status}
                  </span>
                </div>
                <div className="return-details">
                  <div className="detail-item">
                    <strong>Type:</strong> {returnItem.type === 'return' ? 'Return' : 'Exchange'}
                  </div>
                  <div className="detail-item">
                    <strong>Reason:</strong> {returnItem.reason?.replace('_', ' ')}
                  </div>
                  <div className="detail-item">
                    <strong>Quantity:</strong> {returnItem.quantity}
                  </div>
                  {returnItem.total_refund > 0 && (
                    <div className="detail-item">
                      <strong>Refund Amount:</strong> ₹{returnItem.total_refund?.toLocaleString('en-IN')}
                    </div>
                  )}
                  {returnItem.admin_notes && (
                    <div className="admin-notes">
                      <strong>Admin Notes:</strong> {returnItem.admin_notes}
                    </div>
                  )}
                </div>
                {returnItem.status === 'pending' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        await returnsAPI.cancelReturn(returnItem._id || returnItem.id);
                        queryClient.invalidateQueries('my-returns');
                        toast.success('Return request cancelled');
                      } catch (error) {
                        toast.error('Failed to cancel return request');
                      }
                    }}
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;
