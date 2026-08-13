/**
 * adminApi.js — Centralized service layer for all admin API calls.
 *
 * Reuses the shared `api` Axios instance which automatically:
 *  - Attaches the JWT Bearer token on every request
 *  - Dispatches "auth:expired" on 401 responses
 *
 * All functions return the Axios promise directly so callers can
 * use .then()/.catch() or async/await as preferred.
 *
 * Expected API base: /api/admin/*
 * All endpoints require: authenticated user with role === "admin"
 */
import api from "./api";

// ── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Returns platform-wide aggregate stats.
 *
 * Response shape:
 * {
 *   success: true,
 *   data: {
 *     users: { total, regular },
 *     transcriptions: { total, completed, failed, processing, totalAudioDuration, averageAudioDuration, averageProcessingTime },
 *     downloads: { total },
 *     visitors: { total }
 *   }
 * }
 */
export const getAdminDashboard = () => api.get("/admin/dashboard");

// ── Analytics ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/analytics?range=<range>
 * @param {"today"|"7d"|"30d"|"90d"} range
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [
 *     { date: "2026-08-01", visitors: 12, signups: 3, transcriptions: 8, downloads: 5 },
 *     ...
 *   ]
 * }
 */
export const getAdminAnalytics = (range = "30d") =>
    api.get("/admin/analytics", { params: { range } });

// ── Users ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users?page=&limit=&search=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, firstName, lastName, email, role, createdAt, lastLoginAt, loginCount } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminUsers = ({ page = 1, limit = 20, search = "" } = {}) =>
    api.get("/admin/users", { params: { page, limit, search: search || undefined } });

/**
 * GET /api/admin/users/:id
 *
 * Response shape:
 * {
 *   success: true,
 *   data: { _id, firstName, lastName, email, role, createdAt, lastLoginAt, loginCount, lastActivityAt, profilePicture }
 * }
 */
export const getAdminUser = (id) => api.get(`/admin/users/${id}`);

// ── Transcriptions ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/transcriptions?page=&limit=&status=&userId=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, userId: { firstName, lastName, email }, originalFileName, fileSize, duration, status, processingTime, createdAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminTranscriptions = ({ page = 1, limit = 20, status = "", userId = "" } = {}) =>
    api.get("/admin/transcriptions", {
        params: {
            page,
            limit,
            status: status || undefined,
            userId: userId || undefined,
        },
    });

// ── Activity ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/activity?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, user: { firstName, lastName, email }, eventType, resourceType, metadata, createdAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminActivity = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/activity", { params: { page, limit } });

// ── Downloads ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/downloads?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, user: { firstName, lastName, email }, transcription: { originalFileName }, format, downloadedAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminDownloads = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/downloads", { params: { page, limit } });

// ── Logins ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/logins?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, user: { firstName, lastName, email }, loginAt, ipAddress, userAgent } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminLogins = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/logins", { params: { page, limit } });

// ── Visitors ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/visitors?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, sessionId, page, ipAddress, userAgent, createdAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminVisitors = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/visitors", { params: { page, limit } });

// ── Errors ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/errors?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, userId: { firstName, lastName, email }, errorType, message, severity, createdAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminErrors = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/errors", { params: { page, limit } });

// ── Audit Logs ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/audit-logs?page=&limit=
 *
 * Response shape:
 * {
 *   success: true,
 *   data: [ { _id, adminId: { firstName, lastName, email }, action, targetType, targetId, metadata, ipAddress, createdAt } ],
 *   pagination: { page, limit, total, totalPages }
 * }
 */
export const getAdminAuditLogs = ({ page = 1, limit = 20 } = {}) =>
    api.get("/admin/audit-logs", { params: { page, limit } });
