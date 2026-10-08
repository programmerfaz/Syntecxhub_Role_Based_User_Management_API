const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
    getUsers,
    getUser,
    blockUser,
    unblockUser,
    promoteUser,
    demoteUser,
    getAuditLogs,
} = require('../controllers/adminController');

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/users', asyncHandler(getUsers));
router.get('/audit-logs', asyncHandler(getAuditLogs));
router.get('/users/:id', asyncHandler(getUser));
router.patch('/users/:id/block', asyncHandler(blockUser));
router.patch('/users/:id/unblock', asyncHandler(unblockUser));
router.patch('/users/:id/promote', asyncHandler(promoteUser));
router.patch('/users/:id/demote', asyncHandler(demoteUser));

module.exports = router;
