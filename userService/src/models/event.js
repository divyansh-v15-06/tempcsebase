"use strict";
/**
 * Department events: STC/FDP/conferences etc. (replaces Events).
 * Dead 'authorName' column dropped (never populated by any controller).
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        static associate(models) {
            this.belongsToMany(models.Faculty, {
                through: models.FacultyEvent, foreignKey: "eventId", otherKey: "facultyId", as: "faculty",
            });
        }
    }
    Event.init(
        {
            title: { type: DataTypes.STRING(500), allowNull: false },
            category: { type: DataTypes.STRING(50), allowNull: true },
            eventType: { type: DataTypes.STRING(50), allowNull: true }, // was 'type' ('STC','E-STC','FDP',...)
            venue: { type: DataTypes.STRING(255), allowNull: true },            // blank in some legacy rows
            sponsoringAgency: { type: DataTypes.STRING(255), allowNull: true }, // blank in 22 of 74 legacy rows
            startDate: { type: DataTypes.DATEONLY, allowNull: false }, // was VARCHAR
            endDate: { type: DataTypes.DATEONLY, allowNull: true },
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
            convenor: { type: DataTypes.STRING(255), allowNull: true },    // was 'Convenor'
            coordinator: { type: DataTypes.STRING(255), allowNull: true }, // was 'Coordinator'
            linkUrl: { type: DataTypes.STRING(1024), allowNull: true },    // was 'Link'
        },
        {
            sequelize,
            modelName: "Event",
            tableName: "events",
            underscored: true,
            indexes: [
                { fields: ["start_date"] },
                { fields: ["category"] },
                { fields: ["event_type"] },
                { fields: ["academic_session"] },
                { fields: [{ name: "title", length: 191 }] },
            ],
        }
    );
    return Event;
};
