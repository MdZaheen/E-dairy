const Timetable = require("../models/Timetable");
const CourseAssignment = require("../models/CourseAssignment");
const Diary = require("../models/Diary");

// Helper: get day name from a Date object
const getDayName = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
};

// Helper: compute hours difference between two HH:MM strings
const calcHours = (startTime, endTime) => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return Math.max(Math.round(diff * 2) / 2, 0.5); // round to nearest 0.5, min 0.5
};

// ============================================
// @desc    Save/overwrite timetable slots for a staff member
// @route   POST /api/timetable
// @body    { slots: [{ courseAssignmentId, dayOfWeek, startTime, endTime, section }] }
// @access  Staff
// ============================================
const saveTimetable = async (req, res) => {
    try {
        const staffId = req.user._id;
        const { slots } = req.body;

        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({ success: false, message: "slots array is required" });
        }

        // Validate every courseAssignmentId belongs to this staff
        const assignmentIds = [...new Set(slots.map((s) => s.courseAssignmentId))];
        for (const id of assignmentIds) {
            const assignment = await CourseAssignment.findById(id);
            if (!assignment) {
                return res.status(404).json({ success: false, message: `Course assignment ${id} not found` });
            }
            if (assignment.staffId.toString() !== staffId.toString()) {
                return res.status(403).json({ success: false, message: "You can only set timetable for your own courses" });
            }
        }

        // Deactivate all existing active slots for this staff, then insert new ones
        await Timetable.updateMany({ staffId, isActive: true }, { isActive: false });

        const toInsert = slots.map((slot) => ({
            courseAssignmentId: slot.courseAssignmentId,
            staffId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            section: slot.section,
            isActive: true,
        }));

        const inserted = await Timetable.insertMany(toInsert);

        res.status(201).json({
            success: true,
            message: `${inserted.length} timetable slot(s) saved`,
            count: inserted.length,
            data: inserted,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate slot detected: same course, day, and section already exists",
            });
        }
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get full weekly timetable for the logged-in staff
// @route   GET /api/timetable/my
// @access  Staff
// ============================================
const getMyTimetable = async (req, res) => {
    try {
        const slots = await Timetable.find({ staffId: req.user._id, isActive: true })
            .populate({
                path: "courseAssignmentId",
                select: "subjectId semester sections courseCode term totalHours",
                populate: { path: "subjectId", select: "subjectName subjectCode" },
            })
            .sort({ dayOfWeek: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get today's classes for the logged-in staff
//          Each slot includes isLogged: bool and diaryEntryId if logged
// @route   GET /api/timetable/today
// @access  Staff
// ============================================
const getTodayClasses = async (req, res) => {
    try {
        const staffId = req.user._id;

        // Use query param date if provided (for logging past days), else today
        const dateParam = req.query.date ? new Date(req.query.date) : new Date();
        const dayName = getDayName(dateParam);

        // Midnight boundaries for the target day
        const dayStart = new Date(dateParam);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dateParam);
        dayEnd.setHours(23, 59, 59, 999);

        // Get all timetable slots for this day
        const slots = await Timetable.find({ staffId, dayOfWeek: dayName, isActive: true })
            .populate({
                path: "courseAssignmentId",
                select: "subjectId semester sections courseCode term totalHours",
                populate: { path: "subjectId", select: "subjectName subjectCode" },
            })
            .sort({ startTime: 1 });

        // For each slot, check if a diary entry already exists for today
        const enriched = await Promise.all(
            slots.map(async (slot) => {
                const existing = await Diary.findOne({
                    staffId,
                    timetableSlotId: slot._id,
                    date: { $gte: dayStart, $lte: dayEnd },
                }).select("_id status lessonNo notTaken");

                return {
                    ...slot.toObject(),
                    isLogged: !!existing,
                    diaryEntryId: existing ? existing._id : null,
                    diaryStatus: existing ? existing.status : null,
                    lessonNo: existing ? existing.lessonNo : null,
                    notTaken: existing ? existing.notTaken : false,
                    calcHours: calcHours(slot.startTime, slot.endTime),
                };
            })
        );

        res.status(200).json({
            success: true,
            date: dateParam.toISOString().split("T")[0],
            day: dayName,
            count: enriched.length,
            data: enriched,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Get full week classes overview (Mon–Sat) with logged status
// @route   GET /api/timetable/week
// @access  Staff
// ============================================
const getWeekClasses = async (req, res) => {
    try {
        const staffId = req.user._id;

        const slots = await Timetable.find({ staffId, isActive: true })
            .populate({
                path: "courseAssignmentId",
                select: "subjectId semester sections courseCode",
                populate: { path: "subjectId", select: "subjectName subjectCode" },
            })
            .sort({ startTime: 1 });

        // Group by dayOfWeek
        const grouped = {};
        for (const slot of slots) {
            if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
            grouped[slot.dayOfWeek].push({
                ...slot.toObject(),
                calcHours: calcHours(slot.startTime, slot.endTime),
            });
        }

        res.status(200).json({
            success: true,
            data: grouped,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================
// @desc    Delete a single timetable slot
// @route   DELETE /api/timetable/:id
// @access  Staff (own records only)
// ============================================
const deleteSlot = async (req, res) => {
    try {
        const slot = await Timetable.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ success: false, message: "Timetable slot not found" });
        }

        if (slot.staffId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own timetable slots" });
        }

        await slot.deleteOne();

        res.status(200).json({
            success: true,
            message: "Timetable slot removed successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    saveTimetable,
    getMyTimetable,
    getTodayClasses,
    getWeekClasses,
    deleteSlot,
};
