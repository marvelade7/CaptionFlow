const { getDashboardStats, getDailyStats } = require("../services/analytics.service");
const User = require("../models/user.model");
const Transcription = require("../models/transcription.model");
const VisitorSession = require("../models/visitorSession.model");
const DownloadHistory = require("../models/downloadHistory.model");
const ActivityLog = require("../models/activityLog.model");
const LoginHistory = require("../models/loginHistory.model");
const ErrorLog = require("../models/errorLog.model");
const AdminAuditLog = require("../models/adminAuditLog.model");

// Helper to log admin actions
const logAdminAction = (adminId, action, targetType = "", targetId = null, metadata = {}, req) => {
    AdminAuditLog.create({
        adminId,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress: req ? (req.ip || req.connection.remoteAddress || "") : "",
    }).catch(() => {});
};

const getDashboard = (req, res) => {
    getDashboardStats()
        .then((stats) => {
            res.status(200).json({ success: true, data: stats });
        })
        .catch((err) => {
            console.error("Dashboard error:", err);
            res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
        });
};

const getAnalytics = (req, res) => {
    const range = req.query.range || "30d";
    getDailyStats(range)
        .then((stats) => {
            res.status(200).json({ success: true, data: stats });
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: "Failed to fetch analytics" });
        });
};

const getUsers = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
        query.$or = [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ];
    }

    Promise.all([
        User.countDocuments(query),
        User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]).then(([total, users]) => {
        logAdminAction(req.user.id, "ADMIN_VIEWED_USERS", "User", null, { page, limit }, req);
        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }).catch(err => res.status(500).json({ success: false, message: err.message }));
};

const getUserById = (req, res) => {
    User.findById(req.params.id).select("-password")
        .then(user => {
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            logAdminAction(req.user.id, "ADMIN_VIEWED_USER", "User", user._id, {}, req);
            res.status(200).json({ success: true, data: user });
        })
        .catch(err => res.status(500).json({ success: false, message: err.message }));
};

const getTranscriptions = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.userId) query.userId = req.query.userId;

    Promise.all([
        Transcription.countDocuments(query),
        Transcription.find(query).populate("userId", "firstName lastName email").sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]).then(([total, transcriptions]) => {
        res.status(200).json({
            success: true,
            data: transcriptions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }).catch(err => res.status(500).json({ success: false, message: err.message }));
};

const getLogins = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        LoginHistory.countDocuments(),
        LoginHistory.find().populate("user", "firstName lastName email").sort({ loginAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, logins]) => {
        res.status(200).json({ success: true, data: logins, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

const getActivity = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        ActivityLog.countDocuments(),
        ActivityLog.find().populate("user", "firstName lastName email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, activity]) => {
        res.status(200).json({ success: true, data: activity, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

const getDownloads = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        DownloadHistory.countDocuments(),
        DownloadHistory.find().populate("user", "firstName lastName email").populate("transcription", "originalFileName").sort({ downloadedAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, downloads]) => {
        res.status(200).json({ success: true, data: downloads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

const getVisitors = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        VisitorSession.countDocuments(),
        VisitorSession.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, visitors]) => {
        res.status(200).json({ success: true, data: visitors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

const getErrors = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        ErrorLog.countDocuments(),
        ErrorLog.find().populate("userId", "firstName lastName email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, errors]) => {
        res.status(200).json({ success: true, data: errors, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

const getAuditLogs = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    
    Promise.all([
        AdminAuditLog.countDocuments(),
        AdminAuditLog.find().populate("adminId", "firstName lastName email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    ]).then(([total, logs]) => {
        res.status(200).json({ success: true, data: logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }).catch(err => res.status(500).json({ success: false }));
};

module.exports = {
    getDashboard,
    getAnalytics,
    getUsers,
    getUserById,
    getTranscriptions,
    getLogins,
    getActivity,
    getDownloads,
    getVisitors,
    getErrors,
    getAuditLogs
};
