const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc      Get all Bootcamps
// @route     GET api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

// @desc      Get single Bootcamp
// @route     GET api/v1/bootcamps/:id
// @access    Public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id of ${id} not found `, 404));
  }
  res.status(200).json({
    success: true,
    count: bootcamp.length,
    data: bootcamp,
  });
});

// @desc      Create new Bootcamp
// @route     POST api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${req.user.id} already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Update Bootcamp
// @route     POST api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${id} is unable to perform this action`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Delete Bootcamp
// @route     DELETE api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${id} is unable to perform this action`,
        401
      )
    );
  }

  bootcamp.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    msg: 'Bootcamp Deleted!',
  });
});

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id of ${id} not found`, 404));
  }

  // Ensure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(
      new ErrorResponse(
        `User with the id of ${id} is unable to perform this action`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const { file } = req.files;

  // Validation
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Not an image file!!`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Image size is greater than ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `Photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
