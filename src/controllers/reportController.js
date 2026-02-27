const Diary = require("../models/Diary");
const { getStaffMonthlyReport, getDepartmentWorkload } = require("../services/reportService");

// ============================================
// @desc    Get monthly report for a staff member
// @route   GET /api/reports/staff/:staffId/monthly?year=2026&month=2
// @access  HOD, Admin
// ============================================
const staffMonthlyReport = async (req, res) => {
    try {
        const { staffId } = req.params;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "Please provide 'year' and 'month' as query parameters",
            });
        }

        const report = await getStaffMonthlyReport(staffId, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            message: `Monthly report for ${month}/${year}`,
            data: report,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get department workload summary
// @route   GET /api/reports/department/:departmentId/workload?year=2026&month=2
// @access  HOD, Admin
// ============================================
const departmentWorkloadReport = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "Please provide 'year' and 'month' as query parameters",
            });
        }

        const workload = await getDepartmentWorkload(departmentId, parseInt(year), parseInt(month));

        res.status(200).json({
            success: true,
            message: `Department workload for ${month}/${year}`,
            count: workload.length,
            data: workload,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Filter diary entries by date range
// @route   GET /api/reports/entries?from=2026-01-01&to=2026-01-31&status=Approved
// @access  HOD, Admin
// ============================================
const getEntriesByDateRange = async (req, res) => {
    try {
        const { from, to, status, departmentId, staffId } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "Please provide 'from' and 'to' date query parameters",
            });
        }

        const filter = {
            date: {
                $gte: new Date(from),
                $lte: new Date(to),
            },
        };

        if (status) filter.status = status;
        if (departmentId) filter.departmentId = departmentId;
        if (staffId) filter.staffId = staffId;

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

// ============================================
// @desc    Get status counts (approved vs pending vs rejected)
// @route   GET /api/reports/status-counts?departmentId=xxx&year=2026&month=2
// @access  HOD, Admin
// ============================================
const getStatusCounts = async (req, res) => {
    try {
        const { departmentId, year, month } = req.query;

        const matchStage = {};
        if (departmentId) matchStage.departmentId = require("mongoose").Types.ObjectId.createFromHexString(departmentId);
        if (year && month) {
            matchStage.date = {
                $gte: new Date(parseInt(year), parseInt(month) - 1, 1),
                $lte: new Date(parseInt(year), parseInt(month), 0, 23, 59, 59),
            };
        }

        const counts = await Diary.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalHours: { $sum: "$hoursTaken" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Calculate totals
        const total = counts.reduce((acc, c) => acc + c.count, 0);
        const totalHours = counts.reduce((acc, c) => acc + c.totalHours, 0);

        res.status(200).json({
            success: true,
            data: {
                breakdown: counts,
                totalEntries: total,
                totalHours: totalHours,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get total hours per staff member
// @route   GET /api/reports/staff-hours?departmentId=xxx&year=2026&month=2
// @access  HOD, Admin
// ============================================
const getTotalHoursPerStaff = async (req, res) => {
    try {
        const { departmentId, year, month } = req.query;

        const matchStage = { status: "Approved" }; // Only count approved entries
        if (departmentId) matchStage.departmentId = require("mongoose").Types.ObjectId.createFromHexString(departmentId);
        if (year && month) {
            matchStage.date = {
                $gte: new Date(parseInt(year), parseInt(month) - 1, 1),
                $lte: new Date(parseInt(year), parseInt(month), 0, 23, 59, 59),
            };
        }

        const staffHours = await Diary.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$staffId",
                    totalHours: { $sum: "$hoursTaken" },
                    totalEntries: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staff",
                },
            },
            { $unwind: "$staff" },
            {
                $project: {
                    _id: 0,
                    staffId: "$_id",
                    staffName: "$staff.name",
                    staffEmail: "$staff.email",
                    totalHours: 1,
                    totalEntries: 1,
                },
            },
            { $sort: { totalHours: -1 } },
        ]);

        res.status(200).json({
            success: true,
            count: staffHours.length,
            data: staffHours,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    staffMonthlyReport,
    departmentWorkloadReport,
    getEntriesByDateRange,
    getStatusCounts,
    getTotalHoursPerStaff,
};
