"use strict";
/** Legacy API compatibility helpers.
 *  The frontend speaks the old field names (pdfLink, shorting, uniqueFacultyId, ...);
 *  the DB speaks the clean ones. Mapping is declarative per entity. */

function splitList(value) {
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    if (value === null || value === undefined || value === "") return [];
    return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

/** Build body -> model attrs using {legacyKey: attrName}; attrName may be a
 *  function (body) => partial object for computed fields. Unknown keys are ignored. */
function fromLegacy(body, mapping) {
    const out = {};
    for (const [key, target] of Object.entries(mapping)) {
        if (typeof target === "function") {
            Object.assign(out, target(body) || {});
        } else if (body[key] !== undefined) {
            out[target] = body[key] === "" ? null : body[key];
        }
    }
    return out;
}

/** Serialize a model instance to the legacy response shape using {attrName: legacyKey}.
 *  Attrs not in the mapping pass through under their own name. */
function toLegacy(instance, mapping = {}, extra = {}) {
    if (!instance) return instance;
    const plain = typeof instance.get === "function" ? instance.get({ plain: true }) : { ...instance };
    const out = {};
    for (const [attr, value] of Object.entries(plain)) {
        const key = mapping[attr];
        if (key === null) continue;               // drop
        out[key || attr] = value;
    }
    return Object.assign(out, extra);
}

function mapAll(rows, mapper) {
    return (rows || []).map(mapper);
}

module.exports = { splitList, fromLegacy, toLegacy, mapAll };
