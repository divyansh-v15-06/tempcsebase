"use strict";
const fs = require("fs");
const csvParser = require("csv-parser");

/** Parse an uploaded CSV (path comes from multer — no more shared hardcoded file).
 *  Header keys are trimmed; values arrive as strings. */
function parseCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
}

function removeQuietly(filePath) {
    if (filePath) fs.unlink(filePath, () => {});
}

module.exports = { parseCsvFile, removeQuietly };
