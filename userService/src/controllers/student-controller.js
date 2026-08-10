"use strict";
const { StatusCodes } = require("http-status-codes");
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const StudentService = require("../services/student-service");
const { studentOut } = require("./entity-maps");

module.exports = {
    create: wrap(async (req) => studentOut(await StudentService.createStudent(req.body))),

    bulk: wrap(async (req) => {
        if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
        return StudentService.bulkImport(req.file.path);
    }),

    getAll: wrap(async (req) => (await StudentService.getStudents(req.query)).map(studentOut)),

    getYears: wrap(async (req) => StudentService.distinctYears(req.params.id)),

    getSemesters: wrap(async (req) => StudentService.distinctSemesters(req.params.id)),

    update: wrap(async (req) => studentOut(await StudentService.updateStudent(req.params.id, req.body))),

    updateMulti: wrap(async (req) => StudentService.updateMulti(req.body)),

    destroy: wrap(async (req) => {
        const { student } = require("../repositories");
        await student.destroy(req.params.id);
        return { deleted: true };
    }),

    destroyMulti: wrap(async (req) => StudentService.destroyMulti(req.body.ids)),

    destroyAll: wrap(async () => StudentService.destroyAll()),
};
