const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    saveTimetable,
    getMyTimetable,
    getTodayClasses,
    getWeekClasses,
    deleteSlot,
} = require("../controllers/timetableController");

// All routes require authentication
router.use(verifyToken);

// POST   /api/timetable           → Save/overwrite weekly timetable slots (Staff)
router.post("/", authorizeRoles("Staff"), saveTimetable);

// GET    /api/timetable/my        → Get full weekly timetable (Staff)
router.get("/my", authorizeRoles("Staff"), getMyTimetable);

// GET    /api/timetable/today     → Get today's classes with logged status (Staff)
// Optional query: ?date=2026-04-21  (for logging past days)
router.get("/today", authorizeRoles("Staff"), getTodayClasses);

// GET    /api/timetable/week      → Get week overview grouped by day (Staff)
router.get("/week", authorizeRoles("Staff"), getWeekClasses);

// DELETE /api/timetable/:id       → Delete a single timetable slot (Staff)
router.delete("/:id", authorizeRoles("Staff"), deleteSlot);

module.exports = router;
