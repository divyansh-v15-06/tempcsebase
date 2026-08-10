"use strict";
/** Patents (replaces Patents). reference_no is the service dedup key -> UNIQUE. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Patent extends Model {
        static associate(models) {
            this.belongsToMany(models.Faculty, {
                through: models.FacultyPatent, foreignKey: "patentId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Patent.init(
        {
            title: { type: DataTypes.STRING(500), allowNull: false },
            status: { type: DataTypes.STRING(50), allowNull: false },
            referenceNo: { type: DataTypes.STRING(100), allowNull: true, unique: true }, // legacy junk refs migrated as NULL
            year: { type: DataTypes.INTEGER, allowNull: false }, // YEAR in DDL
            month: { type: DataTypes.TINYINT, allowNull: true, validate: { min: 1, max: 12 } },
            place: { type: DataTypes.STRING(255), allowNull: true },
            filedDate: { type: DataTypes.DATEONLY, allowNull: true },   // fixes 'filledDate'
            grantedDate: { type: DataTypes.DATEONLY, allowNull: true },
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            authorText: { type: DataTypes.STRING(1000), allowNull: true },
        },
        {
            sequelize,
            modelName: "Patent",
            tableName: "patents",
            underscored: true,
            indexes: [
                { fields: ["year"] },
                { fields: ["academic_session"] },
                { fields: [{ name: "title", length: 191 }] },
            ],
        }
    );
    return Patent;
};
