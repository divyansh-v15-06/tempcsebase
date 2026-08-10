"use strict";
/** GET /report/download-report?startYear=&endYear=&format=docx|pdf
 *  Department annual report from src/template/Report-Format.docx.
 *  Ported to the clean schema: session bucketing now happens in SQL-backed maps
 *  instead of eight full-table JS scans; template tags unchanged. */
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const { StatusCodes } = require("http-status-codes");
const models = require("../../models");
const services = require("../../services/research-configs");
const { failure } = require("../../utils/responses");
const ServerConfig = require("../../config/server-config");

const router = express.Router();
const TEMPLATE = path.resolve(__dirname, "../../template/Report-Format.docx");

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
const sessionsBetween = (startYear, endYear) => {
    const out = [];
    for (let y = startYear; y < endYear; y += 1) out.push(`${y}-${y + 1}`);
    return out;
};
const citation = (p) => [
    p.authorText, p.title, p.venueName,
    p.volume ? `Vol: ${p.volume}` : null,
    p.issue ? `Issue: ${p.issue}` : null,
    p.pageRange ? `Pages: ${p.pageRange}` : null,
].filter(Boolean).join(", ");
const bySession = (rows, key = "academicSession") => {
    const m = new Map();
    for (const r of rows) {
        const s = r[key];
        if (!s) continue;
        if (!m.has(s)) m.set(s, []);
        m.get(s).push(r);
    }
    return m;
};
const idx = (rows, build) => rows.map((r, i) => ({ index: i + 1, ...build(r) }));

async function fetchReportData(startYear, endYear) {
    const sessions = sessionsBetween(startYear, endYear);
    const [faculty, staff, publications, events, projects, supervisions, consultancies, equipment] = await Promise.all([
        models.Faculty.findAll({ order: [["sortOrder", "ASC"], ["id", "ASC"]] }),
        models.Staff.findAll({ order: [["id", "ASC"]] }),
        services.publication.repo.getAllLinked({}, null, [["year", "DESC"]]),
        services.event.repo.getAllLinked({}, null, [["startDate", "DESC"]]),
        services.project.repo.getAllLinked({}, null, [["year", "DESC"]]),
        services.researchSupervision.repo.getAllLinked({}, null, [["year", "DESC"]]),
        services.consultancy.repo.getAllLinked({}, null, [["startYear", "DESC"]]),
        models.Equipment.findAll({ order: [["id", "ASC"]] }),
    ]);

    const position = (p) => (p || "").trim();
    const professors = faculty.filter((f) => position(f.position) === "Professor").map((f) => f.name);
    const assoprofessors = faculty.filter((f) => position(f.position) === "Associate Professor").map((f) => f.name);
    const assiprofessors = faculty.filter((f) => position(f.position).includes("Assistant Professor")).map((f) => f.name);

    const pubsBySession = bySession(publications);
    const publicationcounts = sessions.map((s) => {
        const rows = pubsBySession.get(s) || [];
        const journal = rows.filter((p) => p.researchTypeId === 1);
        return {
            AcademicYear: s,
            JournalSCIE: journal.filter((p) => p.indexing === "SCI(E)").length,
            JournalScopus: journal.filter((p) => p.indexing === "Scopus").length,
            JournalOthers: journal.filter((p) => !["SCI(E)", "Scopus"].includes(p.indexing)).length,
            Conference: rows.filter((p) => p.researchTypeId === 2).length,
            Book: rows.filter((p) => p.researchTypeId === 3).length,
            BookChapter: rows.filter((p) => p.researchTypeId === 4).length,
            TotalPublication: rows.length,
        };
    });
    const publicationsBlock = sessions.map((s) => {
        const rows = pubsBySession.get(s) || [];
        return {
            year: s,
            journal: idx(rows.filter((p) => p.researchTypeId === 1), (p) => ({ name: citation(p) })),
            conference: idx(rows.filter((p) => p.researchTypeId === 2), (p) => ({ name: citation(p) })),
            BookChapter: idx(rows.filter((p) => [3, 4].includes(p.researchTypeId)), (p) => ({ name: citation(p) })),
        };
    });

    const eventsBySession = bySession(events);
    const eventsDetails = sessions.map((s) => ({
        year: s,
        events: idx(eventsBySession.get(s) || [], (e) => ({
            name: e.title,
            coordinator: e.coordinator || "",
            sponsor: e.sponsoringAgency || "",
            duration: [e.startDate, e.endDate].filter(Boolean).map((d) => String(d).slice(0, 10)).join(" to "),
            type: e.eventType || "",
        })),
    }));

    const projectsBySession = bySession(projects);
    const researchProjects = sessions.map((s) => ({
        year: s,
        projects: idx(projectsBySession.get(s) || [], (p) => ({
            name: p.title, sponsor: p.fundingAgency || "", amount: p.fundingAmount || "",
            Investigator: p.principalInvestigator || (p.faculty && p.faculty[0] ? p.faculty[0].name : ""),
        })),
    }));

    const supBySession = bySession(supervisions);
    const supRow = (s) => ({
        title: s.researchTopic || "", guide: s.faculty && s.faculty[0] ? s.faculty[0].name : "",
        name: s.scholarName, status: s.status || "",
    });
    const ResearchSupervision = sessions.map((s) => ({
        year: s,
        mtech: idx((supBySession.get(s) || []).filter((r) => r.supervisionTypeId === 1), supRow),
    }));
    const ResearchSupervisionPhd = sessions.map((s) => ({
        year: s,
        phd: idx((supBySession.get(s) || []).filter((r) => r.supervisionTypeId === 2), supRow),
    }));

    const consBySession = bySession(consultancies);
    const consultancy = sessions.map((s) => ({
        year: s,
        consultancys: idx(consBySession.get(s) || [], (c) => ({
            name: c.title, sponsor: c.clientOrganisation || "", amount: c.amount || "",
        })),
    }));

    const equipBySession = bySession(equipment);
    const equipmentBlock = sessions.map((s) => {
        const rows = equipBySession.get(s) || [];
        return {
            year: s,
            equipments: idx(rows, (e) => ({ name: e.name, manufacturer: e.vendor || "", cost: e.amount || "" })),
            total: rows.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        };
    });

    return {
        year: `${startYear}-${endYear}`,
        professors, assoprofessors, assiprofessors,
        staff: idx(staff, (s) => ({ name: s.name, designation: s.designation })),
        publicationcounts,
        publications: publicationsBlock,
        eventsDetails,
        researchProjects,
        ResearchSupervision,
        ResearchSupervisionPhd,
        consultancy,
        equipment: equipmentBlock,
    };
}

function renderDocx(data) {
    const zip = new PizZip(fs.readFileSync(TEMPLATE, "binary"));
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(sanitize(data));
    return doc.getZip().generate({ type: "nodebuffer" });
}

function convertToPdf(docxBuffer) {
    return new Promise((resolve, reject) => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "report-"));
        const docxPath = path.join(dir, "report.docx");
        fs.writeFileSync(docxPath, docxBuffer);
        execFile(ServerConfig.LIBREOFFICE_PATH, ["--headless", "--convert-to", "pdf", "--outdir", dir, docxPath], { timeout: 120000 }, (err) => {
            if (err) return reject(new Error(`PDF conversion failed: ${err.message}`));
            resolve(fs.readFileSync(path.join(dir, "report.pdf")));
        });
    });
}

router.get("/download-report", async (req, res) => {
    try {
        const startYear = parseInt(req.query.startYear, 10);
        const endYear = parseInt(req.query.endYear, 10);
        if (!startYear || !endYear || endYear < startYear) {
            return res.status(StatusCodes.BAD_REQUEST).json(failure({}, "Valid startYear and endYear query params are required"));
        }
        const data = await fetchReportData(startYear, endYear);
        const docx = renderDocx(data);
        if (req.query.format === "pdf") {
            const pdf = await convertToPdf(docx);
            res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=report-${startYear}-${endYear}.pdf` });
            return res.send(pdf);
        }
        res.set({
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename=report-${startYear}-${endYear}.docx`,
        });
        return res.send(docx);
    } catch (err) {
        return res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(failure(err, err.message));
    }
});

module.exports = router;
