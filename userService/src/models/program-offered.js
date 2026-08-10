"use strict";
/**
 * Page content describing offered programs (replaces double-plural 'ProgramsOffereds').
 * Distinct from the 'programs' enrollment lookup.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ProgramOffered extends Model {
        static associate() {}
    }
    ProgramOffered.init(
        {
            title: { type: DataTypes.STRING(255), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
        },
        { sequelize, modelName: "ProgramOffered", tableName: "programs_offered", underscored: true }
    );
    return ProgramOffered;
};
