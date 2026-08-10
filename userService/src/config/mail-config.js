"use strict";
const nodemailer = require("nodemailer");
const ServerConfig = require("./server-config");

// Lazy: the app must boot (and every non-mail route must work) without mail creds.
let transport = null;
function getTransport() {
    if (!transport) {
        if (!ServerConfig.MAIL_USER || !ServerConfig.MAIL_PASSWORD) {
            throw new Error("Mail is not configured (ADMIN_EMAIL / ADMIN_EMAIL_PASSWORD)");
        }
        transport = nodemailer.createTransport({
            service: "gmail",
            auth: { user: ServerConfig.MAIL_USER, pass: ServerConfig.MAIL_PASSWORD },
        });
    }
    return transport;
}

async function sendMail({ to, subject, text, html }) {
    return getTransport().sendMail({ from: ServerConfig.MAIL_USER, to, subject, text, html });
}

module.exports = { sendMail };
