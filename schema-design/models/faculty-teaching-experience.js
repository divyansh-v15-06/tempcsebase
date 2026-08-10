"use strict";
/** CV: teaching experience (replaces teachingExps; 'from'/'to' VARCHARs -> real dates). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyTeachingExperience extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyTeachingExperience.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            position: { type: DataTypes.STRING(255), allowNull: false },
            department: { type: DataTypes.STRING(255), allowNull: false },
            startDate: { type: DataTypes.DATEONLY, allowNull: false }, // was 'from'
            endDate: { type: DataTypes.DATEONLY, allowNull: true },    // was 'to'; NULL = present
        },
        {
            sequelize,
            modelName: "FacultyTeachingExperience",
            tableName: "faculty_teaching_experiences",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyTeachingExperience;
};
