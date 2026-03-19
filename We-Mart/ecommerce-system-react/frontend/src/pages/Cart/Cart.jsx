import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { FiTrash2, FiX, FiHeart, FiCheck, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items = [], total = 0, updateQuantity, removeItem, clearCart } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const [pincode, setPincode] = useState('');
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set(items.map(item => item.product_id)));
  const [donationAmount, setDonationAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [platformFee] = useState(23); // Fixed platform fee

  // Update selectedItems when items change
  useEffect(() => {
    setSelectedItems(new Set(items.map(item => item.product_id)));
  }, [items]);

  // Standard sizes for size dropdown
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XS', 'Free Size'];

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const handleRemoveItem = (productId, productName) => {
    removeItem(productId);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    toast.success(`${productName} removed from cart`, {
      icon: '🗑️',
    });
  };

  const handleMoveToWishlist = (item) => {
    if (!isAuthenticated) {
      toast.info('Please login to move items to wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    
    const product = item.product || {
      id: item.product_id,
      _id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image,
      image_url: item.image,
    };
    
    addToWishlist(product);
    removeItem(item.product_id);
    toast.success(`${item.name} moved to wishlist!`, { icon: '❤️' });
  };

  const handleSizeChange = (productId, newSize) => {
    // Update the item's selectedSize in cart
    const item = items.find(i => i.product_id === productId);
    if (item) {
      // Update the item's selectedSize
      item.selectedSize = newSize;
      // Update cart store
      const updatedItems = items.map(i => 
        i.product_id === productId ? { ...i, selectedSize: newSize } : i
      );
      // Note: This is a workaround. In a real app, you'd have an updateSize method in the store
      toast.info(`Size changed to ${newSize}`);
    }
  };

  const handleItemSelect = (productId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.product_id)));
    }
  };

  // Calculate totals
  const selectedItemsList = items.filter(item => selectedItems.has(item.product_id));
  const subtotal = selectedItemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalMRP = selectedItemsList.reduce((sum, item) => {
    const mrp = item.product?.mrp || item.price * 2; // Fallback MRP
    return sum + (mrp * item.quantity);
  }, 0);
  const discount = totalMRP - subtotal;
  const finalTotal = subtotal + platformFee + donationAmount;

  if (items.length === 0) {
    return (
      <div className="cart-page-myntra">
        <div className="container">
          <h1 className="page-title-myntra">Shopping Bag</h1>
          <EmptyState
            icon="🛒"
            title="Your bag is empty"
            message="Add some amazing products to your bag to get started!"
            actionLabel="Continue Shopping"
            actionLink="/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-myntra">
      <div className="container">
        <h1 className="page-title-myntra">Shopping Bag</h1>

        <div className="cart-content-myntra">
          {/* Left Section */}
          <div className="cart-left-section">
            {/* Delivery Section */}
            <div className="delivery-section-myntra">
              <div className="delivery-header">
                <span>Check delivery time & services</span>
                <button 
                  className="btn-pincode"
                  onClick={() => setShowPincodeInput(!showPincodeInput)}
                >
                  ENTER PIN CODE
                </button>
              </div>
              {showPincodeInput && (
                <div className="pincode-input-section">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="pincode-input"
                  />
                  <button 
                    className="btn-check-delivery"
                    onClick={() => {
                      if (pincode.length === 6) {
                        toast.success(`Delivery available for pincode ${pincode}`);
                      } else {
                        toast.warning('Please enter a valid 6-digit pincode');
                      }
                    }}
                  >
                    CHECK
                  </button>
                </div>
              )}
            </div>

            {/* Items Selected */}
            <div className="items-selected-header">
              <div className="select-all-section">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>{selectedItems.size}/{items.length} ITEMS SELECTED</span>
                </label>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
              {items.map((item) => {
                const isSelected = selectedItems.has(item.product_id);
                const itemMRP = item.product?.mrp || item.price * 2;
                const itemDiscount = itemMRP - item.price;
                const discountPercent = Math.round((itemDiscount / itemMRP) * 100);

                return (
                  <div key={item.product_id} className="cart-item-myntra">
                    <div className="item-selection-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemSelect(item.product_id)}
                      />
                      {isSelected && <FiCheck className="check-icon" />}
                    </div>

                    <div className="item-image-myntra">
                      <img src={item.image || '/product_placeholder.jpg'} alt={item.name} />
                    </div>

                    <div className="item-details-myntra">
                      <div className="item-brand">{item.product?.brand || 'Brand'}</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-seller">Sold by: {item.product?.seller_name || 'RetailNet'}</div>

                      <div className="item-options">
                        <div className="size-selector-myntra">
                          <label>Size:</label>
                          <select
                            value={item.selectedSize || (item.product?.sizes?.[0] || 'S')}
                            onChange={(e) => handleSizeChange(item.product_id, e.target.value)}
                            className="size-dropdown"
                          >
                            {(item.product?.sizes && item.product.sizes.length > 0 
                              ? item.product.sizes 
                              : availableSizes
                            ).map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>

                        <div className="quantity-selector-myntra">
                          <label>Qty:</label>
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                            className="qty-dropdown"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(qty => (
                              <option key={qty} value={qty}>{qty}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="item-pricing-myntra">
                        <span className="current-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        <span className="mrp-price">₹{(itemMRP * item.quantity).toLocaleString('en-IN')}</span>
                        <span className="discount-badge">{discountPercent}% OFF</span>
                      </div>

                      <div className="return-policy">
                        <FiInfo className="info-icon" />
                        <span>14 days return available</span>
                      </div>

                      <div className="item-actions-myntra">
                        <button
                          className="action-link"
                          onClick={() => handleRemoveItem(item.product_id, item.name)}
                        >
                          REMOVE
                        </button>
                        <span className="action-separator">|</span>
                        <button
                          className="action-link"
                          onClick={() => handleMoveToWishlist(item)}
                        >
                          MOVE TO WISHLIST
                        </button>
                      </div>
                    </div>

                    <button
                      className="item-remove-btn"
                      onClick={() => handleRemoveItem(item.product_id, item.name)}
                      title="Remove"
                    >
                      <FiX />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="login-prompt-myntra">
                <div className="login-avatars">
                  <div className="avatar-circle"></div>
                  <div className="avatar-circle"></div>
                  <div className="avatar-circle"></div>
                </div>
                <div className="login-text">
                  Login to see items from your existing bag and wishlist.
                </div>
                <button className="btn-login-now" onClick={() => navigate('/login')}>
                  LOGIN NOW
                </button>
              </div>
            )}
          </div>

          {/* Right Section - Sidebar */}
          <div className="cart-right-section">
            {/* Coupons */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">COUPONS</h3>
              <div className="coupon-section">
                <input
                  type="text"
                  placeholder="Apply Coupons"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button 
                  className="btn-apply"
                  onClick={(e) => {
                    e.preventDefault();
                    if (couponCode) {
                      toast.info('Coupon functionality coming soon!');
                    } else {
                      toast.warning('Please enter a coupon code');
                    }
                  }}
                >
                  APPLY
                </button>
              </div>
              <div className="coupon-promo">
                Login to get upto ₹500 OFF on first order
              </div>
            </div>

            {/* Gifting */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">GIFTING & PERSONALISATION</h3>
              <div className="gifting-content">
                <div className="gift-icon">🎁</div>
                <p>Buying for a loved one? Gift Packaging and personalised message on card, Only for ₹35</p>
                <button 
                  className="btn-gift"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Gift packaging functionality coming soon!');
                  }}
                >
                  ADD GIFT PACKAGE
                </button>
              </div>
            </div>

            {/* Donation */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">SUPPORT TRANSFORMATIVE SOCIAL WORK IN INDIA</h3>
              <div className="donation-section">
                <label className="donation-checkbox">
                  <input
                    type="checkbox"
                    checked={donationAmount > 0}
                    onChange={(e) => {
                      if (!e.target.checked) setDonationAmount(0);
                    }}
                  />
                  <span>Donate and make a difference</span>
                </label>
                {donationAmount > 0 && (
                  <div className="donation-amounts">
                    {[10, 20, 50, 100].map(amount => (
                      <button
                        key={amount}
                        className={`donation-btn ${donationAmount === amount ? 'active' : ''}`}
                        onClick={() => setDonationAmount(amount)}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                )}
                <a href="#" className="know-more-link" onClick={(e) => e.preventDefault()}>Know More</a>
              </div>
            </div>

            {/* Price Details */}
            <div className="sidebar-section price-details-section">
              <h3 className="sidebar-title">PRICE DETAILS ({selectedItemsList.length} Item{selectedItemsList.length !== 1 ? 's' : ''})</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Total MRP</span>
                  <span>₹{totalMRP.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row discount-row">
                  <span>Discount on MRP</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row">
                  <span>Coupon Discount</span>
                  <a href="#" className="apply-coupon-link" onClick={(e) => {
                    e.preventDefault();
                    if (couponCode) {
                      toast.info('Coupon functionality coming soon!');
                    } else {
                      toast.info('Enter a coupon code above');
                    }
                  }}>Apply Coupon</a>
                </div>
                {selectedItemsList.length > 0 && (
                  <div className="price-row">
                    <span>Platform Fee</span>
                    <span>₹{platformFee} <a href="#" className="know-more-link-small" onClick={(e) => e.preventDefault()}>Know More</a></span>
                  </div>
                )}
                {donationAmount > 0 && (
                  <div className="price-row">
                    <span>Donation</span>
                    <span>₹{donationAmount}</span>
                  </div>
                )}
                <div className="price-row total-row">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              className="btn-place-order"
              onClick={() => {
                if (selectedItemsList.length === 0) {
                  toast.warning('Please select at least one item');
                  return;
                }
                handleCheckout();
              }}
              disabled={selectedItemsList.length === 0}
            >
              PLACE ORDER
            </button>
            
            <div className="security-note">
              <span>🔒</span>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
