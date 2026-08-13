const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const transcriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    originalFileName: {
        type: String,
        required: true,
    },
    cloudinaryUrl: {
        type: String,
        default: "", // No longer storing audio on Cloudinary
    },
    duration: {
        type: Number,
        default: 0,  // Updated after transcription completes
    },
    fileSize: {
        type: Number,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    transcript: {
        type: String,
        default: "",  // Populated by Groq after transcription
    },
    segments: {
        type: [{
            start: Number,
            end: Number,
            text: String,
        }],
        default: [],  // Per-sentence timestamps from Groq verbose_json
    },
    status: {
        type: String,
        required: true,
        enum: ["uploaded", "queued", "processing", "completed", "failed"],
        default: "uploaded",
    },
    processingTime: {
        type: Number,
        default: 0,
    },
    errorMessage: {
        type: String,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    summary: {
        text: { type: String, default: null },
        generatedAt: { type: Date, default: null },
    },
    excerpts: {
        items: [{ type: String }],
        generatedAt: { type: Date, default: null },
    },
    aiProcessingStatus: {
        type: String,
        enum: ["not_requested", "processing", "completed", "failed"],
        default: "not_requested",
    },
    // ── Analytics / lifecycle timestamps ────────────────────────────
    startedAt: {
        type: Date,
        default: null,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    failedAt: {
        type: Date,
        default: null,
    },
    // ── Chunk analytics ──────────────────────────────────────────
    chunkCount: {
        type: Number,
        default: 0,
    },
    successfulChunks: {
        type: Number,
        default: 0,
    },
    failedChunks: {
        type: Number,
        default: 0,
    },
});

// ── Indexes ──────────────────────────────────────────────────────────────────
transcriptionSchema.index({ userId: 1, createdAt: -1 });
transcriptionSchema.index({ status: 1, createdAt: -1 });
transcriptionSchema.index({ createdAt: -1 });
transcriptionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Transcription", transcriptionSchema);