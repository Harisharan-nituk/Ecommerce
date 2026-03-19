import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { FiStar } from 'react-icons/fi';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  
  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info('Please login to add items to wishlist', {
        icon: '🔒',
      });
      navigate('/login');
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(productId);
      toast.success(`${product.name} removed from wishlist`, {
        icon: '❤️',
      });
    } else {
      const added = addToWishlist(product);
      if (added) {
        toast.success(`${product.name} added to wishlist!`, {
          icon: '❤️',
        });
      }
    }
  };
  const productImage = product.image_url || product.image;
  const productPrice = product.price || 0;
  const discount = product.original_price && product.original_price > productPrice
    ? Math.round(((product.original_price - productPrice) / product.original_price) * 100)
    : null;

  return (
    <motion.div
      className="product-card-myntra"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/products/${productId}`} className="product-link-myntra" onClick={(e) => e.stopPropagation()}>
        <div className="product-image-wrapper-myntra">
          {productImage ? (
            <>
              {!imageLoaded && (
                <div className="image-skeleton-myntra">
                  <div className="skeleton-shimmer-myntra"></div>
                </div>
              )}
              <img
                src={productImage}
                alt={product.name}
                className={`product-image-myntra ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="product-placeholder-myntra">
              <span className="placeholder-icon-myntra">📦</span>
            </div>
          )}
          
          {/* Hover Overlay - Myntra Style */}
          <motion.div
            className="product-overlay-myntra"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overlay-actions-myntra">
              <motion.button
                className="overlay-btn-myntra"
                onClick={handleQuickView}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Quick View"
              >
                <FiEye />
              </motion.button>
              <motion.button
                className={`overlay-btn-myntra ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <FiHeart style={{ fill: isWishlisted ? '#ff3f6c' : 'none', color: isWishlisted ? '#ff3f6c' : 'white' }} />
              </motion.button>
            </div>
          </motion.div>

          {/* Discount Badge */}
          {discount && (
            <div className="discount-badge-myntra">
              {discount}% OFF
            </div>
          )}

          {/* Stock Badge */}
          {product.stock <= 10 && product.stock > 0 && (
            <div className="stock-badge-myntra low-stock">
              Only {product.stock} left!
            </div>
          )}
          {product.stock === 0 && (
            <div className="stock-badge-myntra out-of-stock">
              Out of Stock
            </div>
          )}
        </div>

        <div className="product-info-myntra">
          <div className="product-brand-myntra">
            {product.brand || product.brand_id?.name || 'Brand'}
          </div>
          
          <h3 className="product-name-myntra">{product.name}</h3>

          {/* Rating */}
          {(product.average_rating > 0 || product.total_reviews > 0) && (
            <div className="product-rating-myntra">
              <div className="rating-stars-myntra">
                {Array.from({ length: 5 }, (_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.round(product.average_rating || 0) ? 'star filled' : 'star'}
                  />
                ))}
              </div>
              <span className="rating-text-myntra">
                ({product.total_reviews || 0})
              </span>
            </div>
          )}

          <div className="product-price-section-myntra">
            <span className="product-price-myntra">₹{productPrice.toLocaleString('en-IN')}</span>
            {product.original_price && product.original_price > productPrice && (
              <>
                <span className="product-price-original-myntra">₹{product.original_price.toLocaleString('en-IN')}</span>
                <span className="price-discount-myntra">{discount}%</span>
              </>
            )}
          </div>

          <motion.button
            className="btn-add-cart-myntra"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
            whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
          >
            <FiShoppingCart />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
