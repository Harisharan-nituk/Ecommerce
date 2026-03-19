import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import EmptyState from '../../components/EmptyState/EmptyState';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import './Wishlist.css';

const WishlistContent = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleRemoveItem = (productId, productName) => {
    removeItem(productId);
    toast.success(`${productName} removed from wishlist`, {
      icon: '❤️',
    });
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const handleClearWishlist = () => {
    if (items.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
      toast.success('Wishlist cleared', {
        icon: '❤️',
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1 className="page-title">My Wishlist</h1>
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            message="Start adding products you love to your wishlist!"
            actionLabel="Continue Shopping"
            actionLink="/products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <div>
            <h1 className="page-title">My Wishlist</h1>
            <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          </div>
          {items.length > 0 && (
            <button
              className="btn-clear-wishlist"
              onClick={handleClearWishlist}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        <div className="wishlist-grid">
          {items.map((item, index) => (
            <motion.div
              key={item.product_id || item.id || index}
              className="wishlist-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products/${item.product_id || item.id}`}
                className="wishlist-item-image"
              >
                <img
                  src={item.image_url || item.image || '/product_placeholder.jpg'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/product_placeholder.jpg';
                  }}
                />
              </Link>

              <div className="wishlist-item-info">
                <Link
                  to={`/products/${item.product_id || item.id}`}
                  className="wishlist-item-name"
                >
                  {item.name}
                </Link>

                {item.brand && (
                  <p className="wishlist-item-brand">{item.brand}</p>
                )}

                <div className="wishlist-item-rating">
                  {item.average_rating > 0 && (
                    <>
                      <span className="rating-stars">
                        {'★'.repeat(Math.floor(item.average_rating))}
                        {'☆'.repeat(5 - Math.floor(item.average_rating))}
                      </span>
                      <span className="rating-value">
                        {item.average_rating.toFixed(1)}
                      </span>
                      {item.total_reviews > 0 && (
                        <span className="rating-count">
                          ({item.total_reviews})
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="wishlist-item-price">
                  ₹{(item.price || 0).toLocaleString('en-IN')}
                </div>

                <div className="wishlist-item-actions">
                  <button
                    className="btn-add-to-cart"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(item);
                    }}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    className="btn-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveItem(item.product_id || item.id, item.name);
                    }}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
};

export default Wishlist;
