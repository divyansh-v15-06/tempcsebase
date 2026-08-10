"use strict";
/** GET /resume/download-resume?uniqueId=CS07&format=docx|pdf
 *  Renders src/template/Resume-Format.docx for one faculty member.
 *  Ported to the clean schema; template tags unchanged. */
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const axios = require("axios");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const { StatusCodes } = require("http-status-codes");
const models = require("../../models");
const services = require("../../services/research-configs");
const FacultyService = require("../../services/faculty-service");
const { failure } = require("../../utils/responses");
const ServerConfig = require("../../config/server-config");

const router = express.Router();
const TEMPLATE = path.resolve(__dirname, "../../template/Resume-Format.docx");

const fmt = (d) => (d ? String(d).slice(0, 10) : "");
/** Strip control chars that are invalid in XML (keep \t \n \r) — dirty DB values
 *  (e.g. a 0x02 byte in a venue name) must never make docxtemplater throw. */
const XML_INVALID = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const sanitize = (v) => {
    if (typeof v === "string") return v.replace(XML_INVALID, "");
    if (Array.isArray(v)) return v.map(sanitize);
    if (v && typeof v === "object") {
        const out = {};
        for (const k of Object.keys(v)) out[k] = sanitize(v[k]);
        return out;
    }
    return v;
};
const citation = (p) => [
    p.authorText, p.title, p.venueName,
    p.volume ? `Vol: ${p.volume}` : null,
    p.issue ? `Issue: ${p.issue}` : null,
    p.pageRange ? `Pages: ${p.pageRange}` : null,
    p.year,
].filter(Boolean).join(", ");

function groupBySession(rows, typeIds) {
    const bySession = new Map();
    for (const p of rows) {
        if (!typeIds.includes(p.researchTypeId)) continue;
        const key = p.academicSession || "Other";
        if (!bySession.has(key)) bySession.set(key, []);
        bySession.get(key).push({ data: citation(p), doi: p.doi });
    }
    return [...bySession.entries()]
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([academicSession, publications]) => ({ academicSession, publications }));
}

function totalExperienceYears(teachingRows) {
    let ms = 0;
    for (const t of teachingRows) {
        const start = t.startDate ? new Date(t.startDate) : null;
        if (!start) continue;
        const end = t.endDate ? new Date(t.endDate) : new Date();
        if (end > start) ms += end - start;
    }
    const years = ms / (365.25 * 24 * 3600 * 1000);
    return years ? `${Math.round(years)} years` : "";
}

async function fetchResumeData(uniqueId) {
    const faculty = await FacultyService.getByCode(uniqueId);
    const facultyWhere = { id: faculty.id };
    const [profile, qualifications, teaching, publications, projects, patents, supervisions, events, honors, consultancies] =
        await Promise.all([
            models.FacultyProfile.findOne({ where: { facultyId: faculty.id } }),
            models.FacultyQualification.findAll({ where: { facultyId: faculty.id }, order: [["passingYear", "DESC"]] }),
            models.FacultyTeachingExperience.findAll({ where: { facultyId: faculty.id }, order: [["startDate", "DESC"]] }),
            services.publication.repo.getAllLinked({}, facultyWhere, [["academicSession", "DESC"]], { include: services.publicationIncludes }),
            services.project.repo.getAllLinked({}, facultyWhere, [["year", "DESC"]]),
            services.patent.repo.getAllLinked({}, facultyWhere, [["year", "DESC"]]),
            services.researchSupervision.repo.getAllLinked({}, facultyWhere, [["year", "DESC"]]),
            services.event.repo.getAllLinked({}, facultyWhere, [["startDate", "DESC"]]),
            models.FacultyHonor.findAll({ where: { facultyId: faculty.id }, order: [["year", "DESC"]] }),
            services.consultancy.repo.getAllLinked({}, facultyWhere, [["startYear", "DESC"]]),
        ]);

    const idx = (rows, build) => rows.map((r, i) => ({ index: i + 1, ...build(r) }));
    return {
        facultyName: faculty.name,
        phoneNo: faculty.phone || "",
        emailId: faculty.email || "",
        image: faculty.photoUrl || "",
        googleScholar: (profile && profile.googleScholarUrl) || "",
        researchArea: faculty.researchInterests || "",
        qualifications: qualifications.map((q) => ({ nameOfDegree: q.degreeName, universityName: q.universityName, passingYear: q.passingYear })),
        totalExperience: totalExperienceYears(teaching),
        teachingExp: teaching.map((t) => ({ position: t.position, department: t.department, from: fmt(t.startDate), to: t.endDate ? fmt(t.endDate) : "Present" })),
        groupedByAcademicSessionpub: groupBySession(publications, [1]),
        groupedByAcademicSessioncon: groupBySession(publications, [2]),
        groupedByAcademicSessionbook: groupBySession(publications, [3, 4]),
        projects: idx(projects, (p) => ({ name: p.title, sponsor: p.fundingAgency || "", amount: p.fundingAmount || "", year: p.year })),
        patents: idx(patents, (p) => ({ title: p.title, referenceNo: p.referenceNo, filledDate: fmt(p.filedDate), grantedDate: fmt(p.grantedDate), year: p.year })),
        mtech: idx(supervisions.filter((s) => s.supervisionTypeId === 1), (s) => ({ scholarName: s.scholarName, researchTopic: s.researchTopic || "", status: s.status || "", year: s.year, rollNo: s.rollNo })),
        phd: idx(supervisions.filter((s) => s.supervisionTypeId === 2), (s) => ({ scholarName: s.scholarName, researchTopic: s.researchTopic || "", status: s.status || "", year: s.year, rollNo: s.rollNo })),
        events: idx(events, (e) => ({ title: e.title, startDate: fmt(e.startDate), endDate: fmt(e.endDate), type: e.eventType || "", venue: e.venue })),
        honor: idx(honors, (h) => ({ title: h.title, givenBy: h.givenBy, year: h.year })),
        consultancy: idx(consultancies, (c) => ({ title: c.title, clientOrganisation: c.clientOrganisation || "", status: c.status || "", amount: c.amount || "" })),
    };
}

// 1x1 transparent PNG — placeholder when a faculty member has no (reachable) photo
const PLACEHOLDER_PX = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
);

/** The photo is fetched up-front so the image module can stay synchronous
 *  (its async path is unreliable); an unreachable photo must not kill the resume. */
async function fetchImageBuffer(url) {
    if (!url) return PLACEHOLDER_PX;
    try {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
        const buf = Buffer.from(res.data);
        return buf.length ? buf : PLACEHOLDER_PX;
    } catch (err) {
        return PLACEHOLDER_PX;
    }
}

function renderDocx(data, imageBuffer) {
    const zip = new PizZip(fs.readFileSync(TEMPLATE, "binary"));
    const imageModule = new ImageModule({
        getImage: () => imageBuffer,
        getSize: () => [75, 90],
    });
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, modules: [imageModule] });
    // A falsy image tag makes the module skip the tag entirely, so a faculty
    // member with no photo_url would get no image at all; force a truthy value
    // so getImage runs and PLACEHOLDER_PX renders, same as the fetch-failure path.
    doc.render(sanitize({ ...data, image: data.image || "placeholder" }));
    return doc.getZip().generate({ type: "nodebuffer" });
}

function convertToPdf(docxBuffer) {
    return new Promise((resolve, reject) => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-"));
        const docxPath = path.join(dir, "resume.docx");
        fs.writeFileSync(docxPath, docxBuffer);
        execFile(ServerConfig.LIBREOFFICE_PATH, ["--headless", "--convert-to", "pdf", "--outdir", dir, docxPath], { timeout: 60000 }, (err) => {
            if (err) return reject(new Error(`PDF conversion failed: ${err.message}`));
            resolve(fs.readFileSync(path.join(dir, "resume.pdf")));
        });
    });
}

router.get("/download-resume", async (req, res) => {
    try {
        const { uniqueId, format } = req.query;
        if (!uniqueId) {
            return res.status(StatusCodes.BAD_REQUEST).json(failure({}, "uniqueId query param is required"));
        }
        const data = await fetchResumeData(uniqueId);
        const imageBuffer = await fetchImageBuffer(data.image);
        const docx = renderDocx(data, imageBuffer);
        if (format === "pdf") {
            const pdf = await convertToPdf(docx);
            res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=resume-${uniqueId}.pdf` });
            return res.send(pdf);
        }
        res.set({
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename=resume-${uniqueId}.docx`,
        });
        return res.send(docx);
    } catch (err) {
        return res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(failure(err, err.message));
    }
});

module.exports = router;
