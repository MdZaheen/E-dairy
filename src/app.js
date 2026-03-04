const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());   // Sets secure HTTP headers
app.use(cors());
app.use(express.json({ limit: "10kb" })); // Limit body size to prevent abuse

// Rate Limiting — max 100 requests per 15 min per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
});
app.use("/api", generalLimiter);

// Stricter rate limit for auth routes — max 20 per 15 min
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many login/register attempts. Please try again after 15 minutes." },
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/diary", require("./routes/diaryRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Global Error Handler (must be AFTER all routes)
app.use(errorHandler);

module.exports = app;
