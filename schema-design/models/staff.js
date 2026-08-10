"use strict";
/** Non-teaching staff (replaces Staffs). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Staff extends Model {
        static associate() {}
    }
    Staff.init(
        {
            name: { type: DataTypes.STRING(255), allowNull: false },
            phone: { type: DataTypes.STRING(20), allowNull: true },
            email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
            designation: { type: DataTypes.STRING(100), allowNull: false },
            photoUrl: { type: DataTypes.STRING(1024), allowNull: true },
            // Semantics never used in code — verify against the dump (flagged in SUMMARY).
            time: { type: DataTypes.STRING(100), allowNull: true },
        },
        { sequelize, modelName: "Staff", tableName: "staff", underscored: true }
    );
    return Staff;
};
