import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiCheck, FiCreditCard, FiSmartphone, FiDollarSign, FiTruck } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items = [], total = 0, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [platformFee] = useState(23);
  const [deliveryCharge] = useState(0); // Free delivery
  const [isChecking, setIsChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Calculate totals
  const totalMRP = (items || []).reduce((sum, item) => {
    const mrp = item.product?.mrp || item.price * 2;
    return sum + (mrp * item.quantity);
  }, 0);
  const discount = totalMRP - total;
  const finalTotal = total + platformFee + deliveryCharge;

  // Check conditions and redirect if needed
  useEffect(() => {
    setIsChecking(true);
    
    // Check if cart is empty
    if (!items || items.length === 0) {
      toast.warning('Your cart is empty');
      navigate('/cart');
      return;
    }

    // Check if authenticated
    if (!isAuthenticated) {
      toast.info('Please login to continue checkout');
      navigate('/login');
      return;
    }

    setIsChecking(false);
  }, [items, isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // If showing add address form, use form data; otherwise use selected address
    let addressData = null;
    if (showAddAddress) {
      if (!data.firstName || !data.address || !data.city || !data.state || !data.zipCode || !data.phone) {
        toast.warning('Please fill all required address fields');
        return;
      }
      addressData = {
        first_name: data.firstName,
        last_name: data.lastName || '',
        address_line_1: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        country: data.country || 'India',
        phone: data.phone,
      };
    } else if (selectedAddress) {
      addressData = {
        first_name: selectedAddress.firstName,
        last_name: selectedAddress.lastName || '',
        address_line_1: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip_code: selectedAddress.zipCode,
        country: selectedAddress.country || 'India',
        phone: selectedAddress.phone,
      };
    } else {
      toast.warning('Please add or select a delivery address');
      return;
    }

    setLoading(true);
    try {
      // Ensure items exist and are valid
      if (!items || items.length === 0) {
        toast.error('Your cart is empty');
        setLoading(false);
        return;
      }

      // Prepare cart items for order - ensure we have valid items
      const orderItems = (items || [])
        .filter(item => item && (item.product_id || item.id || item._id)) // Filter out invalid items
        .map(item => ({
          product_id: item.product_id || item.id || item._id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          name: item.name,
          image: item.image
        }));

      if (orderItems.length === 0) {
        toast.error('No valid items in cart');
        setLoading(false);
        return;
      }

      console.log('Preparing order with items:', {
        originalItemsCount: items.length,
        orderItemsCount: orderItems.length,
        orderItems: orderItems
      });

      // Create order
      const orderData = {
        shipping_address_id: selectedAddress?.id || null,
        payment_method: paymentMethod,
        shipping_address: addressData,
        items: orderItems,
        total_amount: finalTotal
      };

      console.log('Order data being sent:', {
        itemsCount: orderItems.length,
        orderItems: orderItems,
        total_amount: finalTotal,
        hasAddress: !!addressData
      }); // Debug log

      const response = await ordersAPI.create(orderData);

      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.data.data.orderId}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="checkout-page-myntra">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty or not authenticated, show message (redirect will happen)
  if (!items || items.length === 0 || !isAuthenticated) {
    return (
      <div className="checkout-page-myntra">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              {(!items || items.length === 0) ? 'Your cart is empty' : 'Please login to continue'}
            </div>
            <div>Redirecting...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-myntra">
      <div className="container">
        <h1 className="checkout-title-myntra">Checkout</h1>

        <div className="checkout-content-myntra">
          {/* Left Section */}
          <div className="checkout-left-section">
            {/* Delivery Address Section */}
            <div className="checkout-section-myntra">
              <div className="section-header-myntra">
                <h2 className="section-title-myntra">DELIVERY ADDRESS</h2>
                {!showAddAddress && (
                  <button
                    className="btn-add-address"
                    onClick={() => setShowAddAddress(true)}
                  >
                    <FiPlus /> ADD NEW ADDRESS
                  </button>
                )}
              </div>

              {!showAddAddress && !selectedAddress && (
                <div className="address-placeholder">
                  <p>No address saved. Please add a delivery address.</p>
                  <button
                    className="btn-add-address-inline"
                    onClick={() => setShowAddAddress(true)}
                  >
                    <FiPlus /> Add Address
                  </button>
                </div>
              )}

              {showAddAddress && (
                <div className="address-form-myntra">
                  <div className="form-row-myntra">
                    <div className="form-group-myntra">
                      <label>Name *</label>
                      <input
                        type="text"
                        {...register('firstName', { required: 'Name is required' })}
                        defaultValue={user?.firstName || ''}
                        placeholder="Enter your name"
                      />
                      {errors.firstName && (
                        <span className="error-message">{errors.firstName.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group-myntra">
                    <label>Address *</label>
                    <input
                      type="text"
                      {...register('address', { required: 'Address is required' })}
                      placeholder="House/Flat No., Building Name, Street"
                    />
                    {errors.address && (
                      <span className="error-message">{errors.address.message}</span>
                    )}
                  </div>

                  <div className="form-row-myntra">
                    <div className="form-group-myntra">
                      <label>City *</label>
                      <input
                        type="text"
                        {...register('city', { required: 'City is required' })}
                        placeholder="City"
                      />
                      {errors.city && (
                        <span className="error-message">{errors.city.message}</span>
                      )}
                    </div>
                    <div className="form-group-myntra">
                      <label>State *</label>
                      <input
                        type="text"
                        {...register('state', { required: 'State is required' })}
                        placeholder="State"
                      />
                      {errors.state && (
                        <span className="error-message">{errors.state.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row-myntra">
                    <div className="form-group-myntra">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        {...register('zipCode', { 
                          required: 'Pincode is required',
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Please enter a valid 6-digit pincode'
                          }
                        })}
                        placeholder="Pincode"
                        maxLength={6}
                      />
                      {errors.zipCode && (
                        <span className="error-message">{errors.zipCode.message}</span>
                      )}
                    </div>
                    <div className="form-group-myntra">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        {...register('phone', { 
                          required: 'Phone is required',
                          pattern: {
                            value: /^\d{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      {errors.phone && (
                        <span className="error-message">{errors.phone.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="address-form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAddAddress(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-save-address"
                      onClick={handleSubmit((data) => {
                        // Save address logic here (would typically save to backend)
                        setSelectedAddress({
                          id: Date.now(),
                          ...data,
                          country: 'India'
                        });
                        setShowAddAddress(false);
                        toast.success('Address saved successfully!');
                      })}
                    >
                      SAVE ADDRESS
                    </button>
                  </div>
                </div>
              )}

              {selectedAddress && !showAddAddress && (
                <div className="saved-address-card">
                  <div className="address-content">
                    <div className="address-name">{selectedAddress.firstName}</div>
                    <div className="address-details">
                      {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                    </div>
                    <div className="address-phone">Phone: {selectedAddress.phone}</div>
                  </div>
                  <button
                    className="btn-edit-address"
                    onClick={() => setShowAddAddress(true)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="checkout-section-myntra">
              <h2 className="section-title-myntra">PAYMENT METHOD</h2>
              
              <div className="payment-options-myntra">
                <label className={`payment-option-myntra ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <FiTruck className="payment-icon" />
                    <div>
                      <div className="payment-name">Cash on Delivery</div>
                      <div className="payment-desc">Pay when you receive</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-myntra ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <FiCreditCard className="payment-icon" />
                    <div>
                      <div className="payment-name">Credit/Debit Card</div>
                      <div className="payment-desc">Visa, Mastercard, RuPay</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-myntra ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <FiSmartphone className="payment-icon" />
                    <div>
                      <div className="payment-name">UPI</div>
                      <div className="payment-desc">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-myntra ${paymentMethod === 'wallet' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <FiDollarSign className="payment-icon" />
                    <div>
                      <div className="payment-name">Wallets</div>
                      <div className="payment-desc">Paytm, PhonePe, Amazon Pay</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="checkout-section-myntra">
              <h2 className="section-title-myntra">ORDER SUMMARY</h2>
              <div className="order-items-list-myntra">
                {(items || []).map((item) => {
                  const itemMRP = item.product?.mrp || item.price * 2;
                  const itemDiscount = itemMRP - item.price;
                  const discountPercent = Math.round((itemDiscount / itemMRP) * 100);

                  return (
                    <div key={item.product_id} className="order-item-myntra">
                      <div className="order-item-image">
                        <img src={item.image || '/product_placeholder.jpg'} alt={item.name} />
                      </div>
                      <div className="order-item-details">
                        <div className="order-item-brand">{item.product?.brand || 'Brand'}</div>
                        <div className="order-item-name">{item.name}</div>
                        {item.selectedSize && (
                          <div className="order-item-size">Size: {item.selectedSize}</div>
                        )}
                        <div className="order-item-qty">Qty: {item.quantity}</div>
                        <div className="order-item-price">
                          <span className="current-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          <span className="mrp-price">₹{(itemMRP * item.quantity).toLocaleString('en-IN')}</span>
                          <span className="discount-badge">{discountPercent}% OFF</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section - Price Summary */}
          <div className="checkout-right-section">
            <div className="price-summary-card-myntra">
              <h3 className="summary-title-myntra">PRICE DETAILS ({(items || []).length} Item{(items || []).length !== 1 ? 's' : ''})</h3>
              
              <div className="price-breakdown-myntra">
                <div className="price-row-myntra">
                  <span>Total MRP</span>
                  <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row-myntra discount-row">
                  <span>Discount on MRP</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row-myntra">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? 'free-text' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="price-row-myntra">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="price-divider-myntra"></div>
                <div className="price-row-myntra total-row-myntra">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-place-order-myntra"
                onClick={() => {
                  if (!selectedAddress && !showAddAddress) {
                    toast.warning('Please add a delivery address');
                    return;
                  }
                  handleSubmit(onSubmit)();
                }}
                disabled={loading || (!selectedAddress && !showAddAddress)}
              >
                {loading ? 'PLACING ORDER...' : `PLACE ORDER`}
              </button>

              <div className="security-note-myntra">
                <span>🔒</span>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
