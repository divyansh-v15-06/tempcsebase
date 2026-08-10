"use strict";
/** CV: degrees (replaces singular-named 'Qualification' table; FK now enforced). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyQualification extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyQualification.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            degreeName: { type: DataTypes.STRING(255), allowNull: false }, // was nameOfDegree
            universityName: { type: DataTypes.STRING(255), allowNull: false },
            passingYear: { type: DataTypes.INTEGER, allowNull: false }, // YEAR in DDL; was VARCHAR (lexicographic 'highest' sort)
        },
        {
            sequelize,
            modelName: "FacultyQualification",
            tableName: "faculty_qualifications",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyQualification;
};
