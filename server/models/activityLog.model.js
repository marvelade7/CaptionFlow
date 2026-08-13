const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityLogSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        eventType: {
            type: String,
            required: true,
            enum: [
                "USER_REGISTERED",
                "USER_LOGGED_IN",
                "USER_LOGOUT",
                "FILE_UPLOADED",
                "TRANSCRIPTION_STARTED",
                "TRANSCRIPTION_COMPLETED",
                "TRANSCRIPTION_FAILED",
                "FILE_DOWNLOADED",
                "SUMMARY_GENERATED",
                "EXCERPTS_GENERATED",
                "ACCOUNT_UPDATED",
                "ACCOUNT_DELETED",
            ],
        },
        resourceType: {
            type: String,
            default: "",
        },
        resourceId: {
            type: Schema.Types.ObjectId,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ eventType: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
