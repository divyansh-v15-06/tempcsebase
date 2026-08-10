"use strict";
/** Lookup: research-supervision level. Manual IDs (1=MTech, 2=PhD). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SupervisionType extends Model {
        static associate(models) {
            this.hasMany(models.ResearchSupervision, { foreignKey: "supervisionTypeId", as: "researchSupervisions" });
        }
    }
    SupervisionType.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false, allowNull: false },
            name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        },
        { sequelize, modelName: "SupervisionType", tableName: "supervision_types", underscored: true }
    );
    return SupervisionType;
};
