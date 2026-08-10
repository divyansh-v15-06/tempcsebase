"use strict";
/** Homepage carousel images (replaces Homes.photo). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class HomeSlide extends Model {
        static associate() {}
    }
    HomeSlide.init(
        {
            imageUrl: { type: DataTypes.STRING(1024), allowNull: false },
        },
        { sequelize, modelName: "HomeSlide", tableName: "home_slides", underscored: true }
    );
    return HomeSlide;
};
