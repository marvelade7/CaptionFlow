const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitorSessionSchema = new Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
        },
        firstVisit: {
            type: Date,
            default: Date.now,
        },
        lastVisit: {
            type: Date,
            default: Date.now,
        },
        pagesVisited: {
            type: [String],
            default: [],
        },
        referrer: {
            type: String,
            default: "",
        },
        landingPage: {
            type: String,
            default: "",
        },
        deviceType: {
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
        country: {
            type: String,
            default: "",
        },
        region: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
        },
        isReturning: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

visitorSessionSchema.index({ createdAt: -1 });
visitorSessionSchema.index({ lastActiveAt: -1 });
visitorSessionSchema.index({ country: 1 });

module.exports = mongoose.model("VisitorSession", visitorSessionSchema);
