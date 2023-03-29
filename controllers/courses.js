const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../middleware/error');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');

// @desc     Get all Courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  const { bootcampId } = req.params;
  if (bootcampId) {
    const courses = Course.find({ bootcamp: bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// Get single course
// @desc    Get a single course
// @route GET /api/v1/courses/:id

exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(`Course with the id of ${id} not found`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc     Create a new course
// @route    POST /api/v1/bootcamps/:bootcampId/courses
// @access   Private

exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(console.log('Bad request'));
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse(`User with the id of ${req.user.id} is unable to perform this action`,401));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!course) {
    return next(new ErrorResponse(`Course with id of ${id} not found`, 404));
  }
  // Ensure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${req.user.id} is unable to perform this action`,
        401
      )
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return next(new ErrorResponse(`Course with id of ${id} not found`));
  }

  // Ensure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${req.user.id} is unable to perform this action`,
        401
      )
    );
  }

  course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    msg: 'Bootcamp deleted!!!',
  });
});
