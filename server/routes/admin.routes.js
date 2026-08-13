const express = require("express");
const rateLimit = require("express-rate-limit");
const protect = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const {
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
} = require("../controllers/admin.controller");

const router = express.Router();

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Protect all admin routes
router.use(protect);
router.use(admin);
router.use(adminLimiter);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.get("/transcriptions", getTranscriptions);
router.get("/logins", getLogins);
router.get("/activity", getActivity);
router.get("/downloads", getDownloads);
router.get("/visitors", getVisitors);
router.get("/errors", getErrors);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
