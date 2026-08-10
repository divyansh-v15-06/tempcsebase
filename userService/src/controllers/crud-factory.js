"use strict";
/** Generic CRUD controller factory. The legacy codebase re-implemented these six
 *  handlers ~30 times with copy-paste drift; entities now declare {repo, in, out}. */
const wrap = require("../utils/wrap");
const AppError = require("../utils/app-error");
const { StatusCodes } = require("http-status-codes");
const { parseCsvFile, removeQuietly } = require("../utils/csv");

function makeCrudController({ repo, toOut, fromIn, listOptions, topOrder }) {
    const controller = {
        /** Per-row create shared by create and bulk. Entities with per-row rules
         *  (dedup, defaults) override this so both paths pick them up. */
        createRow: async (body) => repo.create(fromIn(body)),

        create: wrap(async (req) => toOut(await controller.createRow(req.body))),

        getAll: wrap(async (req) => {
            const options = listOptions ? listOptions(req.query) : {};
            const rows = await repo.getAll(options);
            return rows.map(toOut);
        }),

        getOne: wrap(async (req) => toOut(await repo.get(req.params.id))),

        update: wrap(async (req) => toOut(await repo.update(req.params.id, fromIn(req.body)))),

        destroy: wrap(async (req) => {
            await repo.destroy(req.params.id !== undefined ? req.params.id : req.body.id);
            return { deleted: true };
        }),

        top: wrap(async (req) => {
            const rows = await repo.getTopN(req.params.limit, topOrder);
            return rows.map(toOut);
        }),

        /** Bulk CSV import from the per-request uploaded file (legacy shared one fixed path). */
        bulk: wrap(async (req) => {
            if (!req.file) throw new AppError("No CSV file uploaded (field name: avatar)", StatusCodes.BAD_REQUEST);
            try {
                const rows = await parseCsvFile(req.file.path);
                const results = [];
                for (const row of rows) {
                    try {
                        const created = await controller.createRow(row);
                        results.push({ status: "success", id: created.id });
                    } catch (err) {
                        // per-row conflicts (e.g. QnA duplicate questions) are skips, not failures
                        const status = err.statusCode === StatusCodes.CONFLICT ? "skipped" : "error";
                        results.push({ status, message: err.message, row });
                    }
                }
                return results;
            } finally {
                removeQuietly(req.file.path);
            }
        }),
    };
    return controller;
}

module.exports = makeCrudController;
