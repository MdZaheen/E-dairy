const CourseAssignment = require("../models/CourseAssignment");
const Subject = require("../models/Subject");
const User = require("../models/User");

// ============================================
// @desc    Create a new course assignment for the logged-in staff
// @route   POST /api/courses
// @access  Staff
// ============================================
const createCourseAssignment = async (req, res) => {
    try {
        const staffId = req.user._id;
        const { subjectId, semester, sections, courseCode, term, totalHours } = req.body;

        // Validate the subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Validate sections is a non-empty array
        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ success: false, message: "At least one section is required" });
        }

        const assignment = await CourseAssignment.create({
            staffId,
            subjectId,
            semester,
            sections,
            courseCode: courseCode || "",
            term: term || "",
            totalHours: totalHours || 40,
        });

        const populated = await CourseAssignment.findById(assignment._id)
            .populate("subjectId", "subjectName subjectCode");

        res.status(201).json({
            success: true,
            message: "Course assignment created successfully",
            data: populated,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get all course assignments for the logged-in staff
// @route   GET /api/courses/my
// @access  Staff
// ============================================
const getMyCourses = async (req, res) => {
    try {
        const assignments = await CourseAssignment.find({
            staffId: req.user._id,
            isActive: true,
        })
            .populate("subjectId", "subjectName subjectCode departmentId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Update a course assignment
// @route   PUT /api/courses/:id
// @access  Staff (own records only)
// ============================================
const updateCourseAssignment = async (req, res) => {
    try {
        const assignment = await CourseAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Course assignment not found" });
        }

        // Only owner can update
        if (assignment.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only update your own course assignments" });
        }

        const allowedFields = ["sections", "courseCode", "term", "totalHours", "isActive"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                assignment[field] = req.body[field];
            }
        });

        await assignment.save();

        const updated = await CourseAssignment.findById(assignment._id)
            .populate("subjectId", "subjectName subjectCode");

        res.status(200).json({
            success: true,
            message: "Course assignment updated successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Soft-delete (deactivate) a course assignment
// @route   DELETE /api/courses/:id
// @access  Staff (own records only)
// ============================================
const deleteCourseAssignment = async (req, res) => {
    try {
        const assignment = await CourseAssignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Course assignment not found" });
        }

        if (assignment.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own course assignments" });
        }

        assignment.isActive = false;
        await assignment.save();

        res.status(200).json({
            success: true,
            message: "Course assignment removed successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    createCourseAssignment,
    getMyCourses,
    updateCourseAssignment,
    deleteCourseAssignment,
};
