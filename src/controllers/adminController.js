const User = require("../models/User");
const Department = require("../models/Department");
const Diary = require("../models/Diary");
const { hashPassword } = require("../utils/hashPassword");

// ============================================
// USER MANAGEMENT
// ============================================

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, departmentId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        // Validate department exists if provided
        if (departmentId) {
            const dept = await Department.findById(departmentId);
            if (!dept) {
                return res.status(404).json({ success: false, message: "Department not found" });
            }
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "Staff",
            departmentId,
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                departmentId: user.departmentId,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("departmentId", "departmentName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Assign/update role for a user
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const assignRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["Staff", "HOD", "Admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role. Must be Staff, HOD, or Admin" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: `Role updated to '${role}' successfully`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Deactivate a user (soft disable)
// @route   PUT /api/admin/users/:id/deactivate
// @access  Admin
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User '${user.name}' has been deactivated`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Activate a user
// @route   PUT /api/admin/users/:id/activate
// @access  Admin
const activateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: `User '${user.name}' has been activated`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// DEPARTMENT MANAGEMENT
// ============================================

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Admin
const createDepartment = async (req, res) => {
    try {
        const { departmentName, hodId } = req.body;

        // Validate HOD exists and has HOD role if provided
        if (hodId) {
            const hod = await User.findById(hodId);
            if (!hod) {
                return res.status(404).json({ success: false, message: "HOD user not found" });
            }
            if (hod.role !== "HOD") {
                return res.status(400).json({ success: false, message: "Selected user does not have HOD role" });
            }
        }

        const department = await Department.create({
            departmentName,
            hodId: hodId || null,
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Department name already exists" });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Admin
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
// DIARY MANAGEMENT
// ============================================

// @desc    View all diary entries (with filters)
// @route   GET /api/admin/diary
// @access  Admin
const getAllDiaryEntries = async (req, res) => {
    try {
        // Optional query filters
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.departmentId) filter.departmentId = req.query.departmentId;
        if (req.query.staffId) filter.staffId = req.query.staffId;

        const entries = await Diary.find(filter)
            .sort({ date: -1 })
            .populate("staffId", "name email")
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

module.exports = {
    createUser,
    getAllUsers,
    assignRole,
    deactivateUser,
    activateUser,
    createDepartment,
    getAllDepartments,
    getAllDiaryEntries,
};
