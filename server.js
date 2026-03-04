// ============================================
// server.js — Application Entry Point
// ============================================

// 1️⃣ Load environment variables FIRST
require("dotenv").config();

// 2️⃣ Import the configured Express app
const app = require("./src/app");

// 3️⃣ Read PORT from .env (default: 5000)
const PORT = process.env.PORT || 5000;

// 4️⃣ Start the HTTP server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});
