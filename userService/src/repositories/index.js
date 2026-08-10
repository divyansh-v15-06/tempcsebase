"use strict";
const models = require("../models");
const BaseRepository = require("./base-repository");
const LinkedRepository = require("./linked-repository");

/** One repository instance per entity. Linked = M:N with Faculty. */
module.exports = {
    BaseRepository,
    LinkedRepository,

    faculty: new BaseRepository(models.Faculty),
    facultyProfile: new BaseRepository(models.FacultyProfile),
    userAccount: new BaseRepository(models.UserAccount),
    staff: new BaseRepository(models.Staff),
    student: new BaseRepository(models.Student),
    phdScholar: new BaseRepository(models.PhdScholar),
    program: new BaseRepository(models.Program),
    researchType: new BaseRepository(models.ResearchType),
    supervisionType: new BaseRepository(models.SupervisionType),

    qualification: new BaseRepository(models.FacultyQualification),
    teachingExp: new BaseRepository(models.FacultyTeachingExperience),
    adminExp: new BaseRepository(models.FacultyAdministrativeExperience),
    honor: new BaseRepository(models.FacultyHonor),
    exposure: new BaseRepository(models.FacultyExposure),
    expertTalk: new BaseRepository(models.ExpertTalk),

    publication: new LinkedRepository(models.Publication, models.FacultyPublication, "publicationId", "publications"),
    patent: new LinkedRepository(models.Patent, models.FacultyPatent, "patentId", "patents"),
    project: new LinkedRepository(models.Project, models.FacultyProject, "projectId", "projects"),
    consultancy: new LinkedRepository(models.Consultancy, models.FacultyConsultancy, "consultancyId", "consultancies"),
    researchSupervision: new LinkedRepository(models.ResearchSupervision, models.FacultyResearchSupervision, "researchSupervisionId", "researchSupervisions"),
    course: new LinkedRepository(models.Course, models.FacultyCourse, "courseId", "courses"),
    event: new LinkedRepository(models.Event, models.FacultyEvent, "eventId", "events"),

    announcement: new BaseRepository(models.Announcement),
    post: new BaseRepository(models.Post),
    aboutSection: new BaseRepository(models.AboutSection),
    programOffered: new BaseRepository(models.ProgramOffered),
    homeSlide: new BaseRepository(models.HomeSlide),
    hodMessage: new BaseRepository(models.HodMessage),
    qna: new BaseRepository(models.Qna),
    syllabus: new BaseRepository(models.SyllabusDocument),
    calendar: new BaseRepository(models.CalendarDocument),
    lab: new BaseRepository(models.Lab),
    equipment: new BaseRepository(models.Equipment),
    placementStat: new BaseRepository(models.PlacementStat),
};
