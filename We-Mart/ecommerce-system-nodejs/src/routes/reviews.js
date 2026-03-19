const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews.bind(reviewController));
router.get('/product/:productId/stats', reviewController.getProductRatingStats.bind(reviewController));
router.get('/:id', reviewController.getReview.bind(reviewController));

// Authenticated user routes
router.use(authenticate);

router.post('/', reviewController.createReview.bind(reviewController));
router.get('/user/my-reviews', reviewController.getUserReviews.bind(reviewController));
router.put('/:id', reviewController.updateReview.bind(reviewController));
router.delete('/:id', reviewController.deleteReview.bind(reviewController));
router.post('/:id/helpful', reviewController.markHelpful.bind(reviewController));

// Admin routes
router.put(
  '/admin/:id/moderate',
  hasPermission('product_update'),
  reviewController.moderateReview.bind(reviewController)
);

module.exports = router;
