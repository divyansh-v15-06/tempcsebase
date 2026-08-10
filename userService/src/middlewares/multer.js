"use strict";
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const uid = () => `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

/** CSV uploads: unique file per request (the legacy version force-named every
 *  upload 'data.csv', so concurrent imports overwrote each other). */
const csvUpload = multer({
    storage: multer.diskStorage({
        destination: path.resolve("./public/temp/uploads"),
        filename: (req, file, cb) => cb(null, `import-${uid()}.csv`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const imageUpload = multer({
    storage: multer.diskStorage({
        destination: path.resolve("./public/temp/image"),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `image_${uid()}${IMAGE_EXT.has(ext) ? ext : ".bin"}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, IMAGE_EXT.has(ext));
    },
});

module.exports = { csvUpload, imageUpload };
