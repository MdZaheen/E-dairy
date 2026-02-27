const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    addEntry,
    getMyEntries,
    updateEntry,
    getDepartmentPendingEntries,
    approveEntry,
    rejectEntry,
} = require("../controllers/diaryController");

// ============ STAFF ROUTES ============

// POST   /api/diary            → Add new diary entry
router.post("/", verifyToken, authorizeRoles("Staff"), addEntry);

// GET    /api/diary/my-entries  → View own entries
router.get("/my-entries", verifyToken, authorizeRoles("Staff"), getMyEntries);

// PUT    /api/diary/:id         → Update entry (only if Pending)
router.put("/:id", verifyToken, authorizeRoles("Staff"), updateEntry);

// ============ HOD ROUTES ============

// GET    /api/diary/department/pending  → View department's pending entries
router.get("/department/pending", verifyToken, authorizeRoles("HOD"), getDepartmentPendingEntries);

// PUT    /api/diary/:id/approve         → Approve an entry
router.put("/:id/approve", verifyToken, authorizeRoles("HOD"), approveEntry);

// PUT    /api/diary/:id/reject          → Reject an entry (remarks required)
router.put("/:id/reject", verifyToken, authorizeRoles("HOD"), rejectEntry);

module.exports = router;
