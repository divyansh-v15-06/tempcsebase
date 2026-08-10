"use strict";
/** Syllabus PDFs (replaces Syllabuses). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SyllabusDocument extends Model {
        static associate() {}
    }
    SyllabusDocument.init(
        {
            title: { type: DataTypes.STRING(255), allowNull: false },
            pdfUrl: { type: DataTypes.STRING(1024), allowNull: false },
        },
        { sequelize, modelName: "SyllabusDocument", tableName: "syllabus_documents", underscored: true }
    );
    return SyllabusDocument;
};
