const Diary = require("../models/Diary");

// ============================================
// STAFF OPERATIONS
// ============================================

// @desc    Add a new diary entry
// @route   POST /api/diary
// @access  Staff
const addEntry = async (req, res) => {
    try {
        const { date, subject, semester, section, hoursTaken, workType, description } = req.body;

        const entry = await Diary.create({
            staffId: req.user._id,
            departmentId: req.user.departmentId,
            date,
            subject,
            semester,
            section,
            hoursTaken,
            workType,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Diary entry added successfully",
            data: entry,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get own diary entries
// @route   GET /api/diary/my-entries
// @access  Staff
const getMyEntries = async (req, res) => {
    try {
        const entries = await Diary.find({ staffId: req.user._id })
            .sort({ date: -1 })
            .populate("departmentId", "departmentName")
            .populate("approvedBy", "name");

        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Update diary entry (only if status is Pending)
// @route   PUT /api/diary/:id
// @access  Staff
const updateEntry = async (req, res) => {
    try {
        const entry = await Diary.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: "Diary entry not found" });
        }

        // Check ownership — staff can only edit their own entries
        if (entry.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit your own entries" });
        }

        // Check status — only Pending entries can be edited
        if (entry.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Cannot edit entry. Status is '${entry.status}'. Only 'Pending' entries can be edited.`,
            });
        }

        // Update allowed fields only
        const allowedFields = ["date", "subject", "semester", "section", "hoursTaken", "workType", "description"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                entry[field] = req.body[field];
            }
        });

        await entry.save();

        res.status(200).json({
            success: true,
            message: "Diary entry updated successfully",
            data: entry,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// HOD OPERATIONS
// ============================================

// @desc    View all pending entries in HOD's department
// @route   GET /api/diary/department/pending
// @access  HOD
const getDepartmentPendingEntries = async (req, res) => {
    try {
        const entries = await Diary.find({
            departmentId: req.user.departmentId,
            status: "Pending",
        })
            .sort({ date: -1 })
            .populate("staffId", "name email")
            .populate("departmentId", "departmentName");

        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Approve a diary entry
// @route   PUT /api/diary/:id/approve
// @access  HOD
const approveEntry = async (req, res) => {
    try {
        const entry = await Diary.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: "Diary entry not found" });
        }

        // HOD can only approve entries from their own department
        if (entry.departmentId.toString() !== req.user.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only approve entries in your department",
            });
        }

        if (entry.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Entry already '${entry.status}'. Only 'Pending' entries can be approved.`,
            });
        }

        entry.status = "Approved";
        entry.approvedBy = req.user._id;
        entry.remarks = req.body.remarks || "";
        await entry.save();

        res.status(200).json({
            success: true,
            message: "Diary entry approved",
            data: entry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Reject a diary entry (with remarks)
// @route   PUT /api/diary/:id/reject
// @access  HOD
const rejectEntry = async (req, res) => {
    try {
        const entry = await Diary.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: "Diary entry not found" });
        }

        // HOD can only reject entries from their own department
        if (entry.departmentId.toString() !== req.user.departmentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only reject entries in your department",
            });
        }

        if (entry.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Entry already '${entry.status}'. Only 'Pending' entries can be rejected.`,
            });
        }

        if (!req.body.remarks) {
            return res.status(400).json({
                success: false,
                message: "Remarks are required when rejecting an entry",
            });
        }

        entry.status = "Rejected";
        entry.approvedBy = req.user._id;
        entry.remarks = req.body.remarks;
        await entry.save();

        res.status(200).json({
            success: true,
            message: "Diary entry rejected",
            data: entry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    addEntry,
    getMyEntries,
    updateEntry,
    getDepartmentPendingEntries,
    approveEntry,
    rejectEntry,
};
