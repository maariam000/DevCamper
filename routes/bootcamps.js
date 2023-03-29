const express = require('express');
const {
  getBootcamps,
  getSingleBootcamp,
  updateBootcamp,
  createBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');
const advancedResult = require('../middleware/advancedResult');
// Including other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('Publisher', 'Admin'), createBootcamp);
router
  .route('/:id')
  .get(getSingleBootcamp)
  .put(protect, authorize('Publisher', 'Admin'), updateBootcamp)
  .delete(protect, authorize('Publisher', 'Admin'), deleteBootcamp);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;
