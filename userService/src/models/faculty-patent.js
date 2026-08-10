"use strict";
/** Join: faculty <-> patents. Composite PK. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyPatent extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Patent, { foreignKey: "patentId", as: "patent" });
        }
    }
    FacultyPatent.init(
        {
            patentId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "patents", key: "id" },
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
            modelName: "FacultyPatent",
            tableName: "faculty_patents",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyPatent;
};
