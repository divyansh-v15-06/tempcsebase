"use strict";
/** CV: honors & recognitions (replaces Honors; FK now enforced). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyHonor extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    FacultyHonor.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            title: { type: DataTypes.STRING(500), allowNull: false },
            givenBy: { type: DataTypes.STRING(255), allowNull: false },
            year: { type: DataTypes.INTEGER, allowNull: false }, // YEAR in DDL; was VARCHAR
        },
        {
            sequelize,
            modelName: "FacultyHonor",
            tableName: "faculty_honors",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyHonor;
};
