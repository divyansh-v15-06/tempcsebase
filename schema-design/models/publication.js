"use strict";
/**
 * Research publications (replaces 'publications').
 * author_text keeps the printed author list (incl. external authors); internal
 * co-authors live in faculty_publications. Dedup key today is (doi, title) —
 * DDL constrains doi UNIQUE (flagged: relax if the dump has placeholder DOIs).
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Publication extends Model {
        static associate(models) {
            this.belongsTo(models.ResearchType, { foreignKey: "researchTypeId", as: "researchType" });
            this.belongsToMany(models.Faculty, {
                through: models.FacultyPublication, foreignKey: "publicationId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Publication.init(
        {
            title: { type: DataTypes.STRING(500), allowNull: false },
            venueName: { type: DataTypes.STRING(500), allowNull: true }, // was 'name' (journal/conference/book)
            volume: { type: DataTypes.STRING(100), allowNull: true }, // legacy data: one row stores an SSRN note here
            issue: { type: DataTypes.STRING(50), allowNull: true },
            pageRange: { type: DataTypes.STRING(50), allowNull: true }, // was pageNo
            year: { type: DataTypes.INTEGER, allowNull: true },  // YEAR in DDL; was VARCHAR
            month: { type: DataTypes.TINYINT, allowNull: true, validate: { min: 1, max: 12 } },
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            doi: { type: DataTypes.STRING(255), allowNull: true, unique: true }, // legacy rows without a DOI; UNIQUE ignores NULLs
            researchTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true, // was 'type'
                references: { model: "research_types", key: "id" },
                onDelete: "RESTRICT",
                onUpdate: "CASCADE",
            },
            // Model said INTEGER, DB said STRING, code compares these literals.
            indexing: {
                type: DataTypes.ENUM("SCI(E)", "Scopus", "ESCI", "Other"),
                allowNull: false,
                defaultValue: "Other",
            },
            // 'T' semantics unconfirmed -> plain VARCHAR until the dump settles it (flagged).
            journalQuartile: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "T" },
            authorText: { type: DataTypes.STRING(1000), allowNull: true }, // was authorName
            isbn: { type: DataTypes.STRING(32), allowNull: true },
        },
        {
            sequelize,
            modelName: "Publication",
            tableName: "publications",
            underscored: true,
            indexes: [
                { fields: ["research_type_id", "academic_session"] }, // report counts group by this pair
                { fields: ["year"] },
                { fields: ["indexing"] },
                { fields: [{ name: "title", length: 191 }] },
            ],
        }
    );
    return Publication;
};
