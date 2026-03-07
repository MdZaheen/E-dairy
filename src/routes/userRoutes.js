const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
    getProfile,
    updateProfile,
    changePassword,
} = require("../controllers/userController");

// All user routes require authentication
router.use(verifyToken);

// GET  /api/users/profile          → Get own profile
router.get("/profile", getProfile);

// PUT  /api/users/profile          → Update own profile (name, email)
router.put("/profile", updateProfile);

// PUT  /api/users/change-password  → Change own password
router.put("/change-password", changePassword);

module.exports = router;
