"use strict";
/** Core faculty entity (replaces Faculties). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Faculty extends Model {
        static associate(models) {
            this.hasOne(models.FacultyProfile, { foreignKey: "facultyId", as: "profile" });
            this.hasOne(models.UserAccount, { foreignKey: "facultyId", as: "account" });

            this.hasMany(models.FacultyQualification, { foreignKey: "facultyId", as: "qualifications" });
            this.hasMany(models.FacultyTeachingExperience, { foreignKey: "facultyId", as: "teachingExperiences" });
            this.hasMany(models.FacultyAdministrativeExperience, { foreignKey: "facultyId", as: "administrativeExperiences" });
            this.hasMany(models.FacultyHonor, { foreignKey: "facultyId", as: "honors" });
            this.hasMany(models.FacultyExposure, { foreignKey: "facultyId", as: "exposures" });
            this.hasMany(models.ExpertTalk, { foreignKey: "facultyId", as: "expertTalks" });
            this.hasMany(models.HodMessage, { foreignKey: "facultyId", as: "hodMessages" });

            this.belongsToMany(models.Publication, {
                through: models.FacultyPublication, foreignKey: "facultyId", otherKey: "publicationId", as: "publications",
            });
            this.belongsToMany(models.Patent, {
                through: models.FacultyPatent, foreignKey: "facultyId", otherKey: "patentId", as: "patents",
            });
            this.belongsToMany(models.Project, {
                through: models.FacultyProject, foreignKey: "facultyId", otherKey: "projectId", as: "projects",
            });
            this.belongsToMany(models.Consultancy, {
                through: models.FacultyConsultancy, foreignKey: "facultyId", otherKey: "consultancyId", as: "consultancies",
            });
            this.belongsToMany(models.ResearchSupervision, {
                through: models.FacultyResearchSupervision, foreignKey: "facultyId", otherKey: "researchSupervisionId", as: "researchSupervisions",
            });
            this.belongsToMany(models.Course, {
                through: models.FacultyCourse, foreignKey: "facultyId", otherKey: "courseId", as: "courses",
            });
            this.belongsToMany(models.Event, {
                through: models.FacultyEvent, foreignKey: "facultyId", otherKey: "eventId", as: "events",
            });
        }
    }
    Faculty.init(
        {
            // Business key ('CS0<id>') used by URLs, CSV imports and JWTs — now unique.
            facultyCode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
            name: { type: DataTypes.STRING(255), allowNull: false },
            position: { type: DataTypes.STRING(100), allowNull: true },
            // Replaces the position='---' sentinel that meant "not permanent".
            isPermanent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            phone: { type: DataTypes.STRING(20), allowNull: true },
            email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
            portfolioUrl: { type: DataTypes.STRING(512), allowNull: true, unique: true },
            photoUrl: { type: DataTypes.STRING(1024), allowNull: true },
            // Replaces misspelled 'shorting' — the display order of the faculty list.
            sortOrder: { type: DataTypes.INTEGER, allowNull: true },
            researchInterests: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            sequelize,
            modelName: "Faculty",
            tableName: "faculty",
            underscored: true,
            indexes: [{ fields: ["name"] }, { fields: ["sort_order"] }],
        }
    );
    return Faculty;
};
