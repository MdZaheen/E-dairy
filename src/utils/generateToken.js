const jwt = require("jsonwebtoken");

// Generate JWT token with userId and role
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

module.exports = generateToken;
