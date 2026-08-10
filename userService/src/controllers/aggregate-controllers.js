"use strict";
/** Cross-entity aggregates: /count, /analytics, /topentries, /info.
 *  Output shapes match the legacy responses key-for-key (the frontend charts
 *  consume them); the internals are corrected — no hardcoded schema name in raw
 *  SQL, faculty cross-referenced by id instead of a fragile email->index map,
 *  and the BookChapter typo that broke the third "top publication" is gone. */
const { Op } = require("sequelize");
const wrap = require("../utils/wrap");
const models = require("../models");
const services = require("../services/research-configs");
const maps = require("./entity-maps");

/* --------------------------------- /count/get --------------------------------- */
const count = {
    getCounts: wrap(async () => {
        const [staff, faculty, bachelorStudent, patents, ongoingProjects, events,
            pursuingPhd, passedPhd, masterStudent, dualdegreeStudent, publications] = await Promise.all([
            models.Staff.count(),
            models.Faculty.count(),
            models.Student.count({ where: { programId: 1 } }),
            models.Patent.count(),
            models.Project.count({ where: { status: "Ongoing" } }),
            models.Event.count(),
            models.PhdScholar.count({ where: { status: "pursuing" } }),
            models.PhdScholar.count({ where: { status: "passed" } }),
            models.Student.count({ where: { programId: { [Op.in]: [2, 4] } } }),
            models.Student.count({ where: { programId: 3 } }),
            // corrected semantics: every publication counts (legacy counted only rows
            // present in the join table, via raw SQL with the schema name baked in)
            models.Publication.count(),
        ]);
        return {
            staff, faculty, bachelorStudent,
            publication: publications,
            Patent: patents, Project: ongoingProjects, Event: events,
            pursuingPhdScholar: pursuingPhd, passedPhdScholar: passedPhd,
            masterStudent, dualdegreeStudent,
        };
    }),
};

/* ------------------------------- /topentries/get ------------------------------ */
const topEntries = {
    getTopData: wrap(async () => {
        const topOfTypes = async (typeIds) =>
            models.Publication.findAll({
                where: { researchTypeId: { [Op.in]: typeIds } },
                include: [{ model: models.ResearchType, as: "researchType" }],
                order: [["year", "DESC"], ["id", "DESC"]],
                limit: 1,
            });
        const [journal, conference, book, patent, project] = await Promise.all([
            topOfTypes([1]),
            topOfTypes([2]),
            topOfTypes([3, 4]), // legacy meant "BookChapter" but its map typo made this query unfiltered
            models.Patent.findAll({ order: [["year", "DESC"], ["id", "DESC"]], limit: 1 }),
            models.Project.findAll({ order: [["year", "DESC"], ["id", "DESC"]], limit: 1 }),
        ]);
        return [
            ...journal.map(maps.publicationOut),
            ...conference.map(maps.publicationOut),
            ...book.map(maps.publicationOut),
            ...patent.map(maps.patentOut),
            ...project.map(maps.projectOut),
        ];
    }),
};

/* -------------------------------- /analytics/get ------------------------------ */
const analytics = {
    getAllData: wrap(async (req) => {
        const query = req.query || {};
        const facultyWhere = query.name ? { name: query.name } : null;
        // legacy filtered projects by uniqueFacultyId (query.id) while the rest used name
        const projectFacultyWhere = query.id ? { facultyCode: query.id } : facultyWhere;

        const [patents, publications, projects, events, facultyRows] = await Promise.all([
            services.patent.repo.getAllLinked({}, facultyWhere, []),
            services.publication.repo.getAllLinked({}, facultyWhere, [["year", "DESC"]], { include: services.publicationIncludes }),
            services.project.repo.getAllLinked({}, projectFacultyWhere, [["year", "DESC"]]),
            services.event.repo.getAllLinked({}, facultyWhere, []),
            models.Faculty.findAll({ order: [["id", "ASC"]] }),
        ]);

        // legacy UI contract: faculty get synthetic sequential ids (index+1);
        // cross-reference now happens on the real PK instead of the email string
        const syntheticByFacultyId = new Map();
        const facultyData = facultyRows.map((f, index) => {
            syntheticByFacultyId.set(f.id, index + 1);
            return { id: index + 1, name: f.name };
        });
        const idsOf = (row) => (row.faculty || []).map((f) => syntheticByFacultyId.get(f.id)).filter(Boolean);

        const publicationsData = publications.map((p) => ({
            year: p.year != null ? parseInt(p.year, 10) : null,
            facultyIds: idsOf(p),
            type: (p.researchType && p.researchType.name ? p.researchType.name : "journal").toLowerCase(),
            indexing: p.indexing || "unknown",
        }));
        const patentsData = patents.map((p) => ({
            year: p.year != null ? parseInt(p.year, 10) : null,
            status: p.status,
            id: p.id,
            facultyIds: idsOf(p),
        }));
        const projectsData = projects.map((p) => ({
            year: p.year != null ? parseInt(p.year, 10) : null,
            status: p.status,
            id: p.id,
            facultyIds: idsOf(p),
            funding: p.fundingAmount || 0,
        }));
        const eventsData = events.map((e) => ({
            year: e.startDate ? new Date(e.startDate).getFullYear() : null,
            facultyIds: idsOf(e),
            type: e.eventType === "STC" || e.eventType === "E-STC" ? "E-/STC" : e.eventType,
        }));

        return { facultyData, publicationsData, patentsData, projectsData, eventsData };
    }),
};

/* ----------------------------------- /info ----------------------------------- */
const info = {
    info: wrap(async () => ({ message: "API is live" })),
};

module.exports = { count, topEntries, analytics, info };
