const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    createUser,
    getAllUsers,
    assignRole,
    deactivateUser,
    activateUser,
    createDepartment,
    getAllDepartments,
    getAllDiaryEntries,
} = require("../controllers/adminController");

// All routes require Admin role
router.use(verifyToken, authorizeRoles("Admin"));

// ============ USER MANAGEMENT ============
router.post("/users", createUser);                    // Create user
router.get("/users", getAllUsers);                     // Get all users
router.put("/users/:id/role", assignRole);            // Assign role
router.put("/users/:id/deactivate", deactivateUser);  // Deactivate user
router.put("/users/:id/activate", activateUser);      // Activate user

// ============ DEPARTMENT MANAGEMENT ============
router.post("/departments", createDepartment);        // Create department
router.get("/departments", getAllDepartments);         // Get all departments

// ============ DIARY MANAGEMENT ============
router.get("/diary", getAllDiaryEntries);              // View all entries (with filters)

module.exports = router;
