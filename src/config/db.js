// ============================================
// src/config/db.js — MongoDB Connection
// ============================================
// This file handles connecting to MongoDB using Mongoose.
// It exports a function that app.js calls at startup.
// ============================================

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // mongoose.connect() returns a promise
        // It uses the MONGODB_URI from your .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Exit the process with failure code (1)
        // If the database can't connect, there's no point running the server
        process.exit(1);
    }
};

module.exports = connectDB;
