// ============================================
// src/middleware/validateRequest.js — Input Validation
// ============================================

// Validate register input
const validateRegister = (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Request body is empty. Send JSON with Content-Type: application/json" });
    }
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
    }

    if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errors.push("Please provide a valid email address");
    }

    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    // Sanitize — trim whitespace
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();

    next();
};

// Validate login input
const validateLogin = (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Request body is empty. Send JSON with Content-Type: application/json" });
    }
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    req.body.email = email.trim().toLowerCase();

    next();
};

// Validate diary entry input
const validateDiaryEntry = (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Request body is empty. Send JSON with Content-Type: application/json" });
    }
    const { date, subject, semester, section, hoursTaken, workType } = req.body;
    const errors = [];

    if (!date) errors.push("Date is required");
    if (!subject || subject.trim().length === 0) errors.push("Subject is required");
    if (!semester || semester < 1 || semester > 8) errors.push("Semester must be between 1 and 8");
    if (!section || section.trim().length === 0) errors.push("Section is required");
    if (!hoursTaken || hoursTaken < 1 || hoursTaken > 8) errors.push("Hours must be between 1 and 8");
    if (!workType || !["Teaching", "Lab", "Exam", "Meeting", "Admin"].includes(workType)) {
        errors.push("Work type must be one of: Teaching, Lab, Exam, Meeting, Admin");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    // Sanitize
    req.body.subject = subject.trim();
    req.body.section = section.trim();

    next();
};

// Validate ObjectId parameter
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName}: '${id}' is not a valid ID`,
            });
        }
        next();
    };
};

module.exports = {
    validateRegister,
    validateLogin,
    validateDiaryEntry,
    validateObjectId,
};
