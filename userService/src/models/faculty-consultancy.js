"use strict";
/** Join: faculty <-> consultancies. Composite PK (both columns were nullable before). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyConsultancy extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Consultancy, { foreignKey: "consultancyId", as: "consultancy" });
        }
    }
    FacultyConsultancy.init(
        {
            consultancyId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "consultancies", key: "id" },
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
            modelName: "FacultyConsultancy",
            tableName: "faculty_consultancies",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyConsultancy;
};
