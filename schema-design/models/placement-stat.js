"use strict";
/**
 * Placement statistics per branch per year (replaces placementStats — all VARCHAR).
 * placed_percent / offers_percent are STORED GENERATED columns in the DDL
 * (replacing the hand-entered 'percent'/'percentJobOffered') — treat as read-only.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class PlacementStat extends Model {
        static associate() {}
    }
    PlacementStat.init(
        {
            branch: { type: DataTypes.STRING(50), allowNull: false },
            year: { type: DataTypes.INTEGER, allowNull: false }, // YEAR in DDL
            candidates: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
            placed: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
            jobsOffered: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
            maxCtc: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
            // DB-generated; never write from the app.
            placedPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            offersPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
        },
        {
            sequelize,
            modelName: "PlacementStat",
            tableName: "placement_stats",
            underscored: true,
            indexes: [{ unique: true, fields: ["branch", "year"] }],
        }
    );
    return PlacementStat;
};
