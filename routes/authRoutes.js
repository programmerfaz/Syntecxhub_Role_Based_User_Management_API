const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const { signup, login, getMe } = require('../controllers/authController');

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getMe));

module.exports = router;
