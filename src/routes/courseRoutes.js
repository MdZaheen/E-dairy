const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    createCourseAssignment,
    getMyCourses,
    updateCourseAssignment,
    deleteCourseAssignment,
} = require("../controllers/courseController");

// All routes require authentication
router.use(verifyToken);

// POST   /api/courses       → Create course assignment (Staff)
router.post("/", authorizeRoles("Staff"), createCourseAssignment);

// GET    /api/courses/my    → Get my course assignments (Staff)
router.get("/my", authorizeRoles("Staff"), getMyCourses);

// PUT    /api/courses/:id   → Update a course assignment (Staff)
router.put("/:id", authorizeRoles("Staff"), updateCourseAssignment);

// DELETE /api/courses/:id   → Deactivate a course assignment (Staff)
router.delete("/:id", authorizeRoles("Staff"), deleteCourseAssignment);

module.exports = router;
