const express = require("express");
const upload = require("../middleware/upload.middleware");
const protect = require("../middleware/auth.middleware");
const {
    uploadFile,
    getUserTranscriptions,
    getTranscriptionById,
    updateTranscriptionStatus,
    trackDownload,
} = require("../controllers/transcription.controller");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getUserTranscriptions);
router.get("/:id", protect, getTranscriptionById);
router.patch("/:id/status", protect, updateTranscriptionStatus);
router.post("/:id/download", protect, trackDownload);

module.exports = router;
