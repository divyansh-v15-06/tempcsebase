"use strict";
/**
 * /api/v1 route table — every legacy path preserved, including the quirky ones
 * (`/programOffered/post`, `/expertTalk/getTop`, `/qualification/highest/get`,
 * `/get/admin` twins, `DELETE /year/delete` with the id in the body → still
 * accepted, plus a sane `/:id` variant).
 *
 * Auth placement matches the legacy intent: JWT where it existed, real
 * admin-role checks where the stub "admin" middleware was wired
 * (/subjectTaught writes), and `writeGuard` on every other mutating route —
 * a no-op until REQUIRE_AUTH_WRITES=true, so the current token-less frontend
 * keeps working until it learns to send tokens.
 */
const express = require("express");
const { checkAuth, requireAdmin, writeGuard, csvUpload } = require("../../middlewares");

const auth = require("../../controllers/auth-controller");
const faculty = require("../../controllers/faculty-controller");
const student = require("../../controllers/student-controller");
const cv = require("../../controllers/cv-controllers");
const research = require("../../controllers/research-controllers");
const content = require("../../controllers/content-controllers");
const aggregates = require("../../controllers/aggregate-controllers");

const router = express.Router();
const csv = csvUpload.single("avatar");

/* ------------------------------- auth (/auth) ------------------------------- */
const authRouter = express.Router();
authRouter.post("/signUp", auth.signUp);
authRouter.post("/signIn", auth.signIn);
authRouter.post("/admin/signIn", auth.adminSignIn);
authRouter.post("/passwordreset", auth.passwordReset);
authRouter.post("/passwordreset/admin", auth.passwordReset);
authRouter.post("/validate-token", auth.verifyToken);
authRouter.patch("/update", checkAuth, auth.updatePassword);
authRouter.patch("/updatePass", checkAuth, auth.updatePasswordWithOld);
router.use("/auth", authRouter);

/* ------------------------------ faculty ------------------------------ */
const facultyRouter = express.Router();
facultyRouter.post("/", writeGuard, faculty.create);
facultyRouter.post("/bulk", writeGuard, csv, faculty.bulk);
facultyRouter.get("/get", faculty.getAll);
facultyRouter.get("/get/:unique", faculty.getOne);
facultyRouter.patch("/update/:id", writeGuard, faculty.update);
facultyRouter.delete("/delete/:id", writeGuard, faculty.destroy);
router.use("/faculty", facultyRouter);

const facultyInfoRouter = express.Router();
facultyInfoRouter.post("/", checkAuth, faculty.upsertInfo);
facultyInfoRouter.get("/get/:facultyId", faculty.getInfo);
facultyInfoRouter.put("/update/:facultyId", checkAuth, faculty.updateInfo);
facultyInfoRouter.delete("/delete/:facultyId", checkAuth, faculty.deleteInfo);
router.use("/facultyInfo", facultyInfoRouter);

/* ------------------------------ students ------------------------------ */
const studentRouter = express.Router();
studentRouter.post("/", writeGuard, student.create);
studentRouter.post("/bulk", writeGuard, csv, student.bulk);
studentRouter.get("/get", student.getAll);
studentRouter.get("/getYear/:id?", student.getYears);
studentRouter.get("/getSem/:id?", student.getSemesters);
studentRouter.patch("/update/:id", writeGuard, student.update);
studentRouter.patch("/updateMulti", writeGuard, student.updateMulti);
studentRouter.delete("/delete/:id", writeGuard, student.destroy);
studentRouter.delete("/deleteMulti", writeGuard, student.destroyMulti);
studentRouter.delete("/deleteall", writeGuard, student.destroyAll);
router.use("/student", studentRouter);

/* ------------------------- research entities ------------------------- */
function mountResearch(ctl, { extra } = {}) {
    const r = express.Router();
    r.post("/", writeGuard, ctl.create);
    r.post("/bulk", writeGuard, csv, ctl.bulk);
    r.get("/get", ctl.getAll);
    r.get("/get/admin", ctl.getAll); // legacy twin — one corrected implementation
    r.post("/addFaculty", writeGuard, ctl.addFaculty);
    r.get("/getFaculty", ctl.linkedFaculty);
    if (extra) extra(r);
    r.delete("/delete/:id", writeGuard, ctl.destroy);
    return r;
}

router.use("/publication", mountResearch(research.publication, {
    extra: (r) => {
        r.get("/auth/get", checkAuth, research.publication.authGetAll);
        r.get("/getYear/:facultyId?", research.publication.distinct("year"));
        r.get("/getAcademicSession/:facultyId?", research.publication.distinct("academic_session"));
        r.get("/getIndexing/:facultyId?", research.publication.indexingValues);
        r.get("/publicationfaculties", research.publication.withFaculty);
        r.put("/update/:id", writeGuard, research.publication.update);
    },
}));

router.use("/patent", mountResearch(research.patent, {
    extra: (r) => {
        r.get("/getYear/:facultyId?", research.patent.distinct("year"));
        r.get("/getAcademicSession", research.patent.distinct("academic_session"));
        r.get("/patentfaculties", research.patent.withFaculty);
        r.put("/update/:id", writeGuard, research.patent.update);
    },
}));

router.use("/project", mountResearch(research.project, {
    extra: (r) => {
        r.get("/getYear/:facultyId?", research.project.distinct("year"));
        r.get("/fundingAgency/:facultyId?", research.project.distinct("funding_agency", "ASC"));
        r.get("/getAcademicSession", research.project.distinct("academic_session"));
        r.put("/update/:id", writeGuard, research.project.update);
    },
}));

router.use("/consultancy", mountResearch(research.consultancy, {
    extra: (r) => {
        r.get("/getYear", research.consultancy.distinct("start_year"));
        r.get("/getAcademicSession", research.consultancy.distinct("academic_session"));
        r.get("/clientOrganisation", research.consultancy.distinct("client_organisation", "ASC"));
        r.patch("/update/:id", writeGuard, research.consultancy.update);
    },
}));

router.use("/researchSupervision", mountResearch(research.researchSupervision, {
    extra: (r) => {
        r.get("/auth/get", checkAuth, research.researchSupervision.authGetAll);
        r.get("/getYear/:facultyId?", research.researchSupervision.distinct("year"));
        r.get("/getAcademicSession", research.researchSupervision.distinct("academic_session"));
        r.get("/researchSupervisionfaculties", research.researchSupervision.withFaculty);
        r.patch("/update/:id", writeGuard, research.researchSupervision.update);
    },
}));

// legacy /subjectTaught was the only admin-gated resource; the gate is real now
const subjectTaughtRouter = express.Router();
subjectTaughtRouter.get("/get", research.course.getAll);
subjectTaughtRouter.get("/get/admin", research.course.getAll);
subjectTaughtRouter.post("/", requireAdmin, research.course.create);
subjectTaughtRouter.post("/bulk", requireAdmin, csv, research.course.bulk);
subjectTaughtRouter.put("/update/:id", requireAdmin, research.course.update);
subjectTaughtRouter.delete("/delete/:id", requireAdmin, research.course.destroy);
router.use("/subjectTaught", subjectTaughtRouter);

router.use("/event", mountResearch(research.event, {
    extra: (r) => {
        r.get("/category", research.event.distinct("category", "ASC"));
        r.get("/type", research.event.distinct("event_type", "ASC"));
        r.get("/getYear", research.event.years); // shipped UI expects it; derived from start_date
        r.get("/endDate", research.event.endYears); // shipped faculty events page's year dropdown
        r.get("/getAcademicSession", research.event.distinct("academic_session"));
        r.get("/eventfaculties", research.event.withFaculty);
        r.patch("/update/:id", writeGuard, research.event.update);
    },
}));

/* --------------------------- faculty CV tables --------------------------- */
function mountCv(ctl, { withBulk = true, extra } = {}) {
    const r = express.Router();
    r.post("/", writeGuard, ctl.create);
    if (withBulk) r.post("/bulk", writeGuard, csv, ctl.bulk);
    r.get("/get", ctl.getAll);
    r.patch("/update/:id", writeGuard, ctl.update);
    r.delete("/delete/:id", writeGuard, ctl.destroy);
    if (extra) extra(r);
    return r;
}
router.use("/qualification", mountCv(cv.qualification, {
    withBulk: false,
    extra: (r) => r.get("/highest/get", cv.qualification.highest),
}));
router.use("/teachingExp", mountCv(cv.teachingExp, { withBulk: false }));
router.use("/AdministrativeExperience", mountCv(cv.adminExp, {
    // shipped pages poll /getYear for both year dropdowns
    extra: (r) => r.get("/getYear", cv.adminExp.years),
}));
router.use("/honor", mountCv(cv.honor, { withBulk: false }));
router.use("/exposure", mountCv(cv.exposure, { withBulk: false }));
const expertTalkRouter = mountCv(cv.expertTalk, {
    extra: (r) => {
        r.get("/getTop", cv.expertTalk.top);
        r.get("/getAcademicSession", cv.expertTalk.sessions);
        // shipped pages poll these three for their filter dropdowns
        r.get("/startDate", cv.expertTalk.startYears);
        r.get("/endDate", cv.expertTalk.endYears);
        r.get("/category", cv.expertTalk.sessions);
    },
});
// legacy /expertTalk/get filtered by ?name=<faculty code> — served by the filtered reader
expertTalkRouter.stack = expertTalkRouter.stack.filter((l) => !(l.route && l.route.path === "/get"));
expertTalkRouter.get("/get", cv.expertTalk.getAllFiltered);
router.use("/expertTalk", expertTalkRouter);

/* ------------------------------ years (legacy) ------------------------------ */
// The one-column Years table is gone; the cohort list derives from students.
const yearRouter = express.Router();
yearRouter.get("/get", require("../../utils/wrap")(async () => {
    const StudentService = require("../../services/student-service");
    const years = await StudentService.distinctYears();
    return years.map((y) => ({ id: y, year: y }));
}));
yearRouter.post("/", require("../../utils/wrap")(async () => ({
    message: "Years now derive from students.admission_year; nothing to create.",
})));
yearRouter.delete("/delete", require("../../utils/wrap")(async () => ({
    message: "Years now derive from students.admission_year; nothing to delete.",
})));
router.use("/year", yearRouter);

/* ------------------------------- content ------------------------------- */
const announcementRouter = express.Router();
announcementRouter.post("/", writeGuard, content.announcement.create);
announcementRouter.post("/bulk", writeGuard, csv, content.announcement.bulk);
announcementRouter.get("/get", content.announcement.getAll);
announcementRouter.get("/get/:id", content.announcement.getOne);
announcementRouter.get("/top/:limit", content.announcement.top);
announcementRouter.patch("/update/:id", writeGuard, content.announcement.update);
announcementRouter.delete("/delete/:id", writeGuard, content.announcement.destroy);
router.use("/public/announcement", announcementRouter);

const privateAnnouncementRouter = express.Router();
privateAnnouncementRouter.post("/", writeGuard, content.privateAnnouncement.create);
privateAnnouncementRouter.post("/bulk", writeGuard, csv, content.privateAnnouncement.bulk);
privateAnnouncementRouter.get("/get", content.privateAnnouncement.getAll);
privateAnnouncementRouter.get("/get/searchItem", content.privateAnnouncement.search);
privateAnnouncementRouter.get("/get/:id", content.privateAnnouncement.getOne);
privateAnnouncementRouter.get("/top/:limit", content.privateAnnouncement.top);
privateAnnouncementRouter.patch("/update/:id", writeGuard, content.privateAnnouncement.update);
privateAnnouncementRouter.delete("/delete/:id", writeGuard, content.privateAnnouncement.destroy);
router.use("/private/announcement", privateAnnouncementRouter);

const achievementRouter = express.Router();
achievementRouter.post("/", writeGuard, content.achievement.create);
achievementRouter.post("/bulk", writeGuard, csv, content.achievement.bulk);
achievementRouter.get("/get", content.achievement.getAll);
achievementRouter.get("/get/:id", content.achievement.getOne);
achievementRouter.get("/top/:limit", content.achievement.top);
achievementRouter.patch("/update/:id", writeGuard, content.achievement.update);
achievementRouter.delete("/delete/:id", writeGuard, content.achievement.destroy);
router.use("/achievement", achievementRouter);

const academicsRouter = express.Router();
academicsRouter.post("/", writeGuard, content.academicsNews.create);
academicsRouter.post("/bulk", writeGuard, csv, content.academicsNews.bulk);
academicsRouter.get("/get", content.academicsNews.getAll);
academicsRouter.get("/get/:id", content.academicsNews.getOne);
academicsRouter.get("/top/:limit", content.academicsNews.top);
academicsRouter.patch("/update/:id", writeGuard, content.academicsNews.update);
academicsRouter.delete("/delete/:id", writeGuard, content.academicsNews.destroy);
router.use("/academics", academicsRouter);

const researchNewsRouter = express.Router();
researchNewsRouter.get("/get", content.researchNews.getAll);
researchNewsRouter.get("/top/:limit", content.researchNews.top); // shipped homepage calls this
researchNewsRouter.get("/get/:id", content.researchNews.getOne);
router.use("/research", researchNewsRouter);

const aboutRouter = express.Router();
aboutRouter.post("/", writeGuard, content.about.create);
aboutRouter.get("/get", content.about.getAll);
aboutRouter.delete("/delete/:id", writeGuard, content.about.destroy); // shipped admin UI calls this
router.use("/aboutus", aboutRouter);

const programOfferedRouter = express.Router();
programOfferedRouter.post("/post", writeGuard, content.programOffered.create); // legacy path
programOfferedRouter.get("/get", content.programOffered.getAll);
router.use("/programOffered", programOfferedRouter);

const carouselRouter = express.Router();
carouselRouter.post("/", writeGuard, content.home.create);
carouselRouter.get("/get", content.home.getAll);
// shipped admin UI updates slides via POST — serve both verbs
carouselRouter.put("/update/:id", writeGuard, content.home.update);
carouselRouter.post("/update/:id", writeGuard, content.home.update);
carouselRouter.delete("/delete/:id", writeGuard, content.home.destroy);
router.use("/carousel", carouselRouter);

const hodRouter = express.Router();
hodRouter.post("/", writeGuard, content.hod.create);
hodRouter.get("/get", content.hod.get);
hodRouter.put("/update/:id", writeGuard, content.hod.update);
hodRouter.post("/update/:id", writeGuard, content.hod.update); // shipped admin UI uses POST
hodRouter.delete("/delete/:id", writeGuard, content.hod.destroy);
router.use("/hod", hodRouter);

const qnaRouter = express.Router();
qnaRouter.post("/", writeGuard, content.qna.create);
qnaRouter.post("/bulk", writeGuard, csv, content.qna.bulk);
qnaRouter.get("/get", content.qna.getAll);
qnaRouter.patch("/update/:id", writeGuard, content.qna.update);
qnaRouter.delete("/delete/:id", writeGuard, content.qna.destroy);
router.use("/QnA", qnaRouter);

const syllabusRouter = express.Router();
syllabusRouter.post("/", writeGuard, content.syllabus.create);
syllabusRouter.get("/get", content.syllabus.getAll);
router.use("/syllabus", syllabusRouter);

const calendarRouter = express.Router();
calendarRouter.post("/", writeGuard, content.calendar.create);
calendarRouter.get("/get", content.calendar.getAll);
router.use("/calander", calendarRouter); // legacy spelling

const labRouter = express.Router();
labRouter.post("/", writeGuard, content.lab.create);
labRouter.post("/bulk", writeGuard, csv, content.lab.bulk); // shipped admin UI has a labs CSV import
labRouter.get("/get", content.lab.getAll);
labRouter.get("/get/:id", content.lab.getOne);
labRouter.put("/update/:id", writeGuard, content.lab.update);
labRouter.delete("/delete/:id", writeGuard, content.lab.destroy);
router.use("/labs", labRouter);

const equipmentRouter = express.Router();
equipmentRouter.post("/", writeGuard, content.equipment.create);
equipmentRouter.get("/get", content.equipment.getAll);
equipmentRouter.put("/update/:id", writeGuard, content.equipment.update);
equipmentRouter.delete("/delete/:id", writeGuard, content.equipment.destroy);
router.use("/equipment", equipmentRouter);

const staffRouter = express.Router();
staffRouter.post("/", writeGuard, content.staff.create);
staffRouter.post("/bulk", writeGuard, csv, content.staff.bulk);
staffRouter.get("/get", content.staff.getAll);
staffRouter.patch("/update/:id", writeGuard, content.staff.update);
staffRouter.delete("/delete/:id", writeGuard, content.staff.destroy);
router.use("/staff", staffRouter);

const placementRouter = express.Router();
placementRouter.post("/", writeGuard, content.placementStats.create);
placementRouter.post("/bulk", writeGuard, csv, content.placementStats.bulk);
placementRouter.get("/get", content.placementStats.getAll);
router.use("/placementstats", placementRouter);

const phdScholarRouter = express.Router();
phdScholarRouter.post("/", writeGuard, csv, content.phdScholar.create);
phdScholarRouter.post("/bulk", writeGuard, csv, content.phdScholar.bulk);
phdScholarRouter.get("/get", content.phdScholar.getAll);
phdScholarRouter.patch("/update/:id", writeGuard, content.phdScholar.update);
phdScholarRouter.delete("/delete/:id", writeGuard, content.phdScholar.destroy);
router.use("/phdScholar", phdScholarRouter);

/* ------------------------------ aggregates ------------------------------ */
router.get("/count/get", aggregates.count.getCounts);
router.get("/topentries/get", aggregates.topEntries.getTopData);
router.get("/analytics/get", aggregates.analytics.getAllData);
router.get("/info", aggregates.info.info);

/* --------------------------- document generators --------------------------- */
router.use("/report", require("./generate-report"));
router.use("/resume", require("./generate-resume"));

module.exports = router;
