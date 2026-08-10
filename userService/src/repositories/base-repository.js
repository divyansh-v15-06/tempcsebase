"use strict";
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/app-error");

/** Fixed CRUD base. The legacy version dropped every options/transaction argument
 *  (create/destroy took one param), swallowed errors, and re-read the shared CSV file
 *  inside bulkCreate. */
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data, options = {}) {
        return this.model.create(data, options);
    }

    async bulkCreate(rows, options = {}) {
        return this.model.bulkCreate(rows, options);
    }

    async get(id, options = {}) {
        const row = await this.model.findByPk(id, options);
        if (!row) throw new AppError(`${this.model.name} ${id} not found`, StatusCodes.NOT_FOUND);
        return row;
    }

    async getAll(query = {}) {
        return this.model.findAll(query);
    }

    async update(id, data, options = {}) {
        const row = await this.get(id, { transaction: options.transaction });
        await row.update(data, options);
        return row;
    }

    async destroy(id, options = {}) {
        const removed = await this.model.destroy({ where: { id }, ...options });
        if (!removed) throw new AppError(`${this.model.name} ${id} not found`, StatusCodes.NOT_FOUND);
        return removed;
    }

    async findOne(where, options = {}) {
        return this.model.findOne({ where, ...options });
    }

    async count(where = {}) {
        return this.model.count({ where });
    }

    async getTopN(limit, order = [["id", "DESC"]]) {
        return this.model.findAll({ limit: Math.max(parseInt(limit, 10) || 3, 1), order });
    }
}

module.exports = BaseRepository;
