"use strict";
/**
 * Public research-scholar directory (replaces PhdScholars).
 * Merges duplicate columns: supervisor <- COALESCE(Supervisor, guide),
 * dissertationTitle <- COALESCE(title, dissertation).
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class PhdScholar extends Model {
        static associate() {}
    }
    PhdScholar.init(
        {
            name: { type: DataTypes.STRING(255), allowNull: false },
            rollNo: { type: DataTypes.STRING(20), allowNull: true },
            email: { type: DataTypes.STRING(255), allowNull: true },
            supervisor: { type: DataTypes.STRING(255), allowNull: true }, // may be external -> free text (flagged)
            coSupervisor: { type: DataTypes.STRING(255), allowNull: true },
            status: { type: DataTypes.STRING(30), allowNull: true }, // 'pursuing' / 'passed' counters depend on these
            registrationYear: { type: DataTypes.INTEGER, allowNull: true }, // YEAR in DDL
            dissertationTitle: { type: DataTypes.STRING(500), allowNull: true },
            lastQualification: { type: DataTypes.STRING(255), allowNull: true },
            researchArea: { type: DataTypes.STRING(500), allowNull: true },
            endDate: { type: DataTypes.DATEONLY, allowNull: true },
            // Semantics never used in code — verify against the dump (flagged in SUMMARY).
            time: { type: DataTypes.STRING(100), allowNull: true },
            photoUrl: { type: DataTypes.STRING(1024), allowNull: true },
            portfolioUrl: { type: DataTypes.STRING(512), allowNull: true },
            linkedinUrl: { type: DataTypes.STRING(512), allowNull: true },
            googleScholarUrl: { type: DataTypes.STRING(512), allowNull: true },
            scopusUrl: { type: DataTypes.STRING(512), allowNull: true },
        },
        {
            sequelize,
            modelName: "PhdScholar",
            tableName: "phd_scholars",
            underscored: true,
            indexes: [{ fields: ["status"] }],
        }
    );
    return PhdScholar;
};
