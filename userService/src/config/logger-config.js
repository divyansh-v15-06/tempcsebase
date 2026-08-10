"use strict";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

const line = printf(({ level, message, timestamp: ts }) => `${ts} : ${level}: ${message}`);

module.exports = createLogger({
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), line),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/app.log" }),
    ],
});
