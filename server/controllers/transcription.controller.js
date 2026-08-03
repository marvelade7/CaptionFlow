const fs = require("fs");
const Transcription = require("../models/transcription.model");
const cloudinary = require("../config/cloudinary.config");

const uploadFile = (req, res) => {
    const file = req.file;

    if (!file) {
        return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
    }

    const MAX_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        return res
            .status(400)
            .json({ success: false, message: "File size exceeds 200MB limit" });
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

    cloudinary.uploader
        .upload(file.path, {
            folder: "transcriptions",
            resource_type: "auto",
        })
        .then((result) => {
            if (result.duration && result.duration > 600) {
                return cloudinary.uploader
                    .destroy(result.public_id)
                    .then(() => {
                        throw new Error("Duration exceeds 10 minutes limit");
                    });
            }

            const transcription = new Transcription({
                userId: req.user.id,
                originalFileName: file.originalname,
                cloudinaryUrl: result.secure_url,
                duration: result.duration || 0,
                fileSize: result.bytes || file.size,
                language: req.body.language || "en",
                transcript: "",
                status: "uploaded",
                processingTime: 0,
                errorMessage: "",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            return transcription.save().then((saved) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return saved;
            });
        })
        .then((transcription) => {
            res.status(200).json({
                success: true,
                message: "File uploaded successfully",
                data: transcription,
            });
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            const message =
                error.message === "Duration exceeds 10 minutes limit"
                    ? error.message
                    : "Failed to upload file";
            const statusCode =
                error.message === "Duration exceeds 10 minutes limit"
                    ? 400
                    : 500;

            res.status(statusCode).json({ success: false, message });
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

module.exports = {
    uploadFile,
    getUserTranscriptions,
    getTranscriptionById,
    updateTranscriptionStatus,
};
