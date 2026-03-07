const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
        },

        subjectCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"],
        },

        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [1, "Semester must be at least 1"],
            max: [8, "Semester cannot exceed 8"],
        },
    },
    {
        timestamps: true,
    }
);

// ============================================
// INDEXES — Speed up frequent queries
// ============================================
subjectSchema.index({ departmentId: 1 });                    // Subjects by department
subjectSchema.index({ departmentId: 1, semester: 1 });       // Subjects by dept + semester
subjectSchema.index({ subjectCode: 1 }, { sparse: true });   // Lookup by code (if provided)

module.exports = mongoose.model("Subject", subjectSchema);
