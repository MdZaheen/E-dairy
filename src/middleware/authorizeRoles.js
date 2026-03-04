// Authorization middleware — restricts access based on user role
// Usage: authorizeRoles("Admin", "HOD") → only Admin and HOD can access

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user is set by verifyToken middleware (must run before this)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(", ")}`,
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
