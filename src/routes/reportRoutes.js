const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    staffMonthlyReport,
    departmentWorkloadReport,
    getEntriesByDateRange,
    getStatusCounts,
    getTotalHoursPerStaff,
} = require("../controllers/reportController");

// All report routes require HOD or Admin role
router.use(verifyToken, authorizeRoles("HOD", "Admin"));

// GET /api/reports/staff/:staffId/monthly?year=2026&month=2
router.get("/staff/:staffId/monthly", staffMonthlyReport);

// GET /api/reports/department/:departmentId/workload?year=2026&month=2
router.get("/department/:departmentId/workload", departmentWorkloadReport);

// GET /api/reports/entries?from=2026-01-01&to=2026-01-31&status=Approved
router.get("/entries", getEntriesByDateRange);

// GET /api/reports/status-counts?departmentId=xxx&year=2026&month=2
router.get("/status-counts", getStatusCounts);

// GET /api/reports/staff-hours?departmentId=xxx&year=2026&month=2
router.get("/staff-hours", getTotalHoursPerStaff);

module.exports = router;
