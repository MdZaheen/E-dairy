// ============================================
// src/middleware/errorHandler.js — Centralized Error Handling
// ============================================
// This middleware catches ALL errors thrown in routes/controllers.
// It must have 4 parameters (err, req, res, next) to work as
// an error middleware in Express.
// ============================================

const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ---- Mongoose Validation Error ----
    // Triggered when required fields are missing or enum values are invalid
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        message = messages.join(", ");
    }

    // ---- Mongoose Cast Error ----
    // Triggered when an invalid ObjectId is passed (e.g., /api/diary/invalid-id)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ---- MongoDB Duplicate Key Error ----
    // Triggered when a unique field (like email) already exists
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for '${field}'. This ${field} already exists.`;
    }

    // ---- JWT Errors ----
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please login again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token has expired. Please login again.";
    }

    // Build response
    const response = {
        success: false,
        message,
    };

    // Only include stack trace in development (never in production)
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
