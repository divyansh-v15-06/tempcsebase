"use strict";
/** Lookup: degree programs. Manual IDs — app code hardcodes 1..4 (seed preserved). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Program extends Model {
        static associate(models) {
            this.hasMany(models.Student, { foreignKey: "programId", as: "students" });
        }
    }
    Program.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false, allowNull: false },
            name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        },
        { sequelize, modelName: "Program", tableName: "programs", underscored: true }
    );
    return Program;
};
