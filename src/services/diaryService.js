const Diary = require("../models/Diary");
const mongoose = require("mongoose");

// ============================================
// Get diary entries for a specific staff member
// ============================================
const getEntriesByStaff = async (staffId, filters = {}) => {
    const query = { staffId: new mongoose.Types.ObjectId(staffId) };

    if (filters.status) query.status = filters.status;

    if (filters.from && filters.to) {
        query.date = {
            $gte: new Date(filters.from),
            $lte: new Date(filters.to),
        };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Diary.countDocuments(query);
    const entries = await Diary.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("departmentId", "departmentName")
        .populate("approvedBy", "name");

    return {
        entries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

// ============================================
// Get diary entries for a specific department
// ============================================
const getEntriesByDepartment = async (departmentId, filters = {}) => {
    const query = { departmentId: new mongoose.Types.ObjectId(departmentId) };

    if (filters.status) query.status = filters.status;

    if (filters.from && filters.to) {
        query.date = {
            $gte: new Date(filters.from),
            $lte: new Date(filters.to),
        };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Diary.countDocuments(query);
    const entries = await Diary.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("staffId", "name email")
        .populate("departmentId", "departmentName")
        .populate("approvedBy", "name");

    return {
        entries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

// ============================================
// Get monthly stats for a specific staff member
// ============================================
const getMonthlyStats = async (staffId, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const stats = await Diary.aggregate([
        {
            $match: {
                staffId: new mongoose.Types.ObjectId(staffId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                totalEntries: { $sum: 1 },
                // Only sum hours if status is "Approved"
                totalApprovedHours: { 
                    $sum: { $cond: [{ $eq: ["$status", "Approved"] }, "$hoursTaken", 0] } 
                },
                approvedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                },
                pendingCount: {
                    $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                },
                rejectedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalEntries: 1,
                totalApprovedHours: 1,
                approvedCount: 1,
                pendingCount: 1,
                rejectedCount: 1,
            },
        },
    ]);

    // Return default stats if no data found
    return stats.length > 0
        ? stats[0]
        : { totalEntries: 0, totalApprovedHours: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 };
};

module.exports = {
    getEntriesByStaff,
    getEntriesByDepartment,
    getMonthlyStats,
};
