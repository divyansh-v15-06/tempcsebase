"use strict";
const path = require("path");
const dotenv = require("dotenv");

// Load .env from userService directory or root workspace directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const bool = (v, def) => (v === undefined ? def : ["1", "true", "yes"].includes(String(v).toLowerCase()));

const ServerConfig = {
    PORT: parseInt(process.env.BACKEND_PORT || process.env.PORT || "3001", 10),
    NODE_ENV: process.env.NODE_ENV || "development",

    DB_NAME: process.env.DB_NAME || process.env.MYSQL_DATABASE || "cse_department",
    DB_USER: process.env.DB_USER || process.env.MYSQL_USER || "cse_app",
    DB_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    DB_HOST: process.env.DB_HOST || "127.0.0.1",
    DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
    DB_LOGGING: bool(process.env.DB_LOGGING, false),


    // No hardcoded fallback secret in production — refuse to boot instead.
    JWT_SECRET: process.env.JWT_SECRET_KEY,
    JWT_EXPIRES_IN: process.env.EXPIRES_IN || "1h",

    MAIL_USER: process.env.ADMIN_EMAIL,
    MAIL_PASSWORD: process.env.ADMIN_EMAIL_PASSWORD,
    RESET_LINK_BASE: process.env.RESET_LINK_BASE || "https://cse.nith.ac.in/reset-password",

    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    // Compatibility switch: the legacy API left most write endpoints open, and the
    // current frontend does not send tokens on them. Flip to true once the frontend does.
    REQUIRE_AUTH_WRITES: bool(process.env.REQUIRE_AUTH_WRITES, false),

    LIBREOFFICE_PATH: process.env.LIBREOFFICE_PATH || "/usr/bin/soffice",
};

if (!ServerConfig.JWT_SECRET) {
    if (ServerConfig.NODE_ENV === "production") {
        throw new Error("JWT_SECRET_KEY must be set in production");
    }
    ServerConfig.JWT_SECRET = "dev-only-secret";
    // eslint-disable-next-line no-console
    console.warn("[config] JWT_SECRET_KEY not set — using an insecure dev secret");
}

module.exports = ServerConfig;
