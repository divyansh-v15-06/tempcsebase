"use strict";
/** CV: exposures/visits (replaces Exposures; FK now enforced). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyExposure extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyExposure.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            title: { type: DataTypes.STRING(255), allowNull: false }, // 'Untitled Exposure' default dropped
            description: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            sequelize,
            modelName: "FacultyExposure",
            tableName: "faculty_exposures",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyExposure;
};
