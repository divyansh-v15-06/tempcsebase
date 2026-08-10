"use strict";
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const ServerConfig = require("../config/server-config");
const { failure } = require("../utils/responses");

function extractToken(req) {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");
    return parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : parts[0] || null;
}

/** Verify JWT and attach req.user = {accountId, facultyId, facultyCode, role}. */
function checkAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(failure({}, "Missing authentication token"));
    }
    try {
        req.user = jwt.verify(token, ServerConfig.JWT_SECRET);
        return next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json(failure(err, "Invalid or expired token"));
    }
}

/** Admin gate — a real role claim now, not a magic username string. */
function requireAdmin(req, res, next) {
    return checkAuth(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(StatusCodes.FORBIDDEN).json(failure({}, "Admin access required"));
        }
        return next();
    });
}

/** Compatibility guard for the ~120 legacy-open write endpoints: enforced only
 *  when REQUIRE_AUTH_WRITES=true so the current token-less frontend keeps working. */
function writeGuard(req, res, next) {
    if (!ServerConfig.REQUIRE_AUTH_WRITES) return next();
    return checkAuth(req, res, next);
}

module.exports = { checkAuth, requireAdmin, writeGuard };
