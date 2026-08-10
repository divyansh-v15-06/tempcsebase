"use strict";
/** Join: faculty <-> courses (replaces facultysubjects — STRING FK + broken belongsTo("Id")). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyCourse extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Course, { foreignKey: "courseId", as: "course" });
        }
    }
    FacultyCourse.init(
        {
            courseId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "courses", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            facultyId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "FacultyCourse",
            tableName: "faculty_courses",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyCourse;
};
