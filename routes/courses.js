const express = require('express');
const {
  getCourses,
  createCourse,
  getSingleCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const Course = require('../models/Course');
const advancedResult = require('../middleware/advancedResult');

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');


router
  .route('/')
  .get(
    advancedResult(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, createCourse);
router
  .route('/:id')
  .get(getSingleCourse)
  .put(protect, authorize('Publisher', 'Admin'), updateCourse)
  .delete(protect, authorize('Publisher', 'Admin'), deleteCourse);

module.exports = router;
