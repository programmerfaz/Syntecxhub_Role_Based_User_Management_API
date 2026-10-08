const mongoose = require('mongoose');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');
const logAction = require('../utils/audit');

const formatUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
});

const findUserById = async (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Invalid user id' });
        return null;
    }

    const user = await User.findById(id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return null;
    }

    return user;
};

const getUsers = async (req, res) => {
    const filter = {};

    if (req.query.role) {
        filter.role = req.query.role;
    }

    if (req.query.isBlocked === 'true') {
        filter.isBlocked = true;
    }

    if (req.query.isBlocked === 'false') {
        filter.isBlocked = false;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
        count: users.length,
        users: users.map(formatUser),
    });
};

const getUser = async (req, res) => {
    const user = await findUserById(req.params.id, res);
    if (!user) {
        return;
    }

    res.status(200).json(formatUser(user));
};

const blockUser = async (req, res) => {
    const user = await findUserById(req.params.id, res);
    if (!user) {
        return;
    }

    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'You cannot block your own account' });
    }

    if (user.isBlocked) {
        return res.status(400).json({ message: 'User is already blocked' });
    }

    user.isBlocked = true;
    await user.save();

    await logAction({
        actor: req.user.id,
        action: 'USER_BLOCKED',
        targetUser: user._id,
        details: `Blocked ${user.username}`,
    });

    res.status(200).json({
        message: 'User blocked',
        user: formatUser(user),
    });
};

const unblockUser = async (req, res) => {
    const user = await findUserById(req.params.id, res);
    if (!user) {
        return;
    }

    if (!user.isBlocked) {
        return res.status(400).json({ message: 'User is not blocked' });
    }

    user.isBlocked = false;
    await user.save();

    await logAction({
        actor: req.user.id,
        action: 'USER_UNBLOCKED',
        targetUser: user._id,
        details: `Unblocked ${user.username}`,
    });

    res.status(200).json({
        message: 'User unblocked',
        user: formatUser(user),
    });
};

const promoteUser = async (req, res) => {
    const user = await findUserById(req.params.id, res);
    if (!user) {
        return;
    }

    if (user.role === 'admin') {
        return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    await logAction({
        actor: req.user.id,
        action: 'USER_PROMOTED',
        targetUser: user._id,
        details: `Promoted ${user.username} to admin`,
    });

    res.status(200).json({
        message: 'User promoted to admin. They need to log in again for the new role to apply.',
        user: formatUser(user),
    });
};

const demoteUser = async (req, res) => {
    const user = await findUserById(req.params.id, res);
    if (!user) {
        return;
    }

    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'You cannot demote your own account' });
    }

    if (user.role === 'user') {
        return res.status(400).json({ message: 'User is already a regular user' });
    }

    user.role = 'user';
    await user.save();

    await logAction({
        actor: req.user.id,
        action: 'USER_DEMOTED',
        targetUser: user._id,
        details: `Demoted ${user.username} to user`,
    });

    res.status(200).json({
        message: 'User demoted to user',
        user: formatUser(user),
    });
};

const getAuditLogs = async (req, res) => {
    const filter = {};

    if (req.query.action) {
        filter.action = req.query.action;
    }

    if (req.query.user) {
        if (!mongoose.Types.ObjectId.isValid(req.query.user)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        filter.actor = req.query.user;
    }

    if (req.query.target) {
        if (!mongoose.Types.ObjectId.isValid(req.query.target)) {
            return res.status(400).json({ message: 'Invalid target id' });
        }
        filter.targetUser = req.query.target;
    }

    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
            filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            const end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    const logs = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .populate('actor', 'username email role')
        .populate('targetUser', 'username email role');

    res.status(200).json({
        count: logs.length,
        logs,
    });
};

module.exports = {
    getUsers,
    getUser,
    blockUser,
    unblockUser,
    promoteUser,
    demoteUser,
    getAuditLogs,
};
