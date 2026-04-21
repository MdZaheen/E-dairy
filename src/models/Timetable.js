const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        // Link to the course this slot belongs to
        courseAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseAssignment",
            required: [true, "Course assignment is required"],
        },

        // Denormalized for fast daily lookup without extra join
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Staff ID is required"],
        },

        dayOfWeek: {
            type: String,
            required: [true, "Day of week is required"],
            enum: {
                values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                message: "{VALUE} is not a valid day",
            },
        },

        // 24-hour format strings e.g. "11:15", "10:00"
        startTime: {
            type: String,
            required: [true, "Start time is required"],
            match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
        },

        endTime: {
            type: String,
            required: [true, "End time is required"],
            match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
        },

        // The specific section for this slot (one slot per section)
        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
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
timetableSchema.index({ staffId: 1 });
timetableSchema.index({ staffId: 1, dayOfWeek: 1 });                      // Fast "today's classes" query
timetableSchema.index({ courseAssignmentId: 1 });
timetableSchema.index({ staffId: 1, courseAssignmentId: 1, dayOfWeek: 1, section: 1 }, { unique: true }); // No duplicate slots

module.exports = mongoose.model("Timetable", timetableSchema);
