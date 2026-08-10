"use strict";
/**
 * Courses taught (replaces subjectTaughts). UNIQUE(course_code, academic_year):
 * today the app enforces globally-unique courseCode; year scoping keeps history (flagged).
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Course extends Model {
        static associate(models) {
            this.belongsToMany(models.Faculty, {
                through: models.FacultyCourse, foreignKey: "courseId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Course.init(
        {
            courseCode: { type: DataTypes.STRING(20), allowNull: false },
            courseName: { type: DataTypes.STRING(255), allowNull: false },
            semester: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 10 } },
            courseLevel: { type: DataTypes.ENUM("UG", "PG"), allowNull: false },
            lectureHours: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 0, max: 4 } },
            tutorialHours: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 0, max: 1 } },
            practicalHours: { type: DataTypes.TINYINT, allowNull: false, validate: { isIn: [[0, 2, 4]] } },
            academicYear: { type: DataTypes.STRING(9), allowNull: false },
        },
        {
            sequelize,
            modelName: "Course",
            tableName: "courses",
            underscored: true,
            indexes: [{ unique: true, fields: ["course_code", "academic_year"] }],
        }
    );
    return Course;
};
