"use strict";
/** Controllers for the six faculty-CV child tables. Legacy sent the faculty CODE
 *  string under `facultyId` (adminExp under `associatedFaculty`); we resolve it
 *  to the integer FK. Updates never re-assign the owner (legacy behavior). */
const { StatusCodes } = require("http-status-codes");
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const repos = require("../repositories");
const maps = require("./entity-maps");
const models = require("../models");
const { resolveCodes } = require("../services/faculty-resolver");
const { parseCsvFile, removeQuietly } = require("../utils/csv");

function makeCvController({ repo, inMap, outMap, facultyKeys = ["facultyId"], includeFaculty = false }) {
    const facultyInclude = includeFaculty ? [{ model: models.Faculty, as: "faculty" }] : [];

    async function resolveOwner(body) {
        for (const key of facultyKeys) {
            if (body[key]) {
                const [id] = await resolveCodes([String(body[key])]);
                return id;
            }
        }
        throw new AppError(`Missing faculty identifier (${facultyKeys.join("/")})`, StatusCodes.BAD_REQUEST);
    }

    async function facultyWhere(query) {
        if (!query.facultyId) return {};
        const [id] = await resolveCodes([String(query.facultyId)]);
        return { facultyId: id };
    }

    return {
        create: wrap(async (req) => {
            const attrs = inMap(req.body);
            attrs.facultyId = await resolveOwner(req.body);
            return outMap(await repo.create(attrs));
        }),

        getAll: wrap(async (req) => {
            const where = await facultyWhere(req.query);
            const rows = await repo.getAll({ where, include: facultyInclude, order: [["id", "DESC"]] });
            return rows.map(outMap);
        }),

        update: wrap(async (req) => outMap(await repo.update(req.params.id, inMap(req.body)))),

        destroy: wrap(async (req) => {
            await repo.destroy(req.params.id);
            return { deleted: true };
        }),

        bulk: wrap(async (req) => {
            if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
            const results = [];
            try {
                const rows = await parseCsvFile(req.file.path);
                for (const raw of rows) {
                    try {
                        const attrs = inMap(raw);
                        attrs.facultyId = await resolveOwner(raw);
                        const created = await repo.create(attrs);
                        results.push({ status: "success", id: created.id });
                    } catch (err) {
                        results.push({ status: "error", message: err.message, row: raw });
                    }
                }
            } finally {
                removeQuietly(req.file.path);
            }
            return results;
        }),
    };
}

const qualification = makeCvController({ repo: repos.qualification, inMap: maps.qualificationIn, outMap: maps.qualificationOut });
const teachingExp = makeCvController({ repo: repos.teachingExp, inMap: maps.teachingExpIn, outMap: maps.teachingExpOut });
const adminExp = makeCvController({ repo: repos.adminExp, inMap: maps.adminExpIn, outMap: maps.adminExpOut, facultyKeys: ["associatedFaculty", "facultyId"], includeFaculty: true });
const honor = makeCvController({ repo: repos.honor, inMap: maps.honorIn, outMap: maps.honorOut });
const exposure = makeCvController({ repo: repos.exposure, inMap: maps.exposureIn, outMap: maps.exposureOut });
const expertTalk = makeCvController({ repo: repos.expertTalk, inMap: maps.expertTalkIn, outMap: maps.expertTalkOut, includeFaculty: true });

/* Entity-specific extras kept from the legacy surface */

// legacy /qualification/highest/get?facultyId=CS07 — highest by passing year
qualification.highest = wrap(async (req) => {
    const where = {};
    if (req.query.facultyId) {
        const [id] = await resolveCodes([String(req.query.facultyId)]);
        where.facultyId = id;
    }
    const row = await models.FacultyQualification.findOne({ where, order: [["passingYear", "DESC"]] });
    return row ? maps.qualificationOut(row) : null;
});

// the shipped filter dropdowns send bare year values under date-named params
function queryYear(value) {
    const n = parseInt(String(value ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
}

// distinct calendar years of one or more DATE columns, newest first —
// feeds the year dropdowns the shipped pages poll (legacy had no routes
// for these; the pages swallowed the 404s and showed empty dropdowns)
async function distinctYearsOf(model, columns) {
    const { fn, col, Op } = require("sequelize");
    const years = new Set();
    for (const [attr, column] of columns) {
        const rows = await model.findAll({
            attributes: [[fn("DISTINCT", fn("YEAR", col(column))), "value"]],
            where: { [attr]: { [Op.not]: null } },
            raw: true,
        });
        for (const r of rows) if (r.value) years.add(r.value);
    }
    return [...years].sort((a, b) => b - a);
}

// legacy expert-talk reads filter by `name` (a faculty code) and expose a "top" list;
// the shipped pages also send `startDate`/`endDate` holding year values
expertTalk.getAllFiltered = wrap(async (req) => {
    const { fn, col, Op, where: sqlWhere } = require("sequelize");
    const where = {};
    if (req.query.name) {
        const [id] = await resolveCodes([String(req.query.name)]);
        where.facultyId = id;
    }
    if (req.query.academicSession) where.academicSession = req.query.academicSession;
    const conds = [];
    const startYear = queryYear(req.query.startDate);
    const endYear = queryYear(req.query.endDate);
    if (startYear) conds.push(sqlWhere(fn("YEAR", col("start_date")), { [Op.gte]: startYear }));
    if (endYear) conds.push(sqlWhere(fn("YEAR", fn("COALESCE", col("end_date"), col("start_date"))), { [Op.lte]: endYear }));
    if (conds.length) where[Op.and] = conds;
    const rows = await repos.expertTalk.getAll({
        where, include: [{ model: models.Faculty, as: "faculty" }], order: [["startDate", "DESC"]],
    });
    return rows.map(maps.expertTalkOut);
});
expertTalk.startYears = wrap(async () => distinctYearsOf(models.ExpertTalk, [["startDate", "start_date"]]));
expertTalk.endYears = wrap(async () => distinctYearsOf(models.ExpertTalk, [["endDate", "end_date"]]));

// the shipped admin-experience pages poll /getYear for both year dropdowns and
// send `startYear`/`endYear` on the list read
adminExp.years = wrap(async () =>
    distinctYearsOf(models.FacultyAdministrativeExperience, [["startDate", "start_date"], ["endDate", "end_date"]]));
adminExp.getAll = wrap(async (req) => {
    const { fn, col, Op, where: sqlWhere } = require("sequelize");
    const where = {};
    if (req.query.facultyId) {
        const [id] = await resolveCodes([String(req.query.facultyId)]);
        where.facultyId = id;
    }
    const conds = [];
    const startYear = queryYear(req.query.startYear);
    const endYear = queryYear(req.query.endYear);
    if (startYear) conds.push(sqlWhere(fn("YEAR", col("start_date")), { [Op.gte]: startYear }));
    if (endYear) conds.push(sqlWhere(fn("YEAR", col("end_date")), { [Op.lte]: endYear }));
    if (conds.length) where[Op.and] = conds;
    const rows = await repos.adminExp.getAll({
        where, include: [{ model: models.Faculty, as: "faculty" }], order: [["id", "DESC"]],
    });
    return rows.map(maps.adminExpOut);
});
expertTalk.top = wrap(async () => {
    const rows = await repos.expertTalk.getTopN(3, [["startDate", "DESC"]]);
    return rows.map(maps.expertTalkOut);
});
expertTalk.sessions = wrap(async () => {
    const { fn, col, Op } = require("sequelize");
    const rows = await models.ExpertTalk.findAll({
        attributes: [[fn("DISTINCT", col("academic_session")), "value"]],
        where: { academicSession: { [Op.not]: null } },
        order: [["academic_session", "ASC"]], raw: true,
    });
    return rows.map((r) => r.value);
});

module.exports = { qualification, teachingExp, adminExp, honor, exposure, expertTalk };
