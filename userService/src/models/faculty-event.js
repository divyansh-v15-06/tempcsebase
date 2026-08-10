"use strict";
/** Join: faculty <-> events. Composite PK. */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FacultyEvent extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
            this.belongsTo(models.Event, { foreignKey: "eventId", as: "event" });
        }
    }
    FacultyEvent.init(
        {
            eventId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "events", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            facultyId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "FacultyEvent",
            tableName: "faculty_events",
            underscored: true,
            indexes: [{ fields: ["faculty_id"] }],
        }
    );
    return FacultyEvent;
};
