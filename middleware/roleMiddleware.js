const User = require('../models/userModel');

const authorizeRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden - admin access only' });
            }

            const user = await User.findById(req.user.id);
            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden - admin access only' });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authorizeRoles;
