// src/routes/authRoutes.js — Placeholder
const express = require("express");
const router = express.Router();

// Test route
router.get("/", (req, res) => {
    res.json({ message: "Auth routes working " });
});

module.exports = router;
