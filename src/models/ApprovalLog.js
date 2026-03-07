const mongoose = require("mongoose");

const approvalLogSchema = new mongoose.Schema(
    {
        diaryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Diary",
            required: [true, "Diary entry ID is required"],
        },

        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Action by (HOD) ID is required"],
        },

        action: {
            type: String,
            required: [true, "Action is required"],
            enum: {
                values: ["Approved", "Rejected"],
                message: "{VALUE} is not a valid action. Must be 'Approved' or 'Rejected'",
            },
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true, // createdAt = when the action was taken
    }
);

// ============================================
// INDEXES — Speed up frequent queries
// ============================================
approvalLogSchema.index({ diaryId: 1 });           // Find all logs for a diary entry
approvalLogSchema.index({ actionBy: 1 });           // Find all actions by an HOD
approvalLogSchema.index({ diaryId: 1, actionBy: 1 }); // Compound: specific entry + HOD

module.exports = mongoose.model("ApprovalLog", approvalLogSchema);
