"use strict";
/** Join: faculty <-> projects. Composite PK. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyProject extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Project, { foreignKey: "projectId", as: "project" });
        }
    }
    FacultyProject.init(
        {
            projectId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "projects", key: "id" },
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
            modelName: "FacultyProject",
            tableName: "faculty_projects",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyProject;
};
