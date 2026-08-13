const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginHistorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        loginAt: {
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
        browser: {
            type: String,
            default: "",
        },
        operatingSystem: {
            type: String,
            default: "",
        },
        deviceType: {
            type: String,
            default: "",
        },
        success: {
            type: Boolean,
            required: true,
        },
        failureReason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

loginHistorySchema.index({ user: 1, loginAt: -1 });
loginHistorySchema.index({ loginAt: -1 });
loginHistorySchema.index({ success: 1 });

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
