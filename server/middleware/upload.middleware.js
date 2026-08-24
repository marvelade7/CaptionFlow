const os = require("os");
const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.config");

// ── Cloudinary storage (profile pictures only) ─────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
        folder: "captionflow_profiles",
        resource_type: "image",
    }),
});

const profileFilter = (req, file, cb) => {
    const allowed = ["jpg", "jpeg", "png", "webp"];
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Unsupported image format"), false);
};

// ── Local disk storage (audio / video transcription uploads) ───────────────
// Files are written to the OS temp dir and cleaned up by the transcription
// service once Groq has finished processing them.
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `cf_${unique}${path.extname(file.originalname)}`);
    },
});

const audioVideoFilter = (req, file, cb) => {
    const allowed = ["mp3", "wav", "m4a", "flac", "mp4", "mov", "mkv", "webm"];
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Unsupported file format"), false);
};

// ── Named exports ──────────────────────────────────────────────────────────
// transcriptionUpload — local disk, for audio/video files
// profileUpload       — Cloudinary, for profile pictures
const transcriptionUpload = multer({
    storage: diskStorage,
    limits: { fileSize: 300 * 1024 * 1024 },
    fileFilter: audioVideoFilter,
});

const profileUpload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for images
    fileFilter: profileFilter,
});

// Keep a default export for any existing code that does require("./upload.middleware")
// (e.g. the auth routes that use upload.single("profilePicture"))
module.exports = profileUpload;
module.exports.transcriptionUpload = transcriptionUpload;
module.exports.profileUpload = profileUpload;
