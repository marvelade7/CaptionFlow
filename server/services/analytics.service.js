const User = require("../models/user.model");
const Transcription = require("../models/transcription.model");
const VisitorSession = require("../models/visitorSession.model");
const DownloadHistory = require("../models/downloadHistory.model");
const ActivityLog = require("../models/activityLog.model");

// Helper for date ranges
const getDateFilter = (range) => {
    const now = new Date();
    const filter = {};
    if (range === "today") {
        const start = new Date(now.setHours(0, 0, 0, 0));
        filter.$gte = start;
    } else if (range === "7d") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        filter.$gte = start;
    } else if (range === "30d") {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        filter.$gte = start;
    } else if (range === "90d") {
        const start = new Date();
        start.setDate(start.getDate() - 90);
        filter.$gte = start;
    }
    return filter;
};

const getDashboardStats = () => {
    return Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "user" }),
        Transcription.countDocuments(),
        Transcription.countDocuments({ status: "completed" }),
        Transcription.countDocuments({ status: "failed" }),
        Transcription.countDocuments({ status: "processing" }),
        Transcription.aggregate([{ $group: { _id: null, totalDuration: { $sum: "$duration" }, avgDuration: { $avg: "$duration" }, avgProcessingTime: { $avg: "$processingTime" } } }]),
        DownloadHistory.countDocuments(),
        VisitorSession.countDocuments(),
    ]).then(([
        totalUsers,
        regularUsers,
        totalTranscriptions,
        completedTranscriptions,
        failedTranscriptions,
        processingTranscriptions,
        transcriptionAgg,
        totalDownloads,
        totalVisitors
    ]) => {
        const tStats = transcriptionAgg[0] || { totalDuration: 0, avgDuration: 0, avgProcessingTime: 0 };
        
        return {
            users: {
                total: totalUsers,
                regular: regularUsers,
            },
            transcriptions: {
                total: totalTranscriptions,
                completed: completedTranscriptions,
                failed: failedTranscriptions,
                processing: processingTranscriptions,
                totalAudioDuration: tStats.totalDuration,
                averageAudioDuration: tStats.avgDuration,
                averageProcessingTime: tStats.avgProcessingTime,
            },
            downloads: {
                total: totalDownloads,
            },
            visitors: {
                total: totalVisitors,
            }
        };
    });
};

const getDailyStats = (range) => {
    const filter = getDateFilter(range);
    const matchStage = filter.$gte ? { createdAt: filter } : {};
    
    return Promise.all([
        VisitorSession.aggregate([
            { $match: matchStage },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
        ]),
        User.aggregate([
            { $match: matchStage },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
        ]),
        Transcription.aggregate([
            { $match: matchStage },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
        ]),
        DownloadHistory.aggregate([
            { $match: filter.$gte ? { downloadedAt: filter } : {} },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } }, count: { $sum: 1 } } }
        ])
    ]).then(([visitors, users, transcriptions, downloads]) => {
        const statsByDate = {};
        
        const addStat = (arr, key) => {
            arr.forEach(item => {
                if (!statsByDate[item._id]) statsByDate[item._id] = { date: item._id, visitors: 0, signups: 0, transcriptions: 0, downloads: 0 };
                statsByDate[item._id][key] = item.count;
            });
        };
        
        addStat(visitors, "visitors");
        addStat(users, "signups");
        addStat(transcriptions, "transcriptions");
        addStat(downloads, "downloads");
        
        return Object.values(statsByDate).sort((a, b) => (a.date > b.date ? 1 : -1));
    });
};

module.exports = {
    getDashboardStats,
    getDailyStats,
};
