const mongoose = require("mongoose");

const courseAssignmentSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Staff ID is required"],
        },

        // Free-text subject name entered by staff
        subjectName: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
        },

        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [1, "Semester must be at least 1"],
            max: [8, "Semester cannot exceed 8"],
        },

        // Staff may teach multiple sections of the same subject
        sections: {
            type: [String],
            required: [true, "At least one section is required"],
            validate: {
                validator: (arr) => arr.length > 0,
                message: "At least one section must be provided",
            },
        },

        courseCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },

        // Academic term label e.g. "Even Sem 2026"
        term: {
            type: String,
            trim: true,
            default: "",
        },

        // Total planned contact hours for this course (e.g. 40)
        totalHours: {
            type: Number,
            min: [1, "Total hours must be at least 1"],
            default: 40,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// ============================================
// INDEXES
// ============================================
courseAssignmentSchema.index({ staffId: 1 });
courseAssignmentSchema.index({ staffId: 1, isActive: 1 });

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema);
