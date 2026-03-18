const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hashPassword");

// ============================================
// @desc    Get own profile
// @route   GET /api/users/profile
// @access  Authenticated (any role)
// ============================================
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("departmentId", "departmentName");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Update own profile (name, email only)
// @route   PUT /api/users/profile
// @access  Authenticated (any role)
// ============================================
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const updateFields = {};

        if (name && name.trim().length >= 2) {
            updateFields.name = name.trim();
        }

        if (email) {
            // Check if new email is already taken by another user
            const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
            if (emailTaken) {
                return res.status(400).json({ success: false, message: "Email is already in use by another account" });
            }
            updateFields.email = email.trim().toLowerCase();
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: "Please provide name or email to update" });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        )
            .select("-password")
            .populate("departmentId", "departmentName");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Email is already in use" });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Change own password
// @route   PUT /api/users/change-password
// @access  Authenticated (any role)
// ============================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current password and new password",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
        }

        // Get user with password field
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash and save new password
        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};
