import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiStar, FiX } from 'react-icons/fi';
import './ReviewForm.css';

const ReviewForm = ({ productId, orderId, onSuccess, onCancel, existingReview = null }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation(
    (data) => reviewsAPI.createReview(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', productId]);
        queryClient.invalidateQueries(['product', productId]);
        toast.success('Review submitted successfully!');
        if (onSuccess) onSuccess();
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const updateMutation = useMutation(
    (data) => reviewsAPI.updateReview(existingReview._id || existingReview.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', productId]);
        queryClient.invalidateQueries(['product', productId]);
        toast.success('Review updated successfully!');
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update review');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      product_id: productId,
      order_id: orderId,
      rating,
      title: title.trim() || null,
      review_text: reviewText.trim()
    };

    if (existingReview) {
      updateMutation.mutate(reviewData);
    } else {
      createMutation.mutate(reviewData);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setReviewText('');
    setHoveredRating(0);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={i}
          type="button"
          className={`star-btn ${isFilled ? 'filled' : ''}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          aria-label={`Rate ${starValue} stars`}
        >
          <FiStar />
        </button>
      );
    });
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
        {onCancel && (
          <button
            type="button"
            className="close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            <FiX />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Rating *</label>
          <div className="rating-input">
            {renderStars()}
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="review-title">Review Title (Optional)</label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            maxLength={200}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="review-text">Your Review *</label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="6"
            maxLength={2000}
            required
            className="form-textarea"
          />
          <div className="char-count">
            {reviewText.length}/2000 characters
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || rating === 0 || !reviewText.trim()}
          >
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
