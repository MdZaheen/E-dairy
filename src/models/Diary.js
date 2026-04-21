const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Staff ID is required"],
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department ID is required"],
        },

        date: {
            type: Date,
            required: [true, "Date is required"],
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },

        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [1, "Semester must be at least 1"],
            max: [8, "Semester cannot exceed 8"],
        },

        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
        },

        hoursTaken: {
            type: Number,
            required: [true, "Hours taken is required"],
            min: [1, "Hours must be at least 1"],
            max: [8, "Hours cannot exceed 8 per day"],
        },

        workType: {
            type: String,
            required: [true, "Work type is required"],
            enum: {
                values: ["Teaching", "Lab", "Exam", "Meeting", "Admin"],
                message: "{VALUE} is not a valid work type",
            },
        },

        description: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: {
                values: ["Pending", "Approved", "Rejected"],
                message: "{VALUE} is not a valid status",
            },
            default: "Pending",
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        // ============ SMART TIMETABLE FIELDS ============

        // Reference to the timetable slot that generated this entry (null for manual entries)
        timetableSlotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Timetable",
            default: null,
        },

        // Reference to the course assignment (null for manual entries)
        courseAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseAssignment",
            default: null,
        },

        // Auto-incremented lesson number per course+section (null for manual entries)
        lessonNo: {
            type: Number,
            default: null,
        },

        // Marks if the class was not taken (cancelled, holiday, etc.)
        notTaken: {
            type: Boolean,
            default: false,
        },

        // Reason provided when class was not taken
        notTakenReason: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// ============================================
// INDEXES — Speed up frequent queries
// ============================================
diarySchema.index({ staffId: 1 });        // Find all entries by a staff member
diarySchema.index({ departmentId: 1 });   // Find all entries in a department
diarySchema.index({ date: 1 });           // Find entries by date / date range
diarySchema.index({ staffId: 1, date: 1 }); // Compound: staff's entries on a date

module.exports = mongoose.model("Diary", diarySchema);
