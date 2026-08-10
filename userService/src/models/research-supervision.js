"use strict";
/**
 * Research-supervision CV entries (replaces researchSupervisions).
 * Overlaps phd_scholars (public directory) — kept separate on purpose (flagged).
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ResearchSupervision extends Model {
        static associate(models) {
            this.belongsTo(models.SupervisionType, { foreignKey: "supervisionTypeId", as: "supervisionType" });
            this.belongsToMany(models.Faculty, {
                through: models.FacultyResearchSupervision,
                foreignKey: "researchSupervisionId",
                otherKey: "facultyId",
                as: "faculty",
            });
        }
    }
    ResearchSupervision.init(
        {
            supervisionTypeId: {
                type: DataTypes.INTEGER,
                allowNull: false, // was 'program'
                references: { model: "supervision_types", key: "id" },
                onDelete: "RESTRICT",
                onUpdate: "CASCADE",
            },
            scholarName: { type: DataTypes.STRING(255), allowNull: false },
            rollNo: { type: DataTypes.STRING(20), allowNull: true }, // missing for 92 of 233 legacy rows
            researchTopic: { type: DataTypes.STRING(500), allowNull: true }, // service dedup lookup; intentionally NOT unique
            status: { type: DataTypes.STRING(30), allowNull: true },
            year: { type: DataTypes.INTEGER, allowNull: true }, // YEAR in DDL
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            coSupervisor: { type: DataTypes.STRING(255), allowNull: true }, // fixes 'coSupervisior'
        },
        {
            sequelize,
            modelName: "ResearchSupervision",
            tableName: "research_supervisions",
            underscored: true,
            indexes: [
                { fields: ["supervision_type_id"] },
                { fields: ["year"] },
                { fields: ["academic_session"] },
                { fields: [{ name: "research_topic", length: 191 }] },
            ],
        }
    );
    return ResearchSupervision;
};
