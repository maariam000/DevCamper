const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../middleware/error');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const Review = require('../models/Review');

// @desc     Get all Reviews
// @route    GET /api/v1/reviews
// @route    GET /api/v1/bootcamps/:bootcampId/reviews
// @access   Public

exports.getReviews = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;
  if (bootcampId) {
    const reviews = await Review.find({ bootcamp: bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
    console.log(bootcampId);
  } else {
    res.status(200).json(res.advancedResult);
  }
});

// @desc     Get single Review
// @route    GET /api/v1/reviews/:id
// @access   Public

exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc     Create Review
// @route    POST /api/v1/bootcamps/:bootcampId/reviews
// @access   Private

exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id of ${req.params.bootcampId} not found`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc     Update Review
// @route    PUT /api/v1/reviews/:id
// @access   Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${req.params.id} is not authorized to perform this action`,
        401
      )
    );
  }

  review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc     Delete Review
// @access   DELETE api/v1/reviews/:id
// @access Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Course.findById(id);
  if (!review) {
    return next(new ErrorResponse(`Review with id of ${id} not found`, 404));
  }

  // Ensure user is authorized
  if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${req.user.id} is unable to perform this action`,
        401
      )
    );
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    msg: 'Review Deleted!!!',
  });
});
