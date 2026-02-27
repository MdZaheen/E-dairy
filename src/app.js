// ============================================
// src/app.js — Express Application Configuration
// ============================================

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/diary", require("./routes/diaryRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

module.exports = app;
