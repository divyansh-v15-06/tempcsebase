"use strict";
/**
 * Auth over user_accounts (replaces the SignUps flow).
 *
 * Corrected vs legacy:
 *  - JWT secret from env (was the hardcoded literal "karan", printed to stdout)
 *  - role claim in the token; admin = role==='admin', not a magic username string
 *  - one password-reset implementation (legacy had two, mailing different hosts
 *    and minting tokens with ids from different tables)
 *  - first_login lives on user_accounts and is actually written (legacy read it
 *    from the wrong table — always undefined — and never wrote it anywhere)
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const models = require("../models");
const AppError = require("../utils/app-error");
const ServerConfig = require("../config/server-config");
const Mailer = require("../config/mail-config");
const logger = require("../config/logger-config");

/** Legacy DBs stored emails obfuscated ('x[at]y[dot]z'); normalize defensively. */
function deobfuscateEmail(email) {
    return email ? email.replace(/\[at\]/g, "@").replace(/\[dot\]/g, ".") : email;
}

function signToken(account, expiresIn = ServerConfig.JWT_EXPIRES_IN) {
    return jwt.sign(
        {
            id: account.id,
            facultyId: account.facultyId,
            uniqueFacultyId: account.faculty ? account.faculty.facultyCode : account.username,
            role: account.role,
        },
        ServerConfig.JWT_SECRET,
        { expiresIn }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, ServerConfig.JWT_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
    }
}

/** Find the account behind a legacy identifier: faculty code ('CS07') or username ('admin'). */
async function findAccount(identifier, { withFaculty = true } = {}) {
    const include = withFaculty ? [{ model: models.Faculty, as: "faculty" }] : [];
    let account = await models.UserAccount.findOne({ where: { username: identifier }, include });
    if (!account) {
        const faculty = await models.Faculty.findOne({ where: { facultyCode: identifier } });
        if (faculty) {
            account = await models.UserAccount.findOne({ where: { facultyId: faculty.id }, include });
        }
    }
    return account;
}

async function signUp({ name, email, password, uniqueFacultyId }) {
    if (!password || !uniqueFacultyId) {
        throw new AppError("uniqueFacultyId and password are required", StatusCodes.BAD_REQUEST);
    }
    const faculty = await models.Faculty.findOne({ where: { facultyCode: uniqueFacultyId } });
    if (!faculty) throw new AppError("Invalid uniqueFacultyId", StatusCodes.BAD_REQUEST);
    const existing = await models.UserAccount.findOne({ where: { facultyId: faculty.id } });
    if (existing) throw new AppError("Account already exists for this faculty", StatusCodes.CONFLICT);
    const account = await models.UserAccount.create({
        facultyId: faculty.id,
        role: "faculty",
        passwordHash: password, // hashed by the model hook
    });
    return { id: account.id, uniqueFacultyId: faculty.facultyCode, name: faculty.name, email: faculty.email };
}

async function signIn({ uniqueFacultyId, password }) {
    // The shipped form posts urlencoded data, so an empty string counts as missing.
    if (!uniqueFacultyId) throw new AppError("uniqueFacultyId is required", StatusCodes.BAD_REQUEST);
    const account = await findAccount(uniqueFacultyId);
    if (!account) throw new AppError("No account found for the given id", StatusCodes.NOT_FOUND);
    if (!bcrypt.compareSync(String(password || ""), account.passwordHash)) {
        throw new AppError("Incorrect password", StatusCodes.UNAUTHORIZED);
    }
    return { token: signToken(account), firstlogin: account.firstLogin, role: account.role };
}

async function adminSignIn({ username, password }) {
    if (!username) throw new AppError("username is required", StatusCodes.BAD_REQUEST);
    const account = await models.UserAccount.findOne({ where: { username }, include: [{ model: models.Faculty, as: "faculty" }] });
    if (!account || account.role !== "admin") {
        throw new AppError("You are not authorized to login as admin", StatusCodes.FORBIDDEN);
    }
    if (!bcrypt.compareSync(String(password || ""), account.passwordHash)) {
        throw new AppError("Incorrect password", StatusCodes.UNAUTHORIZED);
    }
    return { token: signToken(account) };
}

async function requestPasswordReset({ uniqueFacultyId }) {
    if (!uniqueFacultyId) throw new AppError("uniqueFacultyId is required", StatusCodes.BAD_REQUEST);
    const account = await findAccount(uniqueFacultyId);
    if (!account) throw new AppError("No account found for the given id", StatusCodes.NOT_FOUND);
    const email = deobfuscateEmail(account.email || (account.faculty && account.faculty.email));
    if (!email) throw new AppError("No email on record for this account", StatusCodes.BAD_REQUEST);
    const token = signToken(account, "15m");
    const link = `${ServerConfig.RESET_LINK_BASE}/${token}`;
    try {
        await Mailer.sendMail({
            to: email,
            subject: "Password reset",
            text: `You requested a password reset. This link expires in 15 minutes:\n${link}\nIf you did not request it, ignore this mail.`,
        });
    } catch (err) {
        // Never leak transport/config details to the client.
        logger.error(`Password reset mail failed for account ${account.id}: ${err.message}`);
        throw new AppError(
            "The email service is not available right now — try again later",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
    return { message: `Password reset link sent to ${email}` };
}

/** Identity comes from the verified JWT (req.user). */
async function updatePassword(user, { newPassword, oldPassword } = {}, { verifyOld = false } = {}) {
    if (!newPassword) throw new AppError("newPassword is required", StatusCodes.BAD_REQUEST);
    const account = await findAccount(user.uniqueFacultyId);
    if (!account) throw new AppError("Account not found", StatusCodes.NOT_FOUND);
    if (verifyOld && !bcrypt.compareSync(String(oldPassword || ""), account.passwordHash)) {
        throw new AppError("Incorrect old password", StatusCodes.UNAUTHORIZED);
    }
    await account.update({
        passwordHash: bcrypt.hashSync(String(newPassword), 8),
        firstLogin: false, // completing the first credential change ends the first-login state
    });
    return { message: "Password updated" };
}

module.exports = { signUp, signIn, adminSignIn, requestPasswordReset, updatePassword, verifyToken, findAccount };
