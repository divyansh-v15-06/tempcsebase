#!/usr/bin/env node
"use strict";
/**
 * Schema/model validation for the clean CSE schema.
 *
 *   node validate.js            -> Part 1 only: read-only column-mapping audit
 *   node validate.js --crud     -> + Part 2: full ORM round-trip, executed inside a
 *                                  transaction that is ALWAYS rolled back, using
 *                                  ZZTEST-prefixed synthetic values — safe to run
 *                                  against a database that already holds real data.
 *
 * Connection via env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 * (defaults match staging-db.sh: 127.0.0.1:3307, cse_department, root, empty).
 */
process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_PORT = process.env.DB_PORT || "3307";
process.env.DB_NAME = process.env.DB_NAME || "cse_department";
process.env.DB_USER = process.env.DB_USER || "root";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "";

const bcrypt = require("bcrypt");
const db = require("./models");
const { sequelize } = db;
sequelize.options.logging = false;

const RUN_CRUD = process.argv.includes("--crud");
let pass = 0, fail = 0;
const bad = [];
function ok(name, cond, detail) {
    if (cond) { pass++; console.log("  PASS  " + name); }
    else { fail++; bad.push(name + (detail ? " — " + detail : "")); console.log("  FAIL  " + name + (detail ? " — " + detail : "")); }
}
async function expectError(name, fn, msgPart) {
    try { await fn(); ok(name, false, "no error thrown"); }
    catch (e) { ok(name, !msgPart || String(e.message + e.name).includes(msgPart), e.message.slice(0, 120)); }
}

async function partOneMappingAudit() {
    console.log("== PART 1: column-mapping audit (models vs information_schema, read-only) ==");
    const [cols] = await sequelize.query(
        "SELECT TABLE_NAME t, COLUMN_NAME c, COLUMN_TYPE ct, IS_NULLABLE nl, EXTRA ex " +
        "FROM information_schema.columns WHERE table_schema = :s",
        { replacements: { s: process.env.DB_NAME } }
    );
    const dbTables = {};
    for (const r of cols) (dbTables[r.t] = dbTables[r.t] || {})[r.c] = r;

    const models = Object.keys(db).filter(k => !["sequelize", "Sequelize"].includes(k));
    let problems = 0;
    for (const name of models) {
        const m = db[name];
        const table = typeof m.getTableName() === "string" ? m.getTableName() : m.getTableName().tableName;
        if (!dbTables[table]) { problems++; console.log("  MISSING TABLE: model " + name + " -> " + table); continue; }
        const attrs = m.getAttributes();
        const claimed = new Set();
        for (const a of Object.keys(attrs)) {
            const field = attrs[a].field || a;
            claimed.add(field);
            const dbcol = dbTables[table][field];
            if (!dbcol) { problems++; console.log("  MISSING COLUMN: " + name + "." + a + " -> " + table + "." + field); continue; }
            const generated = /GENERATED/i.test(dbcol.ex);
            if (!attrs[a].primaryKey && !generated) {
                const modelNullable = attrs[a].allowNull !== false;
                const dbNullable = dbcol.nl === "YES";
                if (modelNullable !== dbNullable) {
                    problems++;
                    console.log("  NULLABILITY DRIFT: " + table + "." + field +
                        " model=" + (modelNullable ? "NULL" : "NOT NULL") + " db=" + (dbNullable ? "NULL" : "NOT NULL"));
                }
            }
            if (dbcol.ct.startsWith("enum(") && attrs[a].type && attrs[a].type.values) {
                const dbVals = dbcol.ct.slice(5, -1).split(",").map(s => s.replace(/^'|'$/g, ""));
                if (JSON.stringify(dbVals) !== JSON.stringify(attrs[a].type.values)) {
                    problems++;
                    console.log("  ENUM DRIFT: " + table + "." + field + " db=[" + dbVals + "] model=[" + attrs[a].type.values + "]");
                }
            }
        }
        for (const c of Object.keys(dbTables[table]))
            if (!claimed.has(c)) { problems++; console.log("  UNCLAIMED DB COLUMN: " + table + "." + c); }
    }
    ok("all " + models.length + " models map cleanly onto DB columns", problems === 0, problems + " problems");
}

async function partTwoCrudRoundTrip() {
    console.log("\n== PART 2: CRUD round-trip (inside a transaction, rolled back at the end) ==");
    const F = db.Faculty, P = db.Publication;
    const T = await sequelize.transaction();
    const t = { transaction: T };
    try {
        const fac = await F.create({
            facultyCode: "ZZTEST01", name: "ZZ Test Prof", position: "Professor", phone: "0000000000",
            email: "zz.test.prof@example.invalid", portfolioUrl: "https://example.invalid/zztest",
            photoUrl: "https://example.invalid/p.jpg", sortOrder: 9999, researchInterests: "ZZ testing",
        }, t);
        ok("faculty insert", fac.id > 0);

        const [[rawFac]] = await sequelize.query(
            "SELECT faculty_code, is_permanent, sort_order, research_interests FROM faculty WHERE id = :id",
            { replacements: { id: fac.id }, transaction: T });
        ok("camelCase attrs land in snake_case columns", rawFac.faculty_code === "ZZTEST01" && rawFac.sort_order === 9999);
        ok("is_permanent default applied", rawFac.is_permanent === 1);

        await db.FacultyProfile.create({ facultyId: fac.id, dateOfBirth: "1980-05-15", orcid: "0000-0000-0000-000X" }, t);
        const acct = await db.UserAccount.create({ facultyId: fac.id, passwordHash: "zz-secret" }, t);
        ok("account hook bcrypt-hashes password", acct.passwordHash.startsWith("$2") && bcrypt.compareSync("zz-secret", acct.passwordHash));
        ok("first_login defaults true", acct.firstLogin === true);
        const admin = await db.UserAccount.create({ username: "zz_test_admin", role: "admin", email: "zz.admin@example.invalid", passwordHash: "pw" }, t);
        ok("non-faculty (admin-style) account accepted", admin.role === "admin" && admin.facultyId == null);
        await expectError("account with neither faculty nor username rejected",
            () => db.UserAccount.create({ passwordHash: "x" }, t), "faculty link or a username");

        await db.Staff.create({ name: "ZZ Staff", email: "zz.staff@example.invalid", designation: "Technician" }, t);
        const stu = await db.Student.create({ name: "ZZ Stu", rollNo: "ZZTEST001", email: "zz.stu@example.invalid", programId: 1, currentSemester: 5, admissionYear: 2098 }, t);
        const stuJoin = await db.Student.findByPk(stu.id, { include: [{ model: db.Program, as: "program" }], transaction: T });
        ok("student -> program FK + belongsTo join", stuJoin.program && stuJoin.program.id === 1);

        await db.PhdScholar.create({ name: "ZZ Scholar", status: "pursuing", supervisor: "ZZ Test Prof" }, t);
        await db.FacultyQualification.create({ facultyId: fac.id, degreeName: "PhD", universityName: "ZZ Univ", passingYear: 2010 }, t);
        await db.FacultyTeachingExperience.create({ facultyId: fac.id, position: "Asst Prof", department: "CSE", startDate: "2012-07-01", endDate: null }, t);
        await db.FacultyAdministrativeExperience.create({ facultyId: fac.id, position: "Warden", startDate: "2015-01-01" }, t);
        await db.FacultyHonor.create({ facultyId: fac.id, title: "ZZ Award", givenBy: "ZZ Body", year: 2020 }, t);
        await db.FacultyExposure.create({ facultyId: fac.id, title: "ZZ Visit" }, t);
        await db.ExpertTalk.create({ facultyId: fac.id, title: "ZZ Talk", academicSession: "2098-2099" }, t);
        ok("all six CV satellites insert with FK", true);

        const pub = await P.create({
            title: "ZZ Study", venueName: "ZZ Journal", year: 2098, month: 7, academicSession: "2098-2099",
            doi: "10.0000/ZZTEST.1", researchTypeId: 1, indexing: "SCI(E)", authorText: "Z. Prof",
        }, t);
        ok("publication insert (enum, year, month, quartile default)", pub.id > 0 && pub.journalQuartile === "T");
        await fac.addPublication(pub, t);
        const [[jrow]] = await sequelize.query(
            "SELECT COUNT(*) c FROM faculty_publications WHERE publication_id = :p AND faculty_id = :f",
            { replacements: { p: pub.id, f: fac.id }, transaction: T });
        ok("belongsToMany add writes composite-PK join row", jrow.c === 1);
        await expectError("duplicate link rejected by composite PK",
            () => db.FacultyPublication.create({ publicationId: pub.id, facultyId: fac.id }, t));
        await expectError("duplicate DOI rejected",
            () => P.create({ title: "ZZ Other", doi: "10.0000/ZZTEST.1", indexing: "Scopus" }, t));

        const pat = await db.Patent.create({ title: "ZZ Patent", status: "Granted", referenceNo: "ZZTEST-PAT-1", year: 2098, filedDate: "2097-01-15" }, t);
        await fac.addPatent(pat, t);
        const prj = await db.Project.create({ title: "ZZ Project", status: "Ongoing", referenceNo: "ZZTEST-PRJ-1", fundingAmount: "2500000.50", duration: "3 years", year: 2098 }, t);
        await fac.addProject(prj, t);
        const con = await db.Consultancy.create({ referenceNo: "ZZTEST-CON-1", title: "ZZ Consult", amount: "150000.00", startYear: 2098 }, t);
        await fac.addConsultancy(con, t);
        const rs = await db.ResearchSupervision.create({ supervisionTypeId: 2, scholarName: "ZZ Scholar", rollNo: "ZZTESTPHD1", researchTopic: "ZZ Topic" }, t);
        await fac.addResearchSupervision(rs, t);
        const crs = await db.Course.create({ courseCode: "ZZT-999", courseName: "ZZ Course", semester: 3, courseLevel: "UG", lectureHours: 3, tutorialHours: 1, practicalHours: 2, academicYear: "2098-2099" }, t);
        await fac.addCourse(crs, t);
        const evt = await db.Event.create({ title: "ZZ STC", eventType: "STC", venue: "ZZ Hall", sponsoringAgency: "ZZ Agency", startDate: "2098-06-01" }, t);
        await fac.addEvent(evt, t);
        ok("all seven M:N entities insert + link", true);

        const facFull = await F.findByPk(fac.id, {
            include: [
                { model: db.FacultyProfile, as: "profile" },
                { model: db.FacultyQualification, as: "qualifications" },
                { model: P, as: "publications" },
                { model: db.Patent, as: "patents" },
                { model: db.Project, as: "projects" },
                { model: db.Consultancy, as: "consultancies" },
                { model: db.ResearchSupervision, as: "researchSupervisions" },
                { model: db.Course, as: "courses" },
                { model: db.Event, as: "events" },
            ],
            transaction: T,
        });
        ok("faculty eager-load across all 9 associations",
            facFull.profile && facFull.qualifications.length === 1 && facFull.publications.length === 1 &&
            facFull.patents.length === 1 && facFull.projects.length === 1 && facFull.consultancies.length === 1 &&
            facFull.researchSupervisions.length === 1 && facFull.courses.length === 1 && facFull.events.length === 1);
        const pubBack = await P.findByPk(pub.id, { include: [{ model: db.ResearchType, as: "researchType" }, { model: F, as: "faculty" }], transaction: T });
        ok("publication -> researchType + faculty reverse join", pubBack.researchType.name === "Journal" && pubBack.faculty.length === 1);

        const hodMsg = await db.HodMessage.create({ facultyId: fac.id, name: "ZZ Test Prof", message: "ZZ welcome" }, t);
        await db.Announcement.create({ title: "ZZ Notice", pdfUrl: "https://example.invalid/a.pdf", announcedOn: "2098-07-15", isPrivate: true }, t);
        await db.Post.create({ category: "achievement", title: "ZZ Won", description: "d ".repeat(400), publishedOn: "2098-05-01" }, t);
        await db.Post.create({ category: "academic_news", title: "ZZ News", description: "d" }, t);
        await db.AboutSection.create({ description: "ZZ about" }, t);
        await db.ProgramOffered.create({ title: "ZZ Prog", description: "d" }, t);
        await db.HomeSlide.create({ imageUrl: "https://example.invalid/s.jpg" }, t);
        await db.Qna.create({ question: "ZZ how?", answer: "ZZ thus." }, t);
        await db.SyllabusDocument.create({ title: "ZZ Syl", pdfUrl: "https://example.invalid/x.pdf" }, t);
        await db.CalendarDocument.create({ title: "ZZ Cal", pdfUrl: "https://example.invalid/c.pdf" }, t);
        await db.Lab.create({ title: "ZZ Lab", description: "d", photoUrl: "https://example.invalid/l.jpg", officerInCharge: "ZZ Test Prof", technician: "ZZ Staff" }, t);
        const eq = await db.Equipment.create({ name: "ZZ Server", quantity: 2, stock: 2, amount: "1234567.89" }, t);
        ok("all content tables insert", true);
        ok("DECIMAL money round-trips", String(eq.amount) === "1234567.89");

        const ps = await db.PlacementStat.create({ branch: "ZZTEST", year: 2098, candidates: 100, placed: 80, jobsOffered: 90 }, t);
        await ps.reload(t);
        ok("generated percentage columns compute", String(ps.placedPercent) === "80.00" && String(ps.offersPercent) === "90.00");
        await expectError("duplicate (branch, year) rejected",
            () => db.PlacementStat.create({ branch: "ZZTEST", year: 2098, candidates: 1, placed: 1, jobsOffered: 1 }, t));

        await expectError("DB CHECK rejects month=13 (raw insert)",
            () => sequelize.query("INSERT INTO publications (title, doi, indexing, month, created_at, updated_at) VALUES ('zz','10.0000/ZZTEST.chk1','Other',13,NOW(),NOW())", { transaction: T }));
        await expectError("DB rejects unknown enum value (raw insert)",
            () => sequelize.query("INSERT INTO publications (title, doi, indexing, created_at, updated_at) VALUES ('zz','10.0000/ZZTEST.chk2','Bogus',NOW(),NOW())", { transaction: T }));
        await expectError("RESTRICT: cannot delete a program referenced by students",
            () => db.Program.destroy({ where: { id: 1 }, transaction: T }));

        await fac.destroy(t);
        const scoped = async (sql) => (await sequelize.query(sql, { replacements: { f: fac.id }, transaction: T }))[0][0].c;
        ok("faculty delete cascades to profile/account/CV/join rows",
            (await scoped("SELECT COUNT(*) c FROM faculty_profiles WHERE faculty_id = :f")) === 0 &&
            (await scoped("SELECT COUNT(*) c FROM user_accounts WHERE faculty_id = :f")) === 0 &&
            (await scoped("SELECT COUNT(*) c FROM faculty_qualifications WHERE faculty_id = :f")) === 0 &&
            (await scoped("SELECT COUNT(*) c FROM faculty_publications WHERE faculty_id = :f")) === 0);
        ok("shared entities survive faculty delete",
            (await P.findByPk(pub.id, { transaction: T })) !== null && (await db.Patent.findByPk(pat.id, { transaction: T })) !== null);
        await hodMsg.reload(t);
        ok("hod_messages.faculty_id SET NULL on faculty delete", hodMsg.facultyId === null);
        ok("non-faculty account survives faculty delete", (await db.UserAccount.findByPk(admin.id, { transaction: T })) !== null);
    } finally {
        await T.rollback();
    }
    const [[residue]] = await sequelize.query(
        "SELECT COUNT(*) c FROM faculty WHERE faculty_code = 'ZZTEST01'");
    ok("rollback left no residue in the database", residue.c === 0);
}

(async () => {
    await sequelize.authenticate();
    console.log("Connected: " + process.env.DB_USER + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME + "\n");
    await partOneMappingAudit();
    if (RUN_CRUD) await partTwoCrudRoundTrip();
    else console.log("\n(read-only run — add --crud for the transactional round-trip)");
    console.log("\n==================== RESULT ====================");
    console.log("PASS: " + pass + "   FAIL: " + fail);
    if (bad.length) { console.log("Failures:"); bad.forEach(b => console.log("  - " + b)); }
    await sequelize.close();
    process.exit(fail ? 1 : 0);
})().catch((e) => {
    console.error("\nFATAL:", e.message);
    process.exit(2);
});
