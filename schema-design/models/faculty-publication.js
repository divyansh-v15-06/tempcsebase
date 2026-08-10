"use strict";
/** Join: internal co-authorship. Composite PK — duplicate links impossible. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyPublication extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Publication, { foreignKey: "publicationId", as: "publication" });
        }
    }
    FacultyPublication.init(
        {
            publicationId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "publications", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            facultyId: {
                type: DataTypes.INTEGER, // was STRING in the old model, nullable in the old DB
                primaryKey: true,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "FacultyPublication",
            tableName: "faculty_publications",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyPublication;
};
