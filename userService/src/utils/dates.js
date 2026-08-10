"use strict";
/** Date helpers for legacy payloads: DD/MM/YYYY strings, month names, split date parts. */
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

function parseMonth(value) {
    if (value === undefined) return undefined; // absent on a partial update — preserve the column
    if (value === null || value === "") return null;
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
    const idx = MONTHS.indexOf(String(value).trim().toLowerCase());
    return idx >= 0 ? idx + 1 : null;
}

function parseYear(value) {
    if (value === undefined) return undefined; // absent on a partial update — preserve the column
    if (value === null || value === "") return null;
    const m = String(value).match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : null;
}

/** Accepts Date, 'YYYY-MM-DD', ISO strings, and legacy 'DD/MM/YYYY' / 'D-M-YYYY'. */
function parseFlexibleDate(value) {
    if (value === undefined) return undefined; // absent on a partial update — preserve the column
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const s = String(value).trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Legacy announcements sent {date, month, year} as separate strings. */
function composeDate({ date, month, year }) {
    const y = parseYear(year);
    if (!y) return null;
    const mo = parseMonth(month) || 1;
    let day = parseInt(date, 10);
    if (!Number.isInteger(day) || day < 1 || day > 31) day = 1;
    return `${y}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Reverse: one DATE column back into the legacy {date, month, year} response parts. */
function toLegacyParts(dateOnly) {
    if (!dateOnly) return { date: null, month: null, year: null };
    const [y, m, d] = String(dateOnly).slice(0, 10).split("-");
    const name = MONTHS[parseInt(m, 10) - 1] || null;
    return { date: d, month: name ? name[0].toUpperCase() + name.slice(1) : null, year: y };
}

module.exports = { parseMonth, parseYear, parseFlexibleDate, composeDate, toLegacyParts, MONTHS };
