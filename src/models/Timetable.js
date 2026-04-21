const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Staff ID is required"],
        },

        // Optional: link to a CourseAssignment for lesson-log tracking
        courseAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseAssignment",
            default: null,
        },

        // ── Direct fields (typed by staff) ──────────────────────────────────
        subjectName: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
        },

        semester: {
            type: Number,
            min: [1, "Semester must be at least 1"],
            max: [8, "Semester cannot exceed 8"],
            default: null,
        },

        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
        },

        workType: {
            type: String,
            enum: ["Teaching", "Lab", "Tutorial", "Activity"],
            default: "Teaching",
        },

        room: {
            type: String,
            trim: true,
            default: "",
        },

        // ── Schedule ─────────────────────────────────────────────────────────
        dayOfWeek: {
            type: String,
            required: [true, "Day of week is required"],
            enum: {
                values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                message: "{VALUE} is not a valid day",
            },
        },

        // 24-hour HH:MM strings e.g. "11:15", "10:00"
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
timetableSchema.index({ staffId: 1, dayOfWeek: 1 }); // Fast "today's classes" query
timetableSchema.index({ staffId: 1, isActive: 1 });

const TimetableModel = mongoose.model("Timetable", timetableSchema);

// One-time cleanup: drop the old unique index that was on
// (staffId, courseAssignmentId, dayOfWeek, section). Since
// courseAssignmentId is now optional (null), that index blocks insertMany.
mongodb_cleanup: {
    const dropOldIndex = async () => {
        try {
            await TimetableModel.collection.dropIndex(
                "staffId_1_courseAssignmentId_1_dayOfWeek_1_section_1"
            );
            console.log("[Timetable] Old unique index dropped.");
        } catch {
            // Index already dropped or never existed — safe to ignore
        }
    };
    if (mongoose.connection.readyState === 1) {
        dropOldIndex();
    } else {
        mongoose.connection.once("open", dropOldIndex);
    }
}

module.exports = TimetableModel;
