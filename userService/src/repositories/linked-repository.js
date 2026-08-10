"use strict";
const { Op, fn, col } = require("sequelize");
const BaseRepository = require("./base-repository");
const models = require("../models");

/** Repository for entities in an M:N relation with Faculty
 *  (publications, patents, projects, consultancies, research supervisions, courses, events).
 *
 *  Replaces seven copy-pasted repository classes, each with a public/admin method pair
 *  whose public variant had the `{id:'null'}` empty-result bug. One implementation:
 *  - no faculty filter  -> plain list with all linked faculty included
 *  - faculty filter     -> two-phase (ids first), so the response still includes ALL
 *    co-authors of each matched row, matching the legacy response shape. */
class LinkedRepository extends BaseRepository {
    /**
     * @param {object} model        entity model
     * @param {object} joinModel    through model
     * @param {string} otherKey     FK attr on the join pointing at the entity (e.g. 'publicationId')
     * @param {string} facultyAlias alias of this entity on the Faculty model (e.g. 'publications')
     */
    constructor(model, joinModel, otherKey, facultyAlias) {
        super(model);
        this.joinModel = joinModel;
        this.otherKey = otherKey;
        this.facultyAlias = facultyAlias;
    }

    facultyInclude(extra = {}) {
        return {
            model: models.Faculty,
            as: "faculty",
            attributes: ["id", "facultyCode", "name", "email", "position", "photoUrl"],
            through: { attributes: [] },
            required: false,
            ...extra,
        };
    }

    /**
     * @param {object} where          entity-level where
     * @param {object} facultyWhere   optional Faculty where ({id}/{name}/{facultyCode})
     * @param {array}  order
     * @param {object} extras         {include: [...more includes], limit}
     */
    async getAllLinked(where = {}, facultyWhere = null, order = [], extras = {}) {
        let idScope = null;
        if (facultyWhere && Object.keys(facultyWhere).length) {
            const matches = await this.model.findAll({
                attributes: ["id"],
                include: [{ model: models.Faculty, as: "faculty", attributes: [], where: facultyWhere, through: { attributes: [] }, required: true }],
                raw: true,
            });
            idScope = matches.map((m) => m.id);
            if (!idScope.length) return [];
        }
        return this.model.findAll({
            where: idScope ? { ...where, id: { [Op.in]: idScope } } : where,
            include: [this.facultyInclude(), ...(extras.include || [])],
            order,
            ...(extras.limit ? { limit: extras.limit } : {}),
        });
    }

    /** DISTINCT non-null values of a column, optionally scoped to one faculty id. */
    async distinctValues(column, facultyId = null, direction = "DESC") {
        const rows = await this.model.findAll({
            attributes: [[fn("DISTINCT", col(`${this.model.name}.${column}`)), "value"]],
            include: facultyId
                ? [{ model: models.Faculty, as: "faculty", attributes: [], through: { attributes: [] }, where: { id: facultyId }, required: true }]
                : [],
            where: { [column]: { [Op.not]: null } },
            raw: true,
        });
        const values = [...new Set(rows.map((r) => r.value).filter((v) => v !== null && v !== ""))];
        // case-insensitive ascending ('Dharamshala' before 'DR...'), reversed for the default DESC
        values.sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: "base" }));
        if (direction !== "ASC") values.reverse();
        return values;
    }

    /** Faculty rows that have at least one link to this entity (legacy getFaculty endpoints). */
    async linkedFaculty() {
        return models.Faculty.findAll({
            include: [{ model: this.model, as: this.facultyAlias, attributes: [], through: { attributes: [] }, required: true }],
            order: [["name", "ASC"]],
        });
    }

    /** Replace the faculty link set for one entity row (used by updates), in a transaction. */
    async setFacultyLinks(entityId, facultyIds, transaction) {
        const existing = await this.joinModel.findAll({ where: { [this.otherKey]: entityId }, transaction });
        const current = new Set(existing.map((r) => r.facultyId));
        const wanted = new Set(facultyIds);
        const toRemove = [...current].filter((id) => !wanted.has(id));
        const toAdd = [...wanted].filter((id) => !current.has(id));
        if (toRemove.length) {
            await this.joinModel.destroy({ where: { [this.otherKey]: entityId, facultyId: { [Op.in]: toRemove } }, transaction });
        }
        if (toAdd.length) {
            await this.joinModel.bulkCreate(toAdd.map((facultyId) => ({ [this.otherKey]: entityId, facultyId })), { transaction, ignoreDuplicates: true });
        }
        return { added: toAdd.length, removed: toRemove.length };
    }
}

module.exports = LinkedRepository;
