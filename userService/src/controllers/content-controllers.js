"use strict";
/** Content/administrative entities. Simple ones come from the CRUD factory;
 *  announcements (merged public+private table) and posts (merged
 *  achievements/academics-news table) get thin category-bound wrappers. */
const { Op, fn, col, where: sqlWhere } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const models = require("../models");
const repos = require("../repositories");
const maps = require("./entity-maps");
const makeCrudController = require("./crud-factory");
const { parseMonth, parseYear } = require("../utils/dates");

/* ------------------------------- announcements ------------------------------- */
function makeAnnouncementController(isPrivate) {
    const base = {
        create: wrap(async (req) => {
            const attrs = maps.announcementIn(req.body, isPrivate);
            // shipped department-notices form sends no date at all — default to today
            if (!attrs.announcedOn) attrs.announcedOn = new Date().toISOString().slice(0, 10);
            return maps.announcementOut(await repos.announcement.create(attrs));
        }),

        getAll: wrap(async (req) => {
            const where = { isPrivate };
            const month = parseMonth(req.query.month);
            const year = parseYear(req.query.year);
            const clauses = [];
            if (month) clauses.push(sqlWhere(fn("MONTH", col("announced_on")), month));
            if (year) clauses.push(sqlWhere(fn("YEAR", col("announced_on")), year));
            if (clauses.length) where[Op.and] = clauses;
            const rows = await repos.announcement.getAll({ where, order: [["announcedOn", "DESC"], ["id", "DESC"]] });
            return rows.map(maps.announcementOut);
        }),

        getOne: wrap(async (req) => {
            // scoped by visibility: a public/private mismatch 404s like a nonexistent id
            const row = await repos.announcement.findOne({ id: req.params.id, isPrivate });
            if (!row) throw new AppError(`Announcement ${req.params.id} not found`, StatusCodes.NOT_FOUND);
            return maps.announcementOut(row);
        }),

        top: wrap(async (req) => {
            const rows = await models.Announcement.findAll({
                where: { isPrivate },
                order: [["announcedOn", "DESC"], ["id", "DESC"]],
                limit: Math.max(parseInt(req.params.limit, 10) || 3, 1),
            });
            return rows.map(maps.announcementOut);
        }),

        update: wrap(async (req) =>
            maps.announcementOut(await repos.announcement.update(req.params.id, maps.announcementIn(req.body)))),

        destroy: wrap(async (req) => {
            await repos.announcement.destroy(req.params.id);
            return { deleted: true };
        }),

        bulk: wrap(async (req) => {
            if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
            const { parseCsvFile, removeQuietly } = require("../utils/csv");
            try {
                const rows = await parseCsvFile(req.file.path);
                const results = [];
                for (const row of rows) {
                    try {
                        const attrs = maps.announcementIn(row, isPrivate);
                        // same default as single create: blank CSV date means today
                        if (!attrs.announcedOn) attrs.announcedOn = new Date().toISOString().slice(0, 10);
                        const created = await repos.announcement.create(attrs);
                        results.push({ status: "success", id: created.id });
                    } catch (err) {
                        results.push({ status: "error", message: err.message, row });
                    }
                }
                return results;
            } finally {
                removeQuietly(req.file.path);
            }
        }),
    };
    // legacy private-announcement title search (was an in-JS filter over all rows)
    base.search = wrap(async (req) => {
        const term = req.query.searchTerm || req.query.searchItem || "";
        const rows = await repos.announcement.getAll({
            where: { isPrivate, title: { [Op.like]: `%${term}%` } },
            order: [["announcedOn", "DESC"]],
        });
        return rows.map(maps.announcementOut);
    });
    return base;
}
const announcement = makeAnnouncementController(false);
const privateAnnouncement = makeAnnouncementController(true);

/* ----------------------------------- posts ----------------------------------- */
function makePostController(category) {
    return {
        create: wrap(async (req) => maps.postOut(await repos.post.create(maps.postIn(req.body, category)))),
        getAll: wrap(async () => {
            const rows = await repos.post.getAll({ where: { category }, order: [["publishedOn", "DESC"], ["id", "DESC"]] });
            return rows.map(maps.postOut);
        }),
        getOne: wrap(async (req) => {
            // scoped by category: an achievement/academic_news mismatch 404s like a nonexistent id
            const row = await repos.post.findOne({ id: req.params.id, category });
            if (!row) throw new AppError(`Post ${req.params.id} not found`, StatusCodes.NOT_FOUND);
            return maps.postOut(row);
        }),
        top: wrap(async (req) => {
            const rows = await models.Post.findAll({
                where: { category },
                order: [["publishedOn", "DESC"], ["id", "DESC"]],
                limit: Math.max(parseInt(req.params.limit, 10) || 3, 1),
            });
            return rows.map(maps.postOut);
        }),
        update: wrap(async (req) => maps.postOut(await repos.post.update(req.params.id, maps.postIn(req.body, category)))),
        destroy: wrap(async (req) => {
            await repos.post.destroy(req.params.id);
            return { deleted: true };
        }),
        bulk: wrap(async (req) => {
            if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
            const { parseCsvFile, removeQuietly } = require("../utils/csv");
            try {
                const rows = await parseCsvFile(req.file.path);
                const results = [];
                for (const row of rows) {
                    try {
                        const created = await repos.post.create(maps.postIn(row, category));
                        results.push({ status: "success", id: created.id });
                    } catch (err) {
                        results.push({ status: "error", message: err.message, row });
                    }
                }
                return results;
            } finally {
                removeQuietly(req.file.path);
            }
        }),
    };
}
const achievement = makePostController("achievement");
const academicsNews = makePostController("academic_news");

/* -------------------------- research news (computed) -------------------------- */
/** The old ReserchNews table was dead — its repository already served the
 *  latest publications/projects/patents. Now that is the only implementation. */
const researchNews = {
    getAll: wrap(async () => {
        const [pubs, projects, patents] = await Promise.all([
            models.Publication.findAll({ order: [["createdAt", "DESC"]], limit: 3 }),
            models.Project.findAll({ order: [["createdAt", "DESC"]], limit: 3 }),
            models.Patent.findAll({ order: [["createdAt", "DESC"]], limit: 3 }),
        ]);
        return [
            ...pubs.map(maps.publicationOut),
            ...projects.map(maps.projectOut),
            ...patents.map(maps.patentOut),
        ];
    }),
    getOne: wrap(async () => {
        throw new AppError("Research news items are computed; fetch the underlying publication/project/patent instead", StatusCodes.NOT_FOUND);
    }),
    // shipped homepage calls /research/top/:limit — newest slice of the computed feed
    top: wrap(async (req) => {
        const limit = Math.max(parseInt(req.params.limit, 10) || 5, 1);
        const [pubs, projects, patents] = await Promise.all([
            models.Publication.findAll({ order: [["createdAt", "DESC"]], limit }),
            models.Project.findAll({ order: [["createdAt", "DESC"]], limit }),
            models.Patent.findAll({ order: [["createdAt", "DESC"]], limit }),
        ]);
        return [
            ...pubs.map(maps.publicationOut),
            ...projects.map(maps.projectOut),
            ...patents.map(maps.patentOut),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }),
};

/* ------------------------------- about (replace) ------------------------------ */
const about = {
    // legacy semantics: creating the about section replaces whatever existed
    create: wrap(async (req) => {
        return models.sequelize.transaction(async (transaction) => {
            await models.AboutSection.destroy({ where: {}, transaction });
            const row = await models.AboutSection.create(maps.aboutIn(req.body), { transaction });
            return maps.simpleOut(row);
        });
    }),
    getAll: wrap(async () => (await repos.aboutSection.getAll({ order: [["id", "DESC"]] })).map(maps.simpleOut)),
    destroy: wrap(async (req) => {
        await repos.aboutSection.destroy(req.params.id);
        return { deleted: true };
    }),
};

/* --------------------------------- singletons --------------------------------- */
const hod = {
    create: wrap(async (req) => maps.hodOut(await repos.hodMessage.create(maps.hodIn(req.body)))),
    get: wrap(async () => maps.hodOut(await models.HodMessage.findOne({ order: [["id", "DESC"]] }))),
    update: wrap(async (req) => maps.hodOut(await repos.hodMessage.update(req.params.id, maps.hodIn(req.body)))),
    destroy: wrap(async (req) => {
        await repos.hodMessage.destroy(req.params.id);
        return { deleted: true };
    }),
};

/* --------------------------- factory-built simple CRUD ------------------------ */
const programOffered = makeCrudController({ repo: repos.programOffered, toOut: maps.simpleOut, fromIn: maps.aboutIn });
const home = makeCrudController({ repo: repos.homeSlide, toOut: maps.homeOut, fromIn: maps.homeIn });
const syllabus = makeCrudController({ repo: repos.syllabus, toOut: maps.docOut, fromIn: maps.docIn });
const calendar = makeCrudController({ repo: repos.calendar, toOut: maps.docOut, fromIn: maps.docIn });
const lab = makeCrudController({ repo: repos.lab, toOut: maps.labOut, fromIn: maps.labIn });
const equipment = makeCrudController({ repo: repos.equipment, toOut: maps.equipmentOut, fromIn: maps.equipmentIn });
const staff = makeCrudController({ repo: repos.staff, toOut: maps.staffOut, fromIn: maps.staffIn });

const qna = makeCrudController({ repo: repos.qna, toOut: maps.simpleOut, fromIn: maps.qnaIn });
// legacy create rejected duplicate questions with 409 (bulk bypassed it — no longer):
// overriding createRow puts the dedup on both the single POST and every bulk CSV row
qna.createRow = async (body) => {
    const attrs = maps.qnaIn(body);
    if (attrs.question && (await repos.qna.findOne({ question: attrs.question }))) {
        throw new AppError("This question already exists", StatusCodes.CONFLICT);
    }
    return repos.qna.create(attrs);
};

const placementStats = makeCrudController({
    repo: repos.placementStat,
    toOut: maps.placementOut,
    fromIn: maps.placementIn,
    listOptions: (q) => {
        const where = {};
        if (q.branch) where.branch = q.branch;
        if (q.year) where.year = parseYear(q.year);
        return { where, order: [["year", "DESC"], ["branch", "ASC"]] };
    },
});
// percentages are DB-generated (STORED) — reload so the create/update response carries them
placementStats.create = wrap(async (req) => {
    const row = await repos.placementStat.create(maps.placementIn(req.body));
    await row.reload();
    return maps.placementOut(row);
});
placementStats.update = wrap(async (req) => {
    const row = await repos.placementStat.update(req.params.id, maps.placementIn(req.body));
    await row.reload();
    return maps.placementOut(row);
});

const phdScholar = makeCrudController({
    repo: repos.phdScholar,
    toOut: maps.phdScholarOut,
    fromIn: maps.phdScholarIn,
    listOptions: (q) => {
        const where = {};
        if (q.query) where.status = q.query; // legacy ?query=pursuing
        if (q.status) where.status = q.status;
        return { where, order: [["id", "DESC"]] };
    },
});

module.exports = {
    announcement, privateAnnouncement, achievement, academicsNews, researchNews,
    about, hod, programOffered, home, syllabus, calendar, lab, equipment, staff,
    qna, placementStats, phdScholar,
};
