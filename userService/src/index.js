"use strict";
const path = require("path");
const express = require("express");
const cors = require("cors");
const { ServerConfig, Logger } = require("./config");
const { imageUpload } = require("./middlewares");
const { success, failure } = require("./utils/responses");

const app = express();

app.use(cors({ origin: ServerConfig.CORS_ORIGIN, methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json(success({ service: "cse-backend", status: "live" })));

/** Image upload/read pair kept byte-compatible with the legacy URLs the frontend
 *  stores (the returned URL embeds /backend/readImage/ for the reverse proxy).
 *  Multer runs inside the handler so its errors (size cap, bad field name) get
 *  the JSON failure envelope instead of Express's default HTML 500. */
app.post("/upload/image", (req, res) => {
    imageUpload.single("avatar")(req, res, (err) => {
        if (err) {
            const isMulter = err.name === "MulterError";
            const status = isMulter ? (err.code === "LIMIT_FILE_SIZE" ? 413 : 400) : 500;
            const message = err.code === "LIMIT_FILE_SIZE" ? "Image exceeds the 5MB size limit" : err.message;
            return res.status(status).json(failure(err, message));
        }
        if (!req.file) return res.status(400).json(failure({}, "No image uploaded (field name: avatar)"));
        const imageUrl = `${req.protocol}://${req.get("host")}/backend/readImage/${req.file.filename}`;
        return res.status(200).json({ message: "Image file uploaded successfully", imageUrl });
    });
});

app.get("/readImage/:filename", (req, res) => {
    const filename = path.basename(req.params.filename); // no traversal
    res.sendFile(path.join(__dirname, "..", "public", "temp", "image", filename), (err) => {
        if (err) res.status(err.status || 404).end();
    });
});

app.use("/api", require("./routes"));

/** The deployed frontend was built with NEXT_PUBLIC_API_URL=<origin>/backend and
 *  calls legacy paths with no /api/v1 prefix (e.g. /backend/faculty/get). The
 *  reverse proxy strips /backend and forwards to this service's root — exactly
 *  like the legacy backend — so the same route table must answer at root too.
 *  /api/v1 stays for local dev and new clients. */
app.use("/", require("./routes/v1"));

app.use((req, res) => res.status(404).json(failure({}, `No route for ${req.method} ${req.originalUrl}`)));

/** Body-parser and other pre-route errors otherwise fall through to Express's
 *  default HTML error page (stack trace + server paths) — keep the JSON envelope. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json(failure({}, "Malformed JSON in request body"));
    if (err.type === "entity.too.large") return res.status(413).json(failure({}, "Request body too large"));
    Logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(err.status || 500).json(failure({}, "Something went wrong"));
});

app.listen(ServerConfig.PORT, () => {
    Logger.info(`Server started on port ${ServerConfig.PORT} (db ${ServerConfig.DB_HOST}:${ServerConfig.DB_PORT}/${ServerConfig.DB_NAME})`);
});
