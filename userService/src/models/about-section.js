"use strict";
/** About-us content blocks (replaces Abouts; app truncate-then-insert = de-facto singleton). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AboutSection extends Model {
        static associate() {}
    }
    AboutSection.init(
        {
            title: { type: DataTypes.STRING(255), allowNull: true },
            description: { type: DataTypes.TEXT, allowNull: false },
        },
        { sequelize, modelName: "AboutSection", tableName: "about_sections", underscored: true }
    );
    return AboutSection;
};
