import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { FiStar } from 'react-icons/fi';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import Loading from '../Loading/Loading';
import './ReviewSection.css';

const ReviewSection = ({ productId, orderId = null }) => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');

  const { data: reviewsData, isLoading } = useQuery(
    ['reviews', productId, ratingFilter],
    () => reviewsAPI.getProductReviews(productId, {
      rating: ratingFilter !== 'all' ? ratingFilter : undefined,
      limit: 10
    }),
    { enabled: !!productId }
  );

  const { data: ratingStatsData } = useQuery(
    ['ratingStats', productId],
    () => reviewsAPI.getProductRatingStats(productId),
    { enabled: !!productId }
  );

  const deleteMutation = useMutation(
    (id) => reviewsAPI.deleteReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', productId]);
        queryClient.invalidateQueries(['ratingStats', productId]);
        queryClient.invalidateQueries(['product', productId]);
        toast.success('Review deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete review');
      }
    }
  );

  const reviews = reviewsData?.data?.data?.reviews || reviewsData?.data?.reviews || [];
  const ratingStats = reviewsData?.data?.data?.ratingStats || reviewsData?.data?.ratingStats || ratingStatsData?.data?.data || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };

  // Check if user has already reviewed
  const userReview = isAuthenticated && user ? reviews.find(r => {
    const reviewUserId = r.user_id?._id || r.user_id || r.user_id;
    const currentUserId = user._id || user.id;
    return reviewUserId && currentUserId && reviewUserId.toString() === currentUserId.toString();
  }) : null;

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDelete = (review) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(review._id || review.id);
    }
  };

  const handleFormSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < rating ? 'star filled' : 'star'}
      />
    ));
  };

  const getRatingPercentage = (rating) => {
    if (ratingStats.totalReviews === 0) return 0;
    const count = ratingStats.ratingDistribution[rating] || 0;
    return Math.round((count / ratingStats.totalReviews) * 100);
  };

  if (isLoading) {
    return <Loading message="Loading reviews..." />;
  }

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2>Customer Reviews</h2>
        {ratingStats.totalReviews > 0 && (
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-value">{ratingStats.averageRating.toFixed(1)}</span>
              <div className="stars">
                {renderStars(Math.round(ratingStats.averageRating))}
              </div>
            </div>
            <div className="total-reviews">
              Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {ratingStats.totalReviews > 0 && (
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(rating => {
            const percentage = getRatingPercentage(rating);
            const count = ratingStats.ratingDistribution[rating] || 0;
            return (
              <div key={rating} className="rating-bar-item">
                <button
                  className={`rating-filter-btn ${ratingFilter === rating.toString() ? 'active' : ''}`}
                  onClick={() => setRatingFilter(ratingFilter === rating.toString() ? 'all' : rating.toString())}
                >
                  <span className="rating-label">{rating} star{rating !== 1 ? 's' : ''}</span>
                  <div className="rating-bar-wrapper">
                    <div
                      className="rating-bar"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="rating-count">{count}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {isAuthenticated && !userReview && !showReviewForm && (
        <button
          className="btn btn-primary write-review-btn"
          onClick={() => setShowReviewForm(true)}
        >
          Write a Review
        </button>
      )}

      {showReviewForm && (
        <ReviewForm
          productId={productId}
          orderId={orderId}
          existingReview={editingReview}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id || review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="load-more-section">
          <button className="btn btn-secondary">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
