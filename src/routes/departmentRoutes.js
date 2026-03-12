const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateObjectId } = require("../middleware/validateRequest");
const {
    getAllDepartments,
    getDepartmentById,
    getDepartmentStaff,
} = require("../controllers/departmentController");

// GET  /api/departments          → List all departments (Public access for Registration)
router.get("/", getAllDepartments);

// All other department routes require authentication
router.use(verifyToken);

// GET  /api/departments/:id      → Get single department by ID (any authenticated user)
router.get("/:id", validateObjectId("id"), getDepartmentById);

// GET  /api/departments/:id/staff → List staff in department (HOD, Admin only)
router.get("/:id/staff", validateObjectId("id"), authorizeRoles("HOD", "Admin"), getDepartmentStaff);

module.exports = router;
