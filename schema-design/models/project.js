"use strict";
/** Funded projects (replaces Projects). PI/co-PI stay free text (may be external — flagged). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            this.belongsToMany(models.Faculty, {
                through: models.FacultyProject, foreignKey: "projectId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Project.init(
        {
            title: { type: DataTypes.STRING(500), allowNull: false },
            status: { type: DataTypes.STRING(30), allowNull: false }, // 'Ongoing' counter depends on it
            referenceNo: { type: DataTypes.STRING(100), allowNull: true, unique: true }, // legacy junk refs migrated as NULL
            fundingAgency: { type: DataTypes.STRING(255), allowNull: true },
            fundingAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: true }, // was VARCHAR
            duration: { type: DataTypes.STRING(50), allowNull: true }, // free text; nothing parses it
            year: { type: DataTypes.INTEGER, allowNull: false }, // YEAR in DDL
            month: { type: DataTypes.TINYINT, allowNull: true, validate: { min: 1, max: 12 } },
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            principalInvestigator: { type: DataTypes.STRING(255), allowNull: true },
            coPrincipalInvestigator: { type: DataTypes.STRING(255), allowNull: true }, // was coprincipalInvestigator
        },
        {
            sequelize,
            modelName: "Project",
            tableName: "projects",
            underscored: true,
            indexes: [
                { fields: ["year"] },
                { fields: ["status"] },
                { fields: ["academic_session"] },
                { fields: ["funding_agency"] },
                { fields: [{ name: "title", length: 191 }] },
            ],
        }
    );
    return Project;
};
