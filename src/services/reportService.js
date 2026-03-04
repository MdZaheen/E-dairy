const Diary = require("../models/Diary");
const mongoose = require("mongoose");

// Get monthly report for a specific staff member
const getStaffMonthlyReport = async (staffId, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const report = await Diary.aggregate([
        {
            $match: {
                staffId: new mongoose.Types.ObjectId(staffId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalHours: { $sum: "$hoursTaken" },
            },
        },
    ]);

    // Also get work type breakdown
    const workTypeBreakdown = await Diary.aggregate([
        {
            $match: {
                staffId: new mongoose.Types.ObjectId(staffId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: "$workType",
                count: { $sum: 1 },
                totalHours: { $sum: "$hoursTaken" },
            },
        },
        { $sort: { totalHours: -1 } },
    ]);

    return { statusSummary: report, workTypeBreakdown };
};

// Get department workload summary
const getDepartmentWorkload = async (departmentId, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const workload = await Diary.aggregate([
        {
            $match: {
                departmentId: new mongoose.Types.ObjectId(departmentId),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: "$staffId",
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
                totalEntries: 1,
                totalHours: 1,
                approved: 1,
                pending: 1,
                rejected: 1,
            },
        },
        { $sort: { totalHours: -1 } },
    ]);

    return workload;
};

module.exports = { getStaffMonthlyReport, getDepartmentWorkload };
