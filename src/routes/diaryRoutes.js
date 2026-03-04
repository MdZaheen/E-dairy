const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateDiaryEntry, validateObjectId } = require("../middleware/validateRequest");
const {
    addEntry,
    getMyEntries,
    updateEntry,
    getDepartmentEntries,
    getDepartmentPendingEntries,
    approveEntry,
    rejectEntry,
} = require("../controllers/diaryController");

// ============ STAFF ROUTES ============

// POST   /api/diary                          → Add new diary entry
router.post("/", verifyToken, authorizeRoles("Staff"), validateDiaryEntry, addEntry);

// GET    /api/diary/my-entries?page=1&limit=10 → View own entries (paginated)
router.get("/my-entries", verifyToken, authorizeRoles("Staff"), getMyEntries);

// PUT    /api/diary/:id                       → Update entry (only if Pending)
router.put("/:id", verifyToken, authorizeRoles("Staff"), validateObjectId("id"), updateEntry);

// ============ HOD ROUTES ============

// GET    /api/diary/department?page=1&limit=10&status=Pending → All dept entries (paginated)
router.get("/department", verifyToken, authorizeRoles("HOD"), getDepartmentEntries);

// GET    /api/diary/department/pending?page=1&limit=10        → Pending only (shortcut)
router.get("/department/pending", verifyToken, authorizeRoles("HOD"), getDepartmentPendingEntries);

// PUT    /api/diary/:id/approve               → Approve an entry
router.put("/:id/approve", verifyToken, authorizeRoles("HOD"), validateObjectId("id"), approveEntry);

// PUT    /api/diary/:id/reject                → Reject an entry (remarks required)
router.put("/:id/reject", verifyToken, authorizeRoles("HOD"), validateObjectId("id"), rejectEntry);

module.exports = router;
