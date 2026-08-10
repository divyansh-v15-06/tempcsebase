"use strict";
/** Per-entity configuration for ResearchService: input mapping, dedup identity
 *  (the keys the legacy services already used), legacy link-list body keys, and
 *  read-filter translation (legacy query params -> clean columns).
 *
 *  Legacy quirk preserved on purpose: `query.name` means Faculty.name for
 *  publications/patents/events, but a faculty CODE for projects (the old
 *  services disagreed; the frontend sends accordingly). */
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const models = require("../models");
const repos = require("../repositories");
const ResearchService = require("./research-service");
const AppError = require("../utils/app-error");
const maps = require("../controllers/entity-maps");
const { parseYear, parseMonth } = require("../utils/dates");
const { lookup, PUBLICATION_TYPES, SUPERVISION_TYPES, INDEXING_VALUES, COURSE_LEVELS } = require("../utils/constants");

function yearRange(query, col = "year") {
    const start = parseYear(query.startYear) || 1999;
    const end = parseYear(query.endYear) || new Date().getFullYear() + 1;
    if (!query.startYear && !query.endYear) return null;
    return { [col]: { [Op.between]: [start, end] } };
}

/** Same startYear/endYear contract as yearRange(), for entities keyed by a DATE
 *  column (events store start_date, not a year int). */
function dateYearRange(query, col) {
    const start = parseYear(query.startYear) || 1999;
    const end = parseYear(query.endYear) || new Date().getFullYear() + 1;
    if (!query.startYear && !query.endYear) return null;
    return { [col]: { [Op.between]: [`${start}-01-01`, `${end}-12-31`] } };
}

const publication = new ResearchService(repos.publication, {
    label: "Publication",
    fromIn: maps.publicationIn,
    dedupWhere: (a) => (a.doi ? { doi: a.doi } : null),
    linkKeys: ["associatedFaculty"],
    filter: (q) => {
        const where = {};
        const typeId = lookup(PUBLICATION_TYPES, q.type);
        if (typeId) where.researchTypeId = typeId;
        if (q.academicSession) where.academicSession = q.academicSession;
        if (q.journalQuartile) where.journalQuartile = q.journalQuartile;
        if (q.indexing) {
            where.indexing = q.indexing === "Other"
                ? { [Op.notIn]: INDEXING_VALUES.filter((v) => v !== "Other") }
                : q.indexing;
        }
        const yr = yearRange(q);
        if (yr) Object.assign(where, yr);
        if (q.startMonth || q.endMonth) {
            where.month = { [Op.between]: [parseMonth(q.startMonth) || 1, parseMonth(q.endMonth) || 12] };
        }
        const facultyWhere = q.name ? { name: q.name } : null;
        return { where, facultyWhere, order: [["year", "DESC"]] };
    },
});

const patent = new ResearchService(repos.patent, {
    label: "Patent",
    fromIn: maps.patentIn,
    dedupWhere: (a) => (a.referenceNo ? { referenceNo: a.referenceNo } : null),
    linkKeys: ["associatedFaculty", "facultyNames", "faculties"],
    filter: (q) => {
        const where = {};
        if (q.academicSession) where.academicSession = q.academicSession;
        if (q.status) where.status = q.status;
        const yr = yearRange(q);
        if (yr) Object.assign(where, yr);
        const facultyWhere = q.name ? { name: q.name } : null;
        return { where, facultyWhere, order: [["year", "DESC"]] };
    },
});

const project = new ResearchService(repos.project, {
    label: "Project",
    fromIn: maps.projectIn,
    dedupWhere: (a) => (a.referenceNo ? { referenceNo: a.referenceNo } : null),
    // legacy create sent the faculty list under `authorName`; update under `associatedFaculty`
    linkKeys: ["associatedFaculty", "faculties", "authorName"],
    filter: (q) => {
        const where = {};
        if (q.academicSession) where.academicSession = q.academicSession;
        if (q.status) where.status = q.status;
        if (q.fundingAgency) where.fundingAgency = q.fundingAgency;
        const yr = yearRange(q);
        if (yr) Object.assign(where, yr);
        const facultyWhere = q.name ? { facultyCode: q.name } : null; // legacy: name == uniqueFacultyId here
        return { where, facultyWhere, order: [["year", "DESC"]] };
    },
});

const consultancy = new ResearchService(repos.consultancy, {
    label: "Consultancy",
    fromIn: maps.consultancyIn,
    dedupWhere: (a) => (a.referenceNo ? { referenceNo: a.referenceNo } : null),
    linkKeys: ["associatedFaculty", "faculties"],
    filter: (q) => {
        const where = {};
        if (q.academicSession) where.academicSession = q.academicSession;
        if (q.status) where.status = q.status;
        if (q.clientOrganisation) where.clientOrganisation = q.clientOrganisation;
        if (q.startYear) where.startYear = parseYear(q.startYear);
        // shipped consultancies pages send the faculty dropdown as ?type=<name>;
        // the research pages send ?faculty=<name>
        const facultyName = q.name || q.faculty || q.type;
        const facultyWhere = facultyName ? { name: facultyName } : null;
        return { where, facultyWhere, order: [["startYear", "DESC"]] };
    },
});

const researchSupervision = new ResearchService(repos.researchSupervision, {
    label: "Research supervision",
    fromIn: maps.supervisionIn,
    dedupWhere: (a) => (a.researchTopic ? { researchTopic: a.researchTopic } : null),
    // legacy contract: the shipped researchSupervision page expects HTTP 200 with
    // data[0].message on a duplicate create (shows its toast), not the 409 the
    // other entities get.
    onDuplicate: () => [{ message: "Duplicate Topic found, skipping creation" }],
    linkKeys: ["associatedFaculty", "faculties"],
    filter: (q) => {
        const where = {};
        const typeId = lookup(SUPERVISION_TYPES, q.program);
        if (typeId) where.supervisionTypeId = typeId;
        if (q.academicSession) where.academicSession = q.academicSession;
        if (q.status) where.status = q.status;
        const yr = yearRange(q);
        if (yr) Object.assign(where, yr);
        const facultyWhere = q.name ? { name: q.name } : null;
        return { where, facultyWhere, order: [["year", "DESC"]] };
    },
});

const course = new ResearchService(repos.course, {
    label: "Course",
    // validate the ENUM up front: an unknown level otherwise dies in MariaDB as a 500 truncation error
    fromIn: (b) => {
        const attrs = maps.courseIn(b);
        if (attrs.courseLevel !== undefined && !COURSE_LEVELS.includes(attrs.courseLevel)) {
            throw new AppError(`Invalid courseLevel '${attrs.courseLevel}' (expected ${COURSE_LEVELS.join(" or ")})`, StatusCodes.BAD_REQUEST);
        }
        return attrs;
    },
    dedupWhere: (a) => (a.courseCode && a.academicYear ? { courseCode: a.courseCode, academicYear: a.academicYear } : (a.courseCode ? { courseCode: a.courseCode } : null)),
    linkKeys: ["associatedFaculty", "faculties"],
    filter: (q) => {
        const where = {};
        if (q.academicSession || q.academicYear) where.academicYear = q.academicSession || q.academicYear;
        if (q.semester) where.semester = parseInt(q.semester, 10);
        if (q.courseLevel) where.courseLevel = q.courseLevel;
        const facultyWhere = q.name ? { name: q.name } : null;
        return { where, facultyWhere, order: [["academicYear", "DESC"]] };
    },
});

const event = new ResearchService(repos.event, {
    label: "Event",
    fromIn: maps.eventIn,
    dedupWhere: (a) => (a.startDate && a.title ? { title: a.title, startDate: a.startDate } : null),
    linkKeys: ["associatedFaculty", "faculties", "Faculty"],
    filter: (q) => {
        const where = {};
        if (q.category) where.category = q.category;
        if (q.type) where.eventType = q.type;
        if (q.academicSession) where.academicSession = q.academicSession;
        const yr = dateYearRange(q, "startDate"); // year dropdowns filter the DATE column
        if (yr) Object.assign(where, yr);
        const facultyName = q.name || q.faculty; // shipped page sends ?faculty=<name>
        const facultyWhere = facultyName ? { name: facultyName } : null;
        return { where, facultyWhere, order: [["startDate", "DESC"]] };
    },
});

/** Include lookups needed by the legacy response shapes. */
const publicationIncludes = [{ model: models.ResearchType, as: "researchType" }];
const supervisionIncludes = [{ model: models.SupervisionType, as: "supervisionType" }];

module.exports = {
    publication, patent, project, consultancy, researchSupervision, course, event,
    publicationIncludes, supervisionIncludes,
};
