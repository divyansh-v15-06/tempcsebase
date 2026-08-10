"use strict";
/** Lookup: publication categories. Manual IDs (1=Journal, 2=Conference, 3=Book, 4=BookChapter). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ResearchType extends Model {
        static associate(models) {
            this.hasMany(models.Publication, { foreignKey: "researchTypeId", as: "publications" });
        }
    }
    ResearchType.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false, allowNull: false },
            name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        },
        { sequelize, modelName: "ResearchType", tableName: "research_types", underscored: true }
    );
    return ResearchType;
};
