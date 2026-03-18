const Department = require("../models/Department");
const User = require("../models/User");

// ============================================
// @desc    Get all departments
// @route   GET /api/departments
// @access  Authenticated (any role)
// ============================================
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate("hodId", "name email")
            .sort({ departmentName: 1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get a single department by ID
// @route   GET /api/departments/:id
// @access  Authenticated (any role)
// ============================================
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate("hodId", "name email");

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        // Get staff count in this department
        const staffCount = await User.countDocuments({
            departmentId: department._id,
            isActive: true,
        });

        res.status(200).json({
            success: true,
            data: {
                ...department.toObject(),
                staffCount,
            },
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get all staff members in a department
// @route   GET /api/departments/:id/staff
// @access  HOD, Admin
// ============================================
const getDepartmentStaff = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        // HODs can only view staff from their own department
        if (req.user.role === "HOD" && req.user.departmentId.toString() !== department._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only view staff in your own department",
            });
        }

        const staff = await User.find({
            departmentId: department._id,
            isActive: true,
        })
            .select("-password")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid department ID" });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    getDepartmentStaff,
};
