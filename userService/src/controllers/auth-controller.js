"use strict";
const wrap = require("../utils/wrap");
const AuthService = require("../services/auth-service");

module.exports = {
    signUp: wrap(async (req) => AuthService.signUp(req.body)),

    signIn: wrap(async (req) => AuthService.signIn(req.body)),

    adminSignIn: wrap(async (req) => AuthService.adminSignIn(req.body)),

    // Legacy exposed two reset routes (faculty/admin) with diverging implementations;
    // both now hit the same corrected flow.
    passwordReset: wrap(async (req) => AuthService.requestPasswordReset(req.body)),

    updatePassword: wrap(async (req) => AuthService.updatePassword(req.user, req.body)),

    updatePasswordWithOld: wrap(async (req) =>
        AuthService.updatePassword(req.user, req.body, { verifyOld: true })),

    verifyToken: wrap(async (req) => {
        const token = (req.headers.authorization || "").split(" ").pop();
        return AuthService.verifyToken(token);
    }),
};
