const Transcription = require("../models/transcription.model");
const cloudinary = require("../config/cloudinary.config");

// Upload file to Cloudinary
const uploadFile = (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    cloudinary.uploader.upload(file.path, {
        folder: "transcriptions",
        resource_type: "auto",
    })
        .then((result) => {
            const transcription = new Transcription({
                userId: req.user.id,
                originalFileName: file.originalname,
                cloudinaryUrl: result.secure_url,
                duration: result.duration,
                fileSize: result.bytes,
                language: req.body.language,
                status: "uploaded",
            });

            return transcription.save();
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
            res.status(500).json({ success: false, message: "Failed to upload file" });
        });
};

module.exports = { uploadFile };