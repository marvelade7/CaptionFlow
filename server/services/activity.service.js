const ActivityLog = require("../models/activityLog.model");
const ErrorLog = require("../models/errorLog.model");

const logActivity = (eventType, userId = null, metadata = {}, req = null) => {
    let ipAddress = "";
    let userAgent = "";

    if (req) {
        ipAddress = req.ip || req.connection.remoteAddress || "";
        userAgent = req.headers["user-agent"] || "";
    }

    return ActivityLog.create({
        user: userId,
        eventType,
        metadata,
        ipAddress,
        userAgent,
    }).catch((err) => {
        // Do not throw, just log to console or error log
        console.error("Failed to log activity:", err.message);
        return ErrorLog.create({
            category: "DATABASE_ERROR",
            message: `Failed to log activity: ${err.message}`,
            userId,
            severity: "low",
        }).catch(() => {});
    });
};

module.exports = {
    logActivity,
};
