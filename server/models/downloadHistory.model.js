const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const downloadHistorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transcription: {
            type: Schema.Types.ObjectId,
            ref: "Transcription",
            required: true,
        },
        format: {
            type: String,
            required: true,
            enum: ["txt", "srt", "ass", "summary", "excerpts"],
        },
        downloadedAt: {
            type: Date,
            default: Date.now,
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

downloadHistorySchema.index({ user: 1, downloadedAt: -1 });
downloadHistorySchema.index({ transcription: 1 });
downloadHistorySchema.index({ format: 1, downloadedAt: -1 });

module.exports = mongoose.model("DownloadHistory", downloadHistorySchema);
