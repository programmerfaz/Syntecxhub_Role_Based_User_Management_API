const AuditLog = require('../models/auditLogModel');

const logAction = async ({ actor, action, targetUser, details }) => {
    await AuditLog.create({
        actor,
        action,
        targetUser,
        details,
    });
};

module.exports = logAction;
