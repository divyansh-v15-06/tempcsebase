"use strict";
/** Consultancy engagements (replaces Consultancies). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Consultancy extends Model {
        static associate(models) {
            this.belongsToMany(models.Faculty, {
                through: models.FacultyConsultancy, foreignKey: "consultancyId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Consultancy.init(
        {
            referenceNo: { type: DataTypes.STRING(100), allowNull: true, unique: true }, // bulk dedup key; every legacy ref was blank → NULL
            title: { type: DataTypes.STRING(500), allowNull: false },
            clientOrganisation: { type: DataTypes.STRING(255), allowNull: true },
            amount: { type: DataTypes.DECIMAL(14, 2), allowNull: true }, // was VARCHAR
            startYear: { type: DataTypes.INTEGER, allowNull: true }, // YEAR in DDL; default sort key
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            status: { type: DataTypes.STRING(30), allowNull: true },
            authorText: { type: DataTypes.STRING(1000), allowNull: true },
        },
        {
            sequelize,
            modelName: "Consultancy",
            tableName: "consultancies",
            underscored: true,
            indexes: [
                { fields: ["start_year"] },
                { fields: ["academic_session"] },
                { fields: ["client_organisation"] },
                { fields: [{ name: "title", length: 191 }] },
            ],
        }
    );
    return Consultancy;
};
