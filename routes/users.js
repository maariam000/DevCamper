const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const advancedResult = require('../middleware/advancedResult');

const User = require('../models/User');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize('Admin'));

router.route('/').get(advancedResult(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
