import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiArrowLeft, FiStar, FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';
import Loading from '../../components/Loading/Loading';
import ReviewSection from '../../components/Reviews/ReviewSection';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [id]);

  const { data, isLoading, error } = useQuery(
    ['product', id],
    () => productsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const product = data?.data?.data;

  // Get sizes from product data, fallback to standard sizes if product has sizes field
  // If sizes array is empty or doesn't exist, show standard sizes
  let availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  if (product && product.sizes) {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      availableSizes = product.sizes;
    } else if (typeof product.sizes === 'string' && product.sizes.trim() !== '') {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          availableSizes = parsed;
        }
      } catch (e) {
        // Keep default sizes if parsing fails
      }
    }
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    
    // Only require size if product has sizes
    if (availableSizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size');
      return;
    }
    
    try {
      const productToAdd = {
        ...product,
        id: product.id || product._id,
        selectedSize: selectedSize || null,
      };
      addItem(productToAdd, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Only require size if product has sizes
    if (availableSizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size');
      return;
    }
    
    try {
      const productToAdd = {
        ...product,
        id: product.id || product._id,
        selectedSize: selectedSize || null,
      };
      addItem(productToAdd, quantity);
      // Navigate to checkout immediately
      setTimeout(() => {
        navigate('/checkout');
      }, 100);
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('Failed to proceed to checkout');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;
    
    if (!isAuthenticated) {
      toast.info('Please login to add items to wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    
    try {
      const productId = product._id || product.id;
      if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        toast.success(`${product.name} removed from wishlist`, { icon: '❤️' });
      } else {
        addToWishlist(product);
        toast.success(`${product.name} added to wishlist!`, { icon: '❤️' });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + delta));
    setQuantity(newQuantity);
  };

  // Get all available images
  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
      // Parse if it's a JSON string
      const parsed = typeof product.image_urls === 'string' 
        ? JSON.parse(product.image_urls) 
        : product.image_urls;
      images.push(...parsed.filter(url => url && url.trim() !== ''));
    }
    // Fallback to single image_url or image
    if (images.length === 0 && (product.image_url || product.image)) {
      images.push(product.image_url || product.image);
    }
    return images;
  };

  const productImages = product ? getProductImages() : [];
  const hasMultipleImages = productImages.length > 1;
  const imageCount = productImages.length;

  // Circular navigation using modulo
  const handlePreviousImage = () => {
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
    }
  };

  const handleNextImage = () => {
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageCount);
    }
  };

  const handleThumbnailClick = (index) => {
    if (index >= 0 && index < imageCount) {
      setCurrentImageIndex(index);
    }
  };

  if (isLoading) {
    return <Loading message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error-message">
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="product-detail-content">
          <div className="product-image-section">
            {productImages.length > 0 ? (
              <div className="product-image-gallery">
                <div className="main-image-container">
                  <img 
                    src={productImages[currentImageIndex % imageCount]} 
                    alt={`${product.name} - Image ${(currentImageIndex % imageCount) + 1} of ${imageCount}`}
                    className="main-product-image"
                  />
                  {hasMultipleImages && (
                    <>
                      <button 
                        className="image-nav-btn image-nav-prev"
                        onClick={handlePreviousImage}
                        aria-label="Previous image"
                      >
                        <FiChevronLeft />
                      </button>
                      <button 
                        className="image-nav-btn image-nav-next"
                        onClick={handleNextImage}
                        aria-label="Next image"
                      >
                        <FiChevronRight />
                      </button>
                      <div className="image-counter">
                        {(currentImageIndex % imageCount) + 1} / {imageCount}
                      </div>
                    </>
                  )}
                </div>
                {hasMultipleImages && (
                  <div className="thumbnail-gallery">
                    {productImages.map((image, index) => {
                      // Use modulo to ensure circular indexing
                      const normalizedIndex = index % imageCount;
                      const isActive = normalizedIndex === (currentImageIndex % imageCount);
                      return (
                        <button
                          key={index}
                          className={`thumbnail-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleThumbnailClick(normalizedIndex)}
                          aria-label={`View image ${normalizedIndex + 1} of ${imageCount}`}
                        >
                          <img src={image} alt={`${product.name} thumbnail ${normalizedIndex + 1}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="product-placeholder">
                <span>📦</span>
                <p>No Image Available</p>
              </div>
            )}
          </div>

          <div className="product-info-section">
            {/* Product Name */}
            <h1 className="product-name-myntra">{product.name}</h1>

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
                <span className="rating-value">{product.average_rating?.toFixed(1) || '0.0'}</span>
                <span className="rating-count">({product.total_reviews || 0} Ratings)</span>
              </div>
            )}

            {/* Price */}
            <div className="product-price-myntra">
              <span className="current-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="mrp-price">₹{(product.mrp || 0).toLocaleString('en-IN')}</span>
                  <span className="discount">
                    ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                  </span>
                </>
              )}
              <div className="price-tax">inclusive of all taxes</div>
            </div>

            {/* Description - without label/tag */}
            {product.description && (
              <div className="product-description-myntra">
                <p className="description-text">{product.description}</p>
              </div>
            )}

            {/* Size Selection - Only show if product has sizes */}
            {availableSizes.length > 0 && (
              <div className="size-selection-section">
                <div className="size-header">
                  <h3 className="section-title">SELECT SIZE</h3>
                  <a href="#" className="size-chart-link">SIZE CHART &gt;</a>
                </div>
                <div className="size-buttons">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                      <span className="size-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {product.stock > 0 ? (
              <div className="product-actions-myntra">
                <button
                  className="btn-add-bag"
                  onClick={handleAddToCart}
                  disabled={availableSizes.length > 0 && !selectedSize}
                  type="button"
                >
                  <FiShoppingCart />
                  ADD TO BAG
                </button>
                <button
                  className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  type="button"
                >
                  <FiHeart style={{ fill: isWishlisted ? '#ff3f6c' : 'none', color: isWishlisted ? '#ff3f6c' : 'currentColor' }} />
                  WISHLIST
                </button>
                <button
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={availableSizes.length > 0 && !selectedSize}
                  type="button"
                >
                  BUY NOW
                </button>
              </div>
            ) : (
              <div className="out-of-stock-message">
                <p>⚠️ This product is currently out of stock</p>
                <button className="btn btn-secondary" onClick={() => navigate('/products')}>
                  Browse Other Products
                </button>
              </div>
            )}

            {/* Delivery Options */}
            <div className="delivery-section">
              <h3 className="section-title">
                <span className="delivery-icon">🚚</span>
                DELIVERY OPTIONS
              </h3>
              <div className="delivery-info">
                <p>Enter pincode to check delivery time & options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;
