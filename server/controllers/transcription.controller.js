const fs = require("fs");
const Transcription = require("../models/transcription.model");
const { transcribeAudioJob } = require("../services/transcription.service");
const { logActivity } = require("../services/activity.service");
const DownloadHistory = require("../models/downloadHistory.model");

const uploadFile = (req, res) => {
    const file = req.file;

    if (!file) {
        return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
    }

    const MAX_SIZE = 300 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return res
            .status(400)
            .json({ success: false, message: "File size exceeds 300MB limit" });
    }

    const validExtensions = [
        "mp3",
        "wav",
        "m4a",
        "flac",
        "mp4",
        "mov",
        "mkv",
        "webm",
    ];
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({
            success: false,
            message:
                "Unsupported file format. Allowed formats: mp3, wav, m4a, flac, mp4, mov, mkv, webm",
        });
    }

    // Save the record immediately — no Cloudinary upload needed.
    // Groq reads directly from the temp file on disk.
    const transcription = new Transcription({
        userId: req.user.id,
        originalFileName: file.originalname,
        fileSize: file.size,
        language: req.body.language || "en",
        status: "uploaded",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    transcription
        .save()
        .then((saved) => {
            // Fire-and-forget: Groq transcribes in the background,
            // updates the DB, then deletes the temp file.
            transcribeAudioJob(file.path, saved._id);
            
            // Log upload activity
            logActivity("FILE_UPLOADED", req.user.id, {
                fileSize: file.size,
                fileType: fileExtension,
            }, req);

            res.status(200).json({
                success: true,
                message: "File uploaded successfully. Transcription started.",
                data: saved,
            });
        })
        .catch((error) => {
            console.error("=== DB Save Error ===", error.message);
            // Clean up temp file if DB save fails
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            res.status(500).json({
                success: false,
                message: `Failed to save transcription record: ${error.message}`,
            });
        });
};

const getUserTranscriptions = (req, res) => {
    Transcription.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .then((items) => {
            res.status(200).json({ success: true, data: items });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch transcriptions",
            });
        });
};

const getTranscriptionById = (req, res) => {
    Transcription.findOne({ _id: req.params.id, userId: req.user.id })
        .then((item) => {
            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message: "Transcription not found",
                    });
            }

            res.status(200).json({ success: true, data: item });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch transcription",
            });
        });
};

const updateTranscriptionStatus = (req, res) => {
    const { status, transcript, errorMessage, processingTime } = req.body;

    Transcription.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        {
            status,
            transcript: transcript || "",
            errorMessage: errorMessage || "",
            processingTime: processingTime || 0,
        },
        { new: true },
    )
        .then((item) => {
            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message: "Transcription not found",
                    });
            }

            res.status(200).json({ success: true, data: item });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to update transcription",
            });
        });
};

const trackDownload = (req, res) => {
    const { format } = req.body;
    
    if (!["txt", "srt", "ass"].includes(format)) {
        return res.status(400).json({ success: false, message: "Invalid format" });
    }

    DownloadHistory.create({
        user: req.user.id,
        transcription: req.params.id,
        format,
        ipAddress: req.ip || req.connection.remoteAddress || "",
        userAgent: req.headers["user-agent"] || "",
    })
    .then(() => {
        // Also log the activity
        logActivity("FILE_DOWNLOADED", req.user.id, { format, transcriptionId: req.params.id }, req);
        res.status(200).json({ success: true });
    })
    .catch((err) => {
        console.error("Failed to track download:", err);
        res.status(500).json({ success: false, message: "Failed to track download" });
    });
};

module.exports = {
    uploadFile,
    getUserTranscriptions,
    getTranscriptionById,
    updateTranscriptionStatus,
    trackDownload,
};
