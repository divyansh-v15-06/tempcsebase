"use strict";
/**
 * 1:1 extended profile a faculty member fills in after login (replaces FacultyInfos).
 * The free-text CV duplicates (educationalQualification, teachingExperience,
 * administrativeExperience, honorsRecognitions) are gone — real child tables own those.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyProfile extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyProfile.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true, // true 1:1
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
            dateOfJoining: { type: DataTypes.DATEONLY, allowNull: true },
            googleScholarUrl: { type: DataTypes.STRING(512), allowNull: true },
            scopusUrl: { type: DataTypes.STRING(512), allowNull: true },
            publonsUrl: { type: DataTypes.STRING(512), allowNull: true },
            orcid: { type: DataTypes.STRING(32), allowNull: true },
            researchGateUrl: { type: DataTypes.STRING(512), allowNull: true }, // absorbs researchGate + rgLink
            vidwanUrl: { type: DataTypes.STRING(512), allowNull: true },
            linkedinUrl: { type: DataTypes.STRING(512), allowNull: true },
        },
        { sequelize, modelName: "FacultyProfile", tableName: "faculty_profiles", underscored: true }
    );
    return FacultyProfile;
};
