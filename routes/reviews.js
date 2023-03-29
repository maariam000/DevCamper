const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
const advancedResult = require('../middleware/advancedResult');
const { authorize, protect } = require('../middleware/auth');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResult(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('User', 'Admin'), createReview);
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('User', 'Admin'), updateReview)
  .delete(protect, authorize('User', 'Admin'), deleteReview);


module.exports = router;
