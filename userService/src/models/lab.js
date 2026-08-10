"use strict";
/** Department labs (replaces labs). OIC/technician stay free text (FK candidates — flagged). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Lab extends Model {
        static associate() {}
    }
    Lab.init(
        {
            title: { type: DataTypes.STRING(255), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
            photoUrl: { type: DataTypes.STRING(1024), allowNull: false },
            officerInCharge: { type: DataTypes.STRING(255), allowNull: false }, // was 'OIC'
            technician: { type: DataTypes.STRING(255), allowNull: false },
        },
        { sequelize, modelName: "Lab", tableName: "labs", underscored: true }
    );
    return Lab;
};
