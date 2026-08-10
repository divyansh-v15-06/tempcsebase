"use strict";
/** Academic-calendar PDFs (replaces Calendars). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class CalendarDocument extends Model {
        static associate() {}
    }
    CalendarDocument.init(
        {
            title: { type: DataTypes.STRING(255), allowNull: false },
            pdfUrl: { type: DataTypes.STRING(1024), allowNull: false },
        },
        { sequelize, modelName: "CalendarDocument", tableName: "calendar_documents", underscored: true }
    );
    return CalendarDocument;
};
