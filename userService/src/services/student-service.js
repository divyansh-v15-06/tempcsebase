"use strict";
/** Students: legacy request keys (Sem, picture, programmEnroled label, year)
 *  map onto the clean columns; program labels resolve against the DB-backed
 *  lookup instead of a per-file hardcoded map. */
const { Op, fn, col } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const models = require("../models");
const repos = require("../repositories");
const AppError = require("../utils/app-error");
const maps = require("../controllers/entity-maps");
const { lookup, PROGRAM_TYPES } = require("../utils/constants");
const { parseCsvFile, removeQuietly } = require("../utils/csv");

function programInclude() {
    return { model: models.Program, as: "program" };
}

async function createStudent(body) {
    const attrs = maps.studentIn(body);
    if (!attrs.programId) {
        throw new AppError(`Unknown program '${body.programmEnroled}'`, StatusCodes.BAD_REQUEST);
    }
    return repos.student.create(attrs);
}

async function getStudents(query = {}) {
    const where = {};
    if (query.year) where.admissionYear = query.year;
    if (query.Sem) where.currentSemester = parseInt(query.Sem, 10);
    const programId = lookup(PROGRAM_TYPES, query.programmEnroled);
    if (programId) where.programId = programId;
    return repos.student.getAll({ where, include: [programInclude()], order: [["rollNo", "ASC"]] });
}

async function distinctYears(programParam) {
    const where = programParam ? { programId: parseInt(programParam, 10) } : {};
    const rows = await models.Student.findAll({
        attributes: [[fn("DISTINCT", col("admission_year")), "year"]],
        where, order: [["admission_year", "ASC"]], raw: true,
    });
    return rows.map((r) => r.year);
}

async function distinctSemesters(programParam) {
    const where = programParam ? { programId: parseInt(programParam, 10) } : {};
    const rows = await models.Student.findAll({
        attributes: [[fn("DISTINCT", col("current_semester")), "sem"]],
        where, order: [["current_semester", "ASC"]], raw: true,
    });
    return rows.map((r) => r.sem);
}

async function updateStudent(id, body) {
    return repos.student.update(id, maps.studentIn(body));
}

async function updateMulti({ ids, newSemester, currentSemester }) {
    const target = parseInt(newSemester !== undefined ? newSemester : currentSemester, 10);
    if (!Array.isArray(ids) || !ids.length || !Number.isInteger(target)) {
        throw new AppError("ids[] and newSemester are required", StatusCodes.BAD_REQUEST);
    }
    await models.Student.update({ currentSemester: target }, { where: { id: { [Op.in]: ids } } });
    return { updated: ids.length };
}

async function destroyMulti(ids) {
    if (!Array.isArray(ids) || !ids.length) throw new AppError("ids[] required", StatusCodes.BAD_REQUEST);
    const n = await models.Student.destroy({ where: { id: { [Op.in]: ids } } });
    return { deleted: n };
}

async function destroyAll() {
    const n = await models.Student.destroy({ where: {} });
    return { deleted: n };
}

async function bulkImport(filePath) {
    const results = [];
    try {
        const rows = await parseCsvFile(filePath);
        for (const raw of rows) {
            try {
                const created = await createStudent(raw);
                results.push({ status: "success", id: created.id });
            } catch (err) {
                results.push({ status: "error", message: err.message, row: raw });
            }
        }
    } finally {
        removeQuietly(filePath);
    }
    return results;
}

module.exports = {
    createStudent, getStudents, distinctYears, distinctSemesters,
    updateStudent, updateMulti, destroyMulti, destroyAll, bulkImport,
};
