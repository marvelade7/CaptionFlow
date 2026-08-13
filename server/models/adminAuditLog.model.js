const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminAuditLogSchema = new Schema(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        targetType: {
            type: String,
            default: "",
        },
        targetId: {
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
    },
    { timestamps: true }
);

adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ action: 1 });
adminAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
