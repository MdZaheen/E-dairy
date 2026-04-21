const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateObjectId } = require("../middleware/validateRequest");
const Subject = require("../models/Subject");
const {
    getAllDepartments,
    getDepartmentById,
    getDepartmentStaff,
} = require("../controllers/departmentController");

// GET  /api/departments          → List all departments (Public access for Registration)
router.get("/", getAllDepartments);

// All other department routes require authentication
router.use(verifyToken);

// GET  /api/departments/subjects?departmentId=xxx&semester=3
//      → List subjects (any authenticated user — Staff, HOD, Admin)
router.get("/subjects", async (req, res) => {
    try {
        const filter = {};
        if (req.query.departmentId) filter.departmentId = req.query.departmentId;
        if (req.query.semester) filter.semester = parseInt(req.query.semester);

        const subjects = await Subject.find(filter)
            .populate("departmentId", "departmentName")
            .sort({ subjectName: 1 });

        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// GET  /api/departments/:id      → Get single department by ID (any authenticated user)
router.get("/:id", validateObjectId("id"), getDepartmentById);

// GET  /api/departments/:id/staff → List staff in department (HOD, Admin only)
router.get("/:id/staff", validateObjectId("id"), authorizeRoles("HOD", "Admin"), getDepartmentStaff);

module.exports = router;
