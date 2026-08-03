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
        required: true,
    },
    duration: {
        type: Number,
        required: true,
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
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["uploaded", "queued", "processing", "completed", "failed"],
        default: "uploaded",
    },
    processingTime: {
        type: Number,
        required: true,
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