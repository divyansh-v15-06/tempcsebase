"use strict";
const { StatusCodes } = require("http-status-codes");
const { failure } = require("./responses");
const logger = require("../config/logger-config");

/** Wrap an async handler: resolved value is sent as a success envelope
 *  (unless the handler already responded), errors map to consistent envelopes. */
function wrap(handler) {
    return async (req, res) => {
        try {
            const data = await handler(req, res);
            if (!res.headersSent) {
                res.status(StatusCodes.OK).json(require("./responses").success(data));
            }
        } catch (err) {
            logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
            if (res.headersSent) return;
            let status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
            if (err.name === "SequelizeUniqueConstraintError") status = StatusCodes.CONFLICT;
            else if (err.name === "SequelizeValidationError") status = StatusCodes.BAD_REQUEST;
            else if (err.name === "SequelizeForeignKeyConstraintError") status = StatusCodes.BAD_REQUEST;
            res.status(status).json(failure(err, err.message));
        }
    };
}
module.exports = wrap;
