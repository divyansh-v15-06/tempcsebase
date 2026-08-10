"use strict";
const { StatusCodes } = require("http-status-codes");
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const FacultyService = require("../services/faculty-service");
const { facultyOut, facultyInfoOut } = require("./entity-maps");

module.exports = {
    create: wrap(async (req) => facultyOut(await FacultyService.createFaculty(req.body))),

    bulk: wrap(async (req) => {
        if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
        return FacultyService.bulkImport(req.file.path);
    }),

    getAll: wrap(async (req) => (await FacultyService.getFaculty(req.query)).map(facultyOut)),

    getOne: wrap(async (req) => facultyOut(await FacultyService.getByCode(req.params.unique))),

    update: wrap(async (req) => facultyOut(await FacultyService.updateFaculty(req.params.id, req.body))),

    destroy: wrap(async (req) => {
        await FacultyService.deleteFaculty(req.params.id);
        return { deleted: true };
    }),

    /* ---------------- legacy /facultyInfo (now the 1:1 faculty_profiles) ---------------- */

    upsertInfo: wrap(async (req) => {
        const profile = await FacultyService.upsertProfile(req.user, req.body);
        return facultyInfoOut(profile);
    }),

    getInfo: wrap(async (req) => {
        const { profile, faculty } = await FacultyService.getProfileByParam(req.params.facultyId);
        return facultyInfoOut(profile, faculty);
    }),

    // legacy used PUT /update/:facultyId with the same auth'd upsert semantics
    updateInfo: wrap(async (req) => {
        const profile = await FacultyService.upsertProfile(req.user, req.body);
        return facultyInfoOut(profile);
    }),

    deleteInfo: wrap(async (req) => FacultyService.deleteProfileByParam(req.params.facultyId)),
};
