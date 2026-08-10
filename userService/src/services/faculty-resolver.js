"use strict";
/** Resolve legacy faculty identifiers (faculty codes like 'CS07' — the old
 *  uniqueFacultyId — or numeric ids) into faculty.id values, reporting every
 *  unknown token instead of the legacy behavior (broken `fac.uniqueId` diff
 *  that blamed the whole list). */
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const models = require("../models");
const AppError = require("../utils/app-error");

async function resolveCodes(tokens, transaction = null) {
    // shipped admin modals append sessionStorage's userId verbatim, which is often
    // the literal string "null"/"undefined" — drop junk tokens instead of 404ing
    // the whole create; genuinely unknown names still 404 below
    tokens = (tokens || []).filter((t) => !["", "null", "undefined"].includes(String(t).trim().toLowerCase()));
    if (!tokens.length) return [];
    const codes = [];
    const ids = [];
    for (const t of tokens) {
        if (/^\d+$/.test(t)) ids.push(parseInt(t, 10));
        else codes.push(t);
    }
    const rows = await models.Faculty.findAll({
        where: { [Op.or]: [{ facultyCode: { [Op.in]: codes.length ? codes : [""] } }, { id: { [Op.in]: ids.length ? ids : [0] } }] },
        attributes: ["id", "facultyCode"],
        transaction,
    });
    const byCode = new Map(rows.map((r) => [r.facultyCode, r.id]));
    const byId = new Set(rows.map((r) => r.id));
    const missing = [
        ...codes.filter((c) => !byCode.has(c)),
        ...ids.filter((i) => !byId.has(i)),
    ];
    if (missing.length) {
        throw new AppError(`Unknown faculty: ${missing.join(", ")}`, StatusCodes.NOT_FOUND);
    }
    return [...new Set([...codes.map((c) => byCode.get(c)), ...ids])];
}

/** Legacy URL params like 'CS07' -> numeric faculty id (old code regex-stripped the prefix). */
function parseFacultyParam(param) {
    if (!param) return null;
    const m = String(param).match(/(\d+)\s*$/);
    return m ? parseInt(m[1], 10) : null;
}

async function byCode(facultyCode, transaction = null) {
    const row = await models.Faculty.findOne({ where: { facultyCode }, transaction });
    if (!row) throw new AppError(`Unknown faculty code: ${facultyCode}`, StatusCodes.NOT_FOUND);
    return row;
}

module.exports = { resolveCodes, parseFacultyParam, byCode };
