const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validateRequest");

// POST /api/auth/register — with input validation
router.post("/register", validateRegister, register);

// POST /api/auth/login — with input validation
router.post("/login", validateLogin, login);

module.exports = router;
