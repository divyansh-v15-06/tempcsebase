"use strict";
/** Faculty + profile logic. faculty_code ('CS0<id>') stays a real business key
 *  (URLs/CSVs/JWTs use it) but is now unique and assigned in the same transaction
 *  as the insert — the legacy afterCreate hook did a second write and bulk imports
 *  could strand rows on the colliding default 'CS0'. */
const { StatusCodes } = require("http-status-codes");
const models = require("../models");
const { sequelize } = models;
const repos = require("../repositories");
const AppError = require("../utils/app-error");
const maps = require("../controllers/entity-maps");
const { parseCsvFile, removeQuietly } = require("../utils/csv");

async function createFaculty(body) {
    return sequelize.transaction(async (transaction) => {
        const attrs = maps.facultyIn(body);
        // short unique placeholder (column is VARCHAR(20)), replaced below in-txn
        attrs.facultyCode = `~${require("crypto").randomBytes(6).toString("hex")}`;
        const row = await repos.faculty.create(attrs, { transaction });
        await row.update({ facultyCode: `CS0${row.id}` }, { transaction });
        return row;
    });
}

async function getFaculty(query = {}) {
    const where = {};
    if (query.name) where.name = query.name;
    // legacy `?position=---` sentinel meant "temporary faculty" (stored as position=NULL + is_permanent=0)
    if (query.position) {
        if (String(query.position).trim() === "---") where.isPermanent = false;
        else where.position = query.position;
    }
    // legacy `?parmanent=` (sic) meant "only permanent faculty" via the position!='---' sentinel
    if (query.parmanent !== undefined || query.permanent !== undefined) where.isPermanent = true;
    return repos.faculty.getAll({ where, order: [["sortOrder", "ASC"], ["id", "ASC"]] });
}

async function getByCode(facultyCode) {
    const row = await repos.faculty.findOne({ facultyCode });
    if (!row) throw new AppError(`Faculty ${facultyCode} not found`, StatusCodes.NOT_FOUND);
    return row;
}

async function updateFaculty(id, body) {
    return repos.faculty.update(id, maps.facultyIn(body));
}

async function deleteFaculty(id) {
    return repos.faculty.destroy(id); // CV rows, links, account, profile go by FK cascade
}

async function bulkImport(filePath) {
    const results = [];
    try {
        const rows = await parseCsvFile(filePath);
        for (const raw of rows) {
            try {
                const row = await createFaculty(raw);
                results.push({ status: "success", id: row.id, uniqueFacultyId: row.facultyCode });
            } catch (err) {
                results.push({ status: "error", message: err.message, row: raw });
            }
        }
    } finally {
        removeQuietly(filePath);
    }
    return results;
}

/* ------------------------- profile (legacy "facultyInfo") ------------------------- */

/** Upsert the 1:1 profile for the JWT's faculty; legacy also let this call
 *  carry phoneNo for the faculty row itself — kept, but now in one transaction. */
async function upsertProfile(user, body) {
    const faculty = await getByCode(user.uniqueFacultyId);
    return sequelize.transaction(async (transaction) => {
        const attrs = maps.facultyInfoIn(body);
        const [profile] = await models.FacultyProfile.findOrCreate({
            where: { facultyId: faculty.id },
            defaults: { facultyId: faculty.id },
            transaction,
        });
        await profile.update(attrs, { transaction });
        if (body.phoneNo !== undefined || body.phone !== undefined) {
            await faculty.update({ phone: body.phoneNo !== undefined ? body.phoneNo : body.phone }, { transaction });
        }
        return profile;
    });
}

/** Legacy read param was a faculty CODE under the name :facultyId. */
async function getProfileByParam(param) {
    const faculty = /^\d+$/.test(String(param))
        ? await repos.faculty.get(parseInt(param, 10))
        : await getByCode(param);
    const profile = await models.FacultyProfile.findOne({ where: { facultyId: faculty.id } });
    if (!profile) throw new AppError("Faculty info not found", StatusCodes.NOT_FOUND);
    return { profile, faculty };
}

async function deleteProfileByParam(param) {
    const { profile } = await getProfileByParam(param);
    await profile.destroy();
    return { deleted: true };
}

module.exports = {
    createFaculty, getFaculty, getByCode, updateFaculty, deleteFaculty, bulkImport,
    upsertProfile, getProfileByParam, deleteProfileByParam,
};
