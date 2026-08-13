const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const errorLogSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
            enum: [
                "TRANSCRIPTION_ERROR",
                "UPLOAD_ERROR",
                "CLOUDINARY_ERROR",
                "AUTH_ERROR",
                "DATABASE_ERROR",
                "API_ERROR",
            ],
        },
        message: {
            type: String,
            required: true,
        },
        stack: {
            type: String,
            default: "",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
    },
    { timestamps: true }
);

errorLogSchema.index({ category: 1, createdAt: -1 });
errorLogSchema.index({ severity: 1 });
errorLogSchema.index({ userId: 1 });

module.exports = mongoose.model("ErrorLog", errorLogSchema);
