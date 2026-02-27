// src/routes/diaryRoutes.js — Placeholder
const express = require("express");
const router = express.Router();

// Test route
router.get("/", (req, res) => {
    res.json({ message: "Diary routes working " });
});

module.exports = router;
