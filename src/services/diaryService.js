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
                totalHours: { $sum: "$hoursTaken" },
                approved: {
                    $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                },
                pending: {
                    $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                },
                rejected: {
                    $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalEntries: 1,
                totalHours: 1,
                approved: 1,
                pending: 1,
                rejected: 1,
            },
        },
    ]);

    // Return default stats if no data found
    return stats.length > 0
        ? stats[0]
        : { totalEntries: 0, totalHours: 0, approved: 0, pending: 0, rejected: 0 };
};

module.exports = {
    getEntriesByStaff,
    getEntriesByDepartment,
    getMonthlyStats,
};
