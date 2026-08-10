"use strict";
/** Central lookup maps — previously re-hardcoded (with typos) across services. */
const PUBLICATION_TYPES = { journal: 1, conference: 2, book: 3, "book chapter": 4, bookchapter: 4 };
const PUBLICATION_TYPE_NAMES = { 1: "Journal", 2: "Conference", 3: "Book", 4: "BookChapter" };
const SUPERVISION_TYPES = { mtech: 1, "m.tech": 1, phd: 2, "ph.d": 2 };
const PROGRAM_TYPES = { bachelor: 1, master: 2, dualdegree: 3, master_ai: 4 };
const INDEXING_VALUES = ["SCI(E)", "Scopus", "ESCI", "Other"];
const COURSE_LEVELS = ["UG", "PG"];

function lookup(map, value) {
    if (value === null || value === undefined || value === "") return null;
    if (Number.isInteger(Number(value)) && Number(value) > 0) return Number(value);
    return map[String(value).trim().toLowerCase()] || null;
}

module.exports = { PUBLICATION_TYPES, PUBLICATION_TYPE_NAMES, SUPERVISION_TYPES, PROGRAM_TYPES, INDEXING_VALUES, COURSE_LEVELS, lookup };
