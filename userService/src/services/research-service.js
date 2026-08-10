"use strict";
/**
 * One parameterized service for the seven faculty-linked research entities
 * (publications, patents, projects, consultancies, research supervisions,
 * courses, events) — replacing seven near-copies that differed mainly in bugs.
 *
 * Corrected behavior vs legacy:
 *  - duplicate-key creates return 409 instead of silently inserting anyway
 *  - faculty links are attached by resolved id inside the SAME transaction
 *    (legacy re-found the parent by title and often linked outside the txn)
 *  - update replaces the link set atomically
 *  - bulk import reads the per-request uploaded CSV, one transaction per file
 */
const { StatusCodes } = require("http-status-codes");
const { sequelize } = require("../models");
const AppError = require("../utils/app-error");
const { splitList } = require("../utils/legacy");
const { parseCsvFile, removeQuietly } = require("../utils/csv");
const facultyResolver = require("./faculty-resolver");

class ResearchService {
    /**
     * @param {LinkedRepository} repo
     * @param {object} cfg
     *   fromIn(body)      -> clean attrs
     *   dedupWhere(attrs) -> where clause identifying "the same record", or null
     *   linkKeys          -> body keys that may carry the faculty list (legacy drift)
     *   label             -> entity name for messages
     */
    constructor(repo, cfg) {
        this.repo = repo;
        this.cfg = cfg;
    }

    extractFacultyCodes(body) {
        for (const key of this.cfg.linkKeys) {
            if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
                return splitList(body[key]);
            }
        }
        return null; // key absent -> "don't touch links" (create: no links)
    }

    async assertNotDuplicate(attrs, transaction) {
        const where = this.cfg.dedupWhere ? this.cfg.dedupWhere(attrs) : null;
        if (!where) return null;
        const existing = await this.repo.findOne(where, { transaction });
        if (existing) {
            // per-config legacy override: cfg.onDuplicate(existing) returns the
            // legacy 200 payload instead of the corrected 409 (researchSupervision)
            if (this.cfg.onDuplicate) return this.cfg.onDuplicate(existing);
            throw new AppError(`${this.cfg.label} already exists (${JSON.stringify(where)})`, StatusCodes.CONFLICT);
        }
        return null;
    }

    async create(body) {
        const attrs = this.cfg.fromIn(body);
        const codes = this.extractFacultyCodes(body) || [];
        return sequelize.transaction(async (transaction) => {
            const duplicatePayload = await this.assertNotDuplicate(attrs, transaction);
            if (duplicatePayload) return duplicatePayload;
            const facultyIds = await facultyResolver.resolveCodes(codes, transaction);
            const row = await this.repo.create(attrs, { transaction });
            if (facultyIds.length) {
                await this.repo.joinModel.bulkCreate(
                    facultyIds.map((facultyId) => ({ [this.repo.otherKey]: row.id, facultyId })),
                    { transaction, ignoreDuplicates: true }
                );
            }
            return row;
        });
    }

    async update(id, body) {
        const attrs = this.cfg.fromIn(body);
        const codes = this.extractFacultyCodes(body);
        return sequelize.transaction(async (transaction) => {
            const row = await this.repo.update(id, attrs, { transaction });
            if (codes !== null) {
                const facultyIds = await facultyResolver.resolveCodes(codes, transaction);
                await this.repo.setFacultyLinks(row.id, facultyIds, transaction);
            }
            return row;
        });
    }

    async addFaculty(entityId, facultyCode) {
        const facultyIds = await facultyResolver.resolveCodes(splitList(facultyCode));
        await this.repo.get(entityId);
        await this.repo.joinModel.bulkCreate(
            facultyIds.map((facultyId) => ({ [this.repo.otherKey]: entityId, facultyId })),
            { ignoreDuplicates: true }
        );
        return { linked: facultyIds.length };
    }

    async remove(id) {
        return this.repo.destroy(id); // join rows go by FK cascade
    }

    /** CSV bulk import; `extra` merges into every row (e.g. publication type from body). */
    async bulkImport(filePath, extra = {}) {
        const results = [];
        try {
            const rows = await parseCsvFile(filePath);
            await sequelize.transaction(async (transaction) => {
                for (const raw of rows) {
                    const attrs = this.cfg.fromIn({ ...raw, ...extra });
                    const where = this.cfg.dedupWhere ? this.cfg.dedupWhere(attrs) : null;
                    if (where && Object.values(where).some((v) => v === undefined || v === null || v === "")) {
                        results.push({ status: "skipped", reason: "missing dedup key", row: raw });
                        continue;
                    }
                    if (where && (await this.repo.findOne(where, { transaction }))) {
                        results.push({ status: "skipped", reason: "duplicate", row: raw });
                        continue;
                    }
                    const codes = splitList(raw.associatedFaculty || raw.facultyNames || raw.faculties);
                    const facultyIds = await facultyResolver.resolveCodes(codes, transaction);
                    const row = await this.repo.create(attrs, { transaction });
                    if (facultyIds.length) {
                        await this.repo.joinModel.bulkCreate(
                            facultyIds.map((facultyId) => ({ [this.repo.otherKey]: row.id, facultyId })),
                            { transaction, ignoreDuplicates: true }
                        );
                    }
                    results.push({ status: "success", id: row.id });
                }
            });
        } finally {
            removeQuietly(filePath);
        }
        return results;
    }

    async getAll(query, extraIncludes = []) {
        const { where, facultyWhere, order } = this.cfg.filter(query || {});
        return this.repo.getAllLinked(where, facultyWhere, order, { include: extraIncludes });
    }

    /** Auth-scoped list: rows linked to the JWT's faculty. */
    async getAllForFaculty(query, facultyCode, extraIncludes = []) {
        const { where, order } = this.cfg.filter(query || {});
        return this.repo.getAllLinked(where, { facultyCode }, order, { include: extraIncludes });
    }
}

module.exports = ResearchService;
