"use strict";
/** CV: administrative roles (replaces AdministrativeExperiences). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyAdministrativeExperience extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyAdministrativeExperience.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            position: { type: DataTypes.STRING(255), allowNull: false },
            organisation: { type: DataTypes.STRING(255), allowNull: true },
            startDate: { type: DataTypes.DATEONLY, allowNull: true }, // was VARCHAR DD/MM/YYYY
            endDate: { type: DataTypes.DATEONLY, allowNull: true },
        },
        {
            sequelize,
            modelName: "FacultyAdministrativeExperience",
            tableName: "faculty_administrative_experiences",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyAdministrativeExperience;
};
