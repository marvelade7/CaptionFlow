const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [
        // audio / video
        "mp3",
        "wav",
        "m4a",
        "flac",
        "mp4",
        "mov",
        "mkv",
        "webm",
        // images (for profile pictures)
        "jpg",
        "jpeg",
        "png",
        "webp",
    ];
    const extension = path.extname(file.originalname).toLowerCase().slice(1);

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 300 * 1024 * 1024,
    },
    fileFilter,
});

module.exports = upload;
