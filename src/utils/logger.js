const morgan = require("morgan");

// ============================================
// HTTP Request Logger (Morgan middleware)
// ============================================
// Uses 'dev' format in development (colored, concise)
// Uses 'combined' format in production (Apache-style, detailed)
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
const morganMiddleware = morgan(morganFormat);

// ============================================
// Application Logger (console wrapper with timestamps)
// ============================================
const getTimestamp = () => {
    return new Date().toISOString();
};

const logger = {
    info: (message, ...args) => {
        console.log(`[${getTimestamp()}] [INFO] ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`[${getTimestamp()}] [WARN] ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...args);
    },

    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
        }
    },
};

module.exports = { morganMiddleware, logger };
