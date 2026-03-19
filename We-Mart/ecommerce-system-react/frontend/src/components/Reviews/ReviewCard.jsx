import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { reviewsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { FiStar, FiThumbsUp, FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import './ReviewCard.css';

const ReviewCard = ({ review, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isHelpful, setIsHelpful] = useState(false);

  const isOwner = user && (user._id === review.user_id?._id || user.id === review.user_id?._id || user._id === review.user_id || user.id === review.user_id);

  const markHelpfulMutation = useMutation(
    () => reviewsAPI.markHelpful(review._id || review.id),
    {
      onSuccess: () => {
        setIsHelpful(true);
        toast.success('Marked as helpful!');
        queryClient.invalidateQueries(['reviews', review.product_id]);
      },
      onError: () => {
        toast.error('Failed to mark as helpful');
      }
    }
  );

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < rating ? 'star filled' : 'star'}
      />
    ));
  };

  const userName = review.user_id?.first_name 
    ? `${review.user_id.first_name} ${review.user_id.last_name || ''}`.trim()
    : 'Anonymous User';

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {userName}
              {review.verified_purchase && (
                <span className="verified-badge" title="Verified Purchase">
                  <FiCheckCircle /> Verified Purchase
                </span>
              )}
            </div>
            <div className="review-date">
              {format(new Date(review.created_at), 'MMMM dd, yyyy')}
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="review-actions">
            <button
              className="action-btn edit"
              onClick={() => onEdit(review)}
              title="Edit review"
            >
              <FiEdit2 />
            </button>
            <button
              className="action-btn delete"
              onClick={() => onDelete(review)}
              title="Delete review"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      <div className="review-rating">
        <div className="stars">
          {renderStars(review.rating)}
        </div>
        <span className="rating-value">{review.rating}/5</span>
      </div>

      {review.title && (
        <h4 className="review-title">{review.title}</h4>
      )}

      <p className="review-text">{review.review_text}</p>

      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="review-image"
            />
          ))}
        </div>
      )}

      <div className="review-footer">
        <button
          className={`helpful-btn ${isHelpful ? 'active' : ''}`}
          onClick={() => !isHelpful && markHelpfulMutation.mutate()}
          disabled={isHelpful || markHelpfulMutation.isLoading}
        >
          <FiThumbsUp />
          <span>Helpful ({review.helpful_count || 0})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
