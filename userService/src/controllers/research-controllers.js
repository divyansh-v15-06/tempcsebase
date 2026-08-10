"use strict";
/**
 * Controllers for the seven faculty-linked research entities, built from one
 * factory. Legacy served each of these from a copy-pasted controller+service
 * pair whose public getAll had the empty-result bug and whose addFaculty
 * handlers mismatched their services' expected keys (3 of 4 were dead).
 */
const { StatusCodes } = require("http-status-codes");
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const services = require("../services/research-configs");
const maps = require("./entity-maps");
const { facultyOut } = require("./entity-maps");
const { parseFacultyParam } = require("../services/faculty-resolver");
const { INDEXING_VALUES } = require("../utils/constants");

function makeResearchController(service, outMap, { includes = [], findKeys = ["title"], bulkExtra } = {}) {
    const ctl = {
        // legacy duplicate payloads (arrays from cfg.onDuplicate) pass through unmapped
        create: wrap(async (req) => {
            const row = await service.create(req.body);
            return Array.isArray(row) ? row : outMap(row);
        }),

        // legacy exposed /get and an unauthenticated /get/admin twin; both were meant
        // to return the same list (the public one was just buggy) -> one handler.
        getAll: wrap(async (req) => (await service.getAll(req.query, includes)).map(outMap)),

        authGetAll: wrap(async (req) =>
            (await service.getAllForFaculty(req.query, req.user.uniqueFacultyId, includes)).map(outMap)),

        update: wrap(async (req) => outMap(await service.update(req.params.id, req.body))),

        destroy: wrap(async (req) => {
            await service.remove(req.params.id);
            return { deleted: true };
        }),

        bulk: wrap(async (req) => {
            if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
            return service.bulkImport(req.file.path, bulkExtra ? bulkExtra(req.body) : {});
        }),

        /** POST addFaculty — fixed: resolves the entity by id or its natural key,
         *  accepts the faculty list under any legacy key. */
        addFaculty: wrap(async (req) => {
            const codes = req.body.associatedFaculty || req.body.name || req.body.faculties || req.body.Faculty;
            let entity = null;
            if (req.body.id) entity = await service.repo.get(req.body.id);
            for (const key of findKeys) {
                if (entity) break;
                if (req.body[key]) entity = await service.repo.findOne({ [key]: req.body[key] });
            }
            if (!entity) throw new AppError("Target record not found", StatusCodes.NOT_FOUND);
            return service.addFaculty(entity.id, codes);
        }),

        /** GET .../getFaculty — faculty that have at least one linked row. */
        linkedFaculty: wrap(async () => (await service.repo.linkedFaculty()).map(facultyOut)),

        /** GET .../<entity>faculties — rows with their faculty included. */
        withFaculty: wrap(async () => (await service.getAll({}, includes)).map(outMap)),
    };

    /** distinct-values dropdown endpoint bound to one column; optional legacy
     *  '/:facultyId?' param arrives as a faculty code ('CS07'). */
    ctl.distinct = (column, direction = "DESC") =>
        wrap(async (req) => service.repo.distinctValues(column, parseFacultyParam(req.params.facultyId), direction));

    return ctl;
}

const publication = makeResearchController(services.publication, maps.publicationOut, {
    includes: services.publicationIncludes,
    findKeys: ["title", "doi"],
    bulkExtra: (body) => (body.type ? { type: body.type } : {}),
});
// legacy getIndexing ordered SCI(E), Scopus, ESCI first, everything else as 'Other'
publication.indexingValues = wrap(async (req) => {
    const values = await services.publication.repo.distinctValues("indexing", parseFacultyParam(req.params.facultyId));
    return INDEXING_VALUES.filter((v) => values.includes(v));
});

const patent = makeResearchController(services.patent, maps.patentOut, { findKeys: ["referenceNo", "title"] });
const project = makeResearchController(services.project, maps.projectOut, { findKeys: ["referenceNo", "title"] });
const consultancy = makeResearchController(services.consultancy, maps.consultancyOut, { findKeys: ["referenceNo", "title"] });
const researchSupervision = makeResearchController(services.researchSupervision, maps.supervisionOut, {
    includes: services.supervisionIncludes,
    findKeys: ["researchTopic"],
});
const course = makeResearchController(services.course, maps.courseOut, { findKeys: ["courseCode"] });
const event = makeResearchController(services.event, maps.eventOut, { findKeys: ["title"] });
// shipped UI calls /event/getYear although events carry no year column — derive from start_date
event.years = wrap(async () => {
    const { fn, col, Op } = require("sequelize");
    const models = require("../models");
    const rows = await models.Event.findAll({
        attributes: [[fn("DISTINCT", fn("YEAR", col("start_date"))), "value"]],
        where: { startDate: { [Op.not]: null } },
        raw: true,
    });
    return rows.map((r) => r.value).filter(Boolean).sort((a, b) => b - a);
});
// shipped faculty events page polls /event/endDate for its year dropdown
event.endYears = wrap(async () => {
    const { fn, col, Op } = require("sequelize");
    const models = require("../models");
    const rows = await models.Event.findAll({
        attributes: [[fn("DISTINCT", fn("YEAR", col("end_date"))), "value"]],
        where: { endDate: { [Op.not]: null } },
        raw: true,
    });
    return rows.map((r) => r.value).filter(Boolean).sort((a, b) => b - a);
});

module.exports = { publication, patent, project, consultancy, researchSupervision, course, event };
