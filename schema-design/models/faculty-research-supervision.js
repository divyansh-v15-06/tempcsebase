"use strict";
/** Join: faculty <-> research supervisions. Composite PK; no more NULL-faculty rows. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyResearchSupervision extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.ResearchSupervision, { foreignKey: "researchSupervisionId", as: "researchSupervision" });
        }
    }
    FacultyResearchSupervision.init(
        {
            researchSupervisionId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "research_supervisions", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            facultyId: {
                type: DataTypes.INTEGER, // was STRING in the old model
                primaryKey: true,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "FacultyResearchSupervision",
            tableName: "faculty_research_supervisions",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyResearchSupervision;
};
