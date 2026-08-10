"use strict";
/**
 * Legacy-API compatibility maps.
 *
 * The frontend speaks the OLD field names (pdfLink, shorting, uniqueFacultyId,
 * Convenor, vender, filledDate, ...). The database now speaks the clean schema.
 * Every entity gets:
 *   in(body)  -> clean model attributes  (accepts legacy AND clean field names)
 *   out(row)  -> legacy response object
 */
const { parseFlexibleDate, parseMonth, parseYear, composeDate, toLegacyParts } = require("../utils/dates");
const { lookup, PUBLICATION_TYPES, SUPERVISION_TYPES, PROGRAM_TYPES } = require("../utils/constants");

const val = (...candidates) => candidates.find((c) => c !== undefined);
const plain = (row) => (row && typeof row.get === "function" ? row.get({ plain: true }) : row);
const emptyToNull = (v) => (typeof v === "string" && v.trim() === "" ? null : v);

/* ---------------------------------------------------------------- faculty */
function facultyOut(row) {
    const f = plain(row);
    if (!f) return f;
    return {
        id: f.id,
        uniqueFacultyId: f.facultyCode,
        name: f.name,
        // legacy '---' sentinel: temporary faculty stored as position NULL + is_permanent 0
        position: !f.isPermanent && f.position == null ? "---" : f.position,
        phoneNo: f.phone,
        email: f.email,
        portfolio: f.portfolioUrl,
        photo: f.photoUrl,
        shorting: f.sortOrder,
        researchInterests: f.researchInterests,
        isPermanent: f.isPermanent,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
    };
}
function facultyIn(b) {
    const out = {
        name: b.name,
        position: b.position,
        phone: val(b.phoneNo, b.phone, b.phone_no),
        email: b.email,
        portfolioUrl: emptyToNull(val(b.portfolio, b.portfolioUrl)), // '' would collide on UNIQUE portfolio_url
        photoUrl: emptyToNull(val(b.photo, b.photoUrl)),
        researchInterests: b.researchInterests,
    };
    const shorting = val(b.shorting, b.sortOrder);
    if (shorting !== undefined) {
        const n = parseInt(String(shorting).trim(), 10);
        out.sortOrder = Number.isNaN(n) ? null : n;
    }
    const isPermanent = val(b.isPermanent, b.parmanent);
    if (isPermanent !== undefined) out.isPermanent = isPermanent;
    // legacy '---' sentinel: temporary faculty -> position NULL + is_permanent 0
    if (typeof out.position === "string" && out.position.trim() === "---") {
        out.position = null;
        if (isPermanent === undefined) out.isPermanent = false;
    }
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ------------------------------------------------------------ publications */
function publicationOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id,
        name: p.venueName,
        title: p.title,
        volume: p.volume,
        pageNo: p.pageRange,
        issue: p.issue,
        year: p.year,
        academicSession: p.academicSession,
        doi: p.doi,
        month: p.month,
        type: p.researchTypeId,
        indexing: p.indexing,
        authorName: p.authorText,
        isbn: p.isbn,
        journalQuartile: p.journalQuartile,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        research_detail: p.researchType ? { id: p.researchType.id, name: p.researchType.name } : undefined,
        faculty_detail: p.faculty ? p.faculty.map(facultyOut) : undefined,
    };
}
function publicationIn(b) {
    const out = {
        venueName: val(b.name, b.venueName),
        title: b.title,
        volume: b.volume,
        pageRange: val(b.pageNo, b.pageRange),
        issue: b.issue,
        year: parseYear(b.year),
        month: parseMonth(b.month),
        academicSession: b.academicSession,
        doi: b.doi,
        researchTypeId: lookup(PUBLICATION_TYPES, val(b.type, b.researchTypeId)),
        indexing: b.indexing || undefined,
        authorText: val(b.authorName, b.authorText),
        isbn: b.isbn,
        journalQuartile: b.journalQuartile || undefined,
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ---------------------------------------------------------------- patents */
function patentOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id, title: p.title, status: p.status, year: p.year, month: p.month,
        place: p.place, filledDate: p.filedDate, grantedDate: p.grantedDate,
        academicSession: p.academicSession, referenceNo: p.referenceNo,
        authorName: p.authorText, createdAt: p.createdAt, updatedAt: p.updatedAt,
        faculties: p.faculty ? p.faculty.map(facultyOut) : undefined,
    };
}
function patentIn(b) {
    const out = {
        title: b.title, status: b.status,
        year: parseYear(b.year), month: parseMonth(b.month), place: b.place,
        filedDate: parseFlexibleDate(val(b.filledDate, b.filedDate)),
        grantedDate: parseFlexibleDate(b.grantedDate),
        academicSession: b.academicSession,
        referenceNo: emptyToNull(val(b.referenceNo, b.referenceId)),
        authorText: val(b.authorName, b.authorText),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ---------------------------------------------------------------- projects */
function projectOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id, title: p.title, status: p.status, referenceNo: p.referenceNo,
        fundingAgency: p.fundingAgency, fundingAmount: p.fundingAmount, duration: p.duration,
        year: p.year, month: p.month, academicSession: p.academicSession,
        principalInvestigator: p.principalInvestigator, coprincipalInvestigator: p.coPrincipalInvestigator,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
        faculties: p.faculty ? p.faculty.map(facultyOut) : undefined,
    };
}
function projectIn(b) {
    const out = {
        title: b.title, status: b.status, referenceNo: emptyToNull(b.referenceNo),
        fundingAgency: b.fundingAgency,
        fundingAmount: b.fundingAmount === "" ? null : b.fundingAmount,
        duration: b.duration, year: parseYear(b.year), month: parseMonth(b.month),
        academicSession: b.academicSession,
        principalInvestigator: b.principalInvestigator,
        coPrincipalInvestigator: val(b.coprincipalInvestigator, b.coPrincipalInvestigator),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ------------------------------------------------------------ consultancies */
function consultancyOut(row) {
    const c = plain(row);
    if (!c) return c;
    return {
        id: c.id, referenceNo: c.referenceNo, title: c.title,
        clientOrganisation: c.clientOrganisation, amount: c.amount,
        startYear: c.startYear, academicSession: c.academicSession, status: c.status,
        authorName: c.authorText, createdAt: c.createdAt, updatedAt: c.updatedAt,
        faculties: c.faculty ? c.faculty.map(facultyOut) : undefined,
    };
}
function consultancyIn(b) {
    const out = {
        referenceNo: emptyToNull(b.referenceNo), title: b.title, clientOrganisation: b.clientOrganisation,
        amount: b.amount === "" ? null : b.amount, startYear: parseYear(b.startYear),
        academicSession: b.academicSession, status: b.status,
        authorText: val(b.authorName, b.authorText),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ---------------------------------------------------- research supervisions */
function supervisionOut(row) {
    const s = plain(row);
    if (!s) return s;
    return {
        id: s.id, program: s.supervisionTypeId, scholarName: s.scholarName, rollNo: s.rollNo,
        researchTopic: s.researchTopic, status: s.status, year: s.year,
        academicSession: s.academicSession, coSupervisior: s.coSupervisor,
        createdAt: s.createdAt, updatedAt: s.updatedAt,
        supervisionTypes: s.supervisionType ? { id: s.supervisionType.id, name: s.supervisionType.name } : undefined,
        faculty_detail: s.faculty ? s.faculty.map(facultyOut) : undefined,
    };
}
function supervisionIn(b) {
    const out = {
        supervisionTypeId: lookup(SUPERVISION_TYPES, val(b.program, b.type, b.supervisionTypeId)),
        scholarName: b.scholarName, rollNo: b.rollNo, researchTopic: b.researchTopic,
        status: b.status, year: parseYear(b.year), academicSession: b.academicSession,
        coSupervisor: val(b.coSupervisior, b.coSupervisor),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ---------------------------------------------------------------- courses */
function courseOut(row) {
    const c = plain(row);
    if (!c) return c;
    return {
        id: c.id, courseCode: c.courseCode, courseName: c.courseName, semester: c.semester,
        courseLevel: c.courseLevel, lectureHours: c.lectureHours, tutorialHours: c.tutorialHours,
        practicalHours: c.practicalHours, academicYear: c.academicYear,
        createdAt: c.createdAt, updatedAt: c.updatedAt,
        faculty_detail: c.faculty ? c.faculty.map(facultyOut) : undefined,
    };
}
function courseIn(b) {
    const out = {
        courseCode: b.courseCode, courseName: b.courseName,
        semester: b.semester !== undefined ? parseInt(b.semester, 10) : undefined,
        courseLevel: b.courseLevel,
        lectureHours: b.lectureHours !== undefined ? parseInt(b.lectureHours, 10) : undefined,
        tutorialHours: b.tutorialHours !== undefined ? parseInt(b.tutorialHours, 10) : undefined,
        practicalHours: b.practicalHours !== undefined ? parseInt(b.practicalHours, 10) : undefined,
        academicYear: b.academicYear,
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ----------------------------------------------------------------- events */
function eventOut(row) {
    const e = plain(row);
    if (!e) return e;
    return {
        id: e.id, category: e.category, type: e.eventType, title: e.title, venue: e.venue,
        sponsoringAgency: e.sponsoringAgency, startDate: e.startDate, endDate: e.endDate,
        academicSession: e.academicSession, Convenor: e.convenor, Coordinator: e.coordinator,
        Link: e.linkUrl, createdAt: e.createdAt, updatedAt: e.updatedAt,
        faculties: e.faculty ? e.faculty.map(facultyOut) : undefined,
    };
}
function eventIn(b) {
    const out = {
        category: b.category, eventType: val(b.type, b.eventType), title: b.title, venue: b.venue,
        sponsoringAgency: b.sponsoringAgency,
        startDate: parseFlexibleDate(b.startDate), endDate: parseFlexibleDate(b.endDate),
        academicSession: b.academicSession,
        convenor: val(b.Convenor, b.convenor), coordinator: val(b.Coordinator, b.coordinator),
        linkUrl: val(b.Link, b.linkUrl),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ----------------------------------------------------- announcements/posts */
function announcementOut(row) {
    const a = plain(row);
    if (!a) return a;
    return {
        id: a.id, title: a.title, pdfLink: a.pdfUrl,
        ...toLegacyParts(a.announcedOn),
        announcedOn: a.announcedOn, isPrivate: a.isPrivate,
        createdAt: a.createdAt, updatedAt: a.updatedAt,
    };
}
function announcementIn(b, isPrivate) {
    const announcedOn = parseFlexibleDate(b.announcedOn) ||
        composeDate({ date: b.date, month: b.month, year: b.year }) ||
        parseFlexibleDate(b.date);
    // `link` alias: the shipped department-notices form sends the pdf under that key
    const out = { title: b.title, pdfUrl: val(b.pdfLink, b.pdfUrl, b.link), announcedOn };
    if (isPrivate !== undefined) out.isPrivate = isPrivate;
    Object.keys(out).forEach((k) => (out[k] === undefined || out[k] === null) && delete out[k]);
    return out;
}

function postOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id, photo: p.photoUrl, title: p.title, description: p.description,
        pdfLink: p.pdfUrl, date: p.publishedOn,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
    };
}
function postIn(b, category) {
    const out = {
        category,
        photoUrl: val(b.photo, b.photoUrl),
        title: b.title,
        description: b.description,
        pdfUrl: val(b.pdfLink, b.pdfUrl, b.link),
        publishedOn: parseFlexibleDate(val(b.date, b.publishedOn)),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* -------------------------------------------------------------- CV tables */
function qualificationOut(row) {
    const q = plain(row);
    if (!q) return q;
    return { id: q.id, nameOfDegree: q.degreeName, passingYear: q.passingYear, universityName: q.universityName, facultyId: q.facultyId, createdAt: q.createdAt, updatedAt: q.updatedAt };
}
function qualificationIn(b) {
    const out = { degreeName: val(b.nameOfDegree, b.degreeName), passingYear: parseYear(b.passingYear), universityName: b.universityName };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function teachingExpOut(row) {
    const t = plain(row);
    if (!t) return t;
    return { id: t.id, position: t.position, department: t.department, from: t.startDate, to: t.endDate || "Present", facultyId: t.facultyId, createdAt: t.createdAt, updatedAt: t.updatedAt };
}
function teachingExpIn(b) {
    const to = val(b.to, b.endDate);
    const out = {
        position: b.position, department: b.department,
        startDate: parseFlexibleDate(val(b.from, b.startDate)),
        endDate: to && String(to).trim().toLowerCase() === "present" ? null : parseFlexibleDate(to),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function adminExpOut(row) {
    const a = plain(row);
    if (!a) return a;
    return { id: a.id, position: a.position, organisation: a.organisation, startDate: a.startDate, endDate: a.endDate, facultyId: a.facultyId, faculty: a.faculty ? facultyOut(a.faculty) : undefined, createdAt: a.createdAt, updatedAt: a.updatedAt };
}
function adminExpIn(b) {
    const out = { position: b.position, organisation: b.organisation, startDate: parseFlexibleDate(b.startDate), endDate: parseFlexibleDate(b.endDate) };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function honorOut(row) {
    const h = plain(row);
    if (!h) return h;
    return { id: h.id, title: h.title, givenBy: h.givenBy, year: h.year, facultyId: h.facultyId, createdAt: h.createdAt, updatedAt: h.updatedAt };
}
function honorIn(b) {
    const out = { title: b.title, givenBy: b.givenBy, year: parseYear(b.year) };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function exposureOut(row) {
    const e = plain(row);
    if (!e) return e;
    return { id: e.id, title: e.title, description: e.description, facultyId: e.facultyId, createdAt: e.createdAt, updatedAt: e.updatedAt };
}
function exposureIn(b) {
    const out = { title: b.title, description: b.description };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function expertTalkOut(row) {
    const e = plain(row);
    if (!e) return e;
    return {
        id: e.id, title: e.title, venue: e.venue, startDate: e.startDate, endDate: e.endDate,
        academicSession: e.academicSession, description: e.description, facultyId: e.facultyId,
        faculty: e.faculty ? facultyOut(e.faculty) : undefined, createdAt: e.createdAt, updatedAt: e.updatedAt,
    };
}
function expertTalkIn(b) {
    const out = {
        title: b.title, venue: b.venue,
        startDate: parseFlexibleDate(b.startDate), endDate: parseFlexibleDate(b.endDate),
        academicSession: b.academicSession, description: b.description,
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

// DB stores the bare ORCID iD; the legacy API (and shipped <Link href>) wants the full URL
const ORCID_ID_RE = /\d{4}-\d{4}-\d{4}-[\dXx]{4}/;
const orcidToUrl = (v) => (typeof v === "string" && /^\d{4}-\d{4}-\d{4}-[\dXx]{4}$/.test(v.trim()) ? `https://orcid.org/${v.trim()}` : v);
const orcidToId = (v) => {
    if (typeof v !== "string") return v;
    const m = v.match(ORCID_ID_RE);
    return m ? m[0] : v;
};

function facultyInfoOut(profileRow, facultyRow) {
    const p = plain(profileRow) || {};
    return {
        id: p.id, facultyId: p.facultyId,
        dateOfBirth: p.dateOfBirth, dateOfJoining: p.dateOfJoining,
        googleScholar: p.googleScholarUrl, scopus: p.scopusUrl, publons: p.publonsUrl,
        orcid: orcidToUrl(p.orcid), researchGate: p.researchGateUrl, rgLink: p.researchGateUrl,
        vidwan: p.vidwanUrl, linkedIn: p.linkedinUrl,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
        faculty: facultyRow ? facultyOut(facultyRow) : (p.faculty ? facultyOut(p.faculty) : undefined),
    };
}
function facultyInfoIn(b) {
    const out = {
        dateOfBirth: parseFlexibleDate(b.dateOfBirth),
        dateOfJoining: parseFlexibleDate(b.dateOfJoining),
        googleScholarUrl: val(b.googleScholar, b.googleScholarUrl),
        scopusUrl: val(b.scopus, b.scopusUrl),
        publonsUrl: val(b.publons, b.publonsUrl),
        orcid: orcidToId(b.orcid),
        researchGateUrl: val(b.researchGate, b.rgLink, b.researchGateUrl),
        vidwanUrl: val(b.vidwan, b.vidwanUrl),
        linkedinUrl: val(b.linkedIn, b.linkedinUrl),
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ----------------------------------------------------------- other people */
function staffOut(row) {
    const s = plain(row);
    if (!s) return s;
    return { id: s.id, name: s.name, phoneNo: s.phone, email: s.email, designation: s.designation, photo: s.photoUrl, time: s.time, createdAt: s.createdAt, updatedAt: s.updatedAt };
}
function staffIn(b) {
    const out = { name: b.name, phone: val(b.phoneNo, b.phone), email: b.email, designation: b.designation, photoUrl: val(b.photo, b.photoUrl), time: b.time };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function studentOut(row) {
    const s = plain(row);
    if (!s) return s;
    return {
        id: s.id, name: s.name, rollNo: s.rollNo, email: s.email, photo: s.photoUrl,
        programmEnroled: s.programId, currentSemester: s.currentSemester, year: s.admissionYear,
        program: s.program ? { id: s.program.id, name: s.program.name } : undefined,
        createdAt: s.createdAt, updatedAt: s.updatedAt,
    };
}
function studentIn(b) {
    const out = {
        name: b.name, rollNo: b.rollNo, email: b.email,
        photoUrl: val(b.picture, b.photo, b.photoUrl),
        programId: lookup(PROGRAM_TYPES, val(b.programmEnroled, b.programId)),
        currentSemester: val(b.Sem, b.currentSemester, b.newSemester) !== undefined ? parseInt(val(b.Sem, b.currentSemester, b.newSemester), 10) : undefined,
        admissionYear: parseYear(val(b.year, b.admissionYear)),
    };
    Object.keys(out).forEach((k) => (out[k] === undefined || out[k] === null) && delete out[k]);
    return out;
}

function phdScholarOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id, name: p.name, email: p.email, guide: p.supervisor, time: p.time, status: p.status,
        registrationYear: p.registrationYear, dissertation: p.dissertationTitle,
        lastQualification: p.lastQualification, portfolio: p.portfolioUrl, title: p.dissertationTitle,
        CoSupervisor: p.coSupervisor, Supervisor: p.supervisor, LinkedIn: p.linkedinUrl,
        endDate: p.endDate, GoogleScholar: p.googleScholarUrl, Scopus: p.scopusUrl,
        researchArea: p.researchArea, photo: p.photoUrl, rollNo: p.rollNo,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
    };
}
function phdScholarIn(b) {
    const out = {
        name: b.name, email: b.email,
        supervisor: val(b.Supervisor, b.guide, b.supervisor),
        coSupervisor: val(b.CoSupervisor, b.coSupervisor),
        status: b.status, registrationYear: parseYear(b.registrationYear),
        dissertationTitle: val(b.title, b.dissertation, b.dissertationTitle),
        lastQualification: b.lastQualification, researchArea: b.researchArea,
        endDate: parseFlexibleDate(b.endDate), time: b.time,
        photoUrl: emptyToNull(val(b.photo, b.photoUrl)), portfolioUrl: emptyToNull(val(b.portfolio, b.portfolioUrl)),
        linkedinUrl: val(b.LinkedIn, b.linkedinUrl),
        googleScholarUrl: val(b.GoogleScholar, b.googleScholarUrl),
        scopusUrl: val(b.Scopus, b.scopusUrl),
        rollNo: b.rollNo,
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

/* ---------------------------------------------------------------- content */
function labOut(row) {
    const l = plain(row);
    if (!l) return l;
    return { id: l.id, title: l.title, description: l.description, photo: l.photoUrl, OIC: l.officerInCharge, technician: l.technician, createdAt: l.createdAt, updatedAt: l.updatedAt };
}
function labIn(b) {
    const out = { title: b.title, description: b.description, photoUrl: emptyToNull(val(b.photo, b.photoUrl)), officerInCharge: val(b.OIC, b.officerInCharge), technician: b.technician };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function equipmentOut(row) {
    const e = plain(row);
    if (!e) return e;
    return {
        id: e.id, name: e.name, quantity: e.quantity, date: e.purchaseDate, stock: e.stock,
        invoice: e.invoiceNo, indenter: e.indenter, vender: e.vendor, addressAndCon: e.addressContact,
        amount: e.amount, academicSession: e.academicSession, createdAt: e.createdAt, updatedAt: e.updatedAt,
    };
}
function equipmentIn(b) {
    const out = {
        name: b.name,
        quantity: b.quantity !== undefined ? parseInt(b.quantity, 10) : undefined,
        purchaseDate: parseFlexibleDate(val(b.date, b.purchaseDate)),
        stock: b.stock !== undefined ? parseInt(b.stock, 10) : undefined,
        invoiceNo: val(b.invoice, b.invoiceNo), indenter: b.indenter,
        vendor: val(b.vender, b.vendor), addressContact: val(b.addressAndCon, b.addressContact),
        amount: b.amount === "" ? null : b.amount, academicSession: b.academicSession,
    };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function placementOut(row) {
    const p = plain(row);
    if (!p) return p;
    return {
        id: p.id, branch: p.branch, candidates: p.candidates, placed: p.placed,
        percent: p.placedPercent, jobsOffered: p.jobsOffered, percentJobOffered: p.offersPercent,
        maxCtc: p.maxCtc, year: p.year, createdAt: p.createdAt, updatedAt: p.updatedAt,
    };
}
function placementIn(b) {
    const out = {
        branch: b.branch,
        candidates: b.candidates !== undefined ? parseInt(b.candidates, 10) : undefined,
        placed: b.placed !== undefined ? parseInt(b.placed, 10) : undefined,
        jobsOffered: b.jobsOffered !== undefined ? parseInt(b.jobsOffered, 10) : undefined,
        maxCtc: b.maxCtc === "" ? null : b.maxCtc,
        year: parseYear(b.year),
    };
    // legacy percent / percentJobOffered are DB-generated now — ignored on input
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function hodOut(row) {
    const h = plain(row);
    if (!h) return h;
    return { id: h.id, name: h.name, message: h.message, image: h.imageUrl, facultyId: h.facultyId, createdAt: h.createdAt, updatedAt: h.updatedAt };
}
function hodIn(b) {
    const out = { name: b.name, message: b.message, imageUrl: val(b.image, b.imageUrl), facultyId: b.facultyId };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function homeOut(row) {
    const h = plain(row);
    if (!h) return h;
    return { id: h.id, photo: h.imageUrl, createdAt: h.createdAt, updatedAt: h.updatedAt };
}
function homeIn(b) {
    return { imageUrl: val(b.photo, b.imageUrl) };
}

function docOut(row) {
    const d = plain(row);
    if (!d) return d;
    return { id: d.id, title: d.title, pdfLink: d.pdfUrl, createdAt: d.createdAt, updatedAt: d.updatedAt };
}
function docIn(b) {
    const out = { title: b.title, pdfUrl: val(b.pdfLink, b.pdfUrl) };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

function simpleOut(row) {
    return plain(row);
}
function aboutIn(b) {
    const out = { title: b.title, description: b.description };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}
function qnaIn(b) {
    const out = { question: b.question, answer: b.answer };
    Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
}

module.exports = {
    facultyOut, facultyIn,
    publicationOut, publicationIn,
    patentOut, patentIn,
    projectOut, projectIn,
    consultancyOut, consultancyIn,
    supervisionOut, supervisionIn,
    courseOut, courseIn,
    eventOut, eventIn,
    announcementOut, announcementIn,
    postOut, postIn,
    qualificationOut, qualificationIn,
    teachingExpOut, teachingExpIn,
    adminExpOut, adminExpIn,
    honorOut, honorIn,
    exposureOut, exposureIn,
    expertTalkOut, expertTalkIn,
    facultyInfoOut, facultyInfoIn,
    staffOut, staffIn,
    studentOut, studentIn,
    phdScholarOut, phdScholarIn,
    labOut, labIn,
    equipmentOut, equipmentIn,
    placementOut, placementIn,
    hodOut, hodIn,
    homeOut, homeIn,
    docOut, docIn,
    simpleOut, aboutIn, qnaIn,
};
