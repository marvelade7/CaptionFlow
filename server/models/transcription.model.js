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
});

module.exports = mongoose.model("Transcription", transcriptionSchema);