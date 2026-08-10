"use strict";
/**
 * Announcements (merges 'announcements' + 'privateAnnouncements' — identical shape,
 * "private" was only an unauthenticated URL prefix). The client-pre-split
 * date/month/year VARCHAR triplet becomes one announced_on DATE.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Announcement extends Model {
        static associate() {}
    }
    Announcement.init(
        {
            title: { type: DataTypes.STRING(500), allowNull: false },
            pdfUrl: { type: DataTypes.STRING(1024), allowNull: false }, // was pdfLink
            announcedOn: { type: DataTypes.DATEONLY, allowNull: false },
            isPrivate: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        },
        {
            sequelize,
            modelName: "Announcement",
            tableName: "announcements",
            underscored: true,
            indexes: [{ fields: ["is_private", "announced_on"] }],
        }
    );
    return Announcement;
};
