"use strict";
/** CV: invited/expert talks (replaces expertTalks). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExpertTalk extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    ExpertTalk.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            title: { type: DataTypes.STRING(500), allowNull: false },
            venue: { type: DataTypes.STRING(255), allowNull: true },
            startDate: { type: DataTypes.DATEONLY, allowNull: true }, // was VARCHAR
            endDate: { type: DataTypes.DATEONLY, allowNull: true },
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            description: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            sequelize,
            modelName: "ExpertTalk",
            tableName: "expert_talks",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }, { fields: ["academic_session"] }],
        }
    );
    return ExpertTalk;
};
