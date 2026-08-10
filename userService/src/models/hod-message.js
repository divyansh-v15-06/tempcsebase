"use strict";
/** HOD message (replaces hods; app reads with findOne() — singleton semantics). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class HodMessage extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    HodMessage.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: true, // new optional link — the HOD is a faculty member
                references: { model: "faculty", key: "id" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            name: { type: DataTypes.STRING(255), allowNull: true },
            message: { type: DataTypes.TEXT, allowNull: true },
            imageUrl: { type: DataTypes.STRING(1024), allowNull: true }, // was 'image'
        },
        { sequelize, modelName: "HodMessage", tableName: "hod_messages", underscored: true }
    );
    return HodMessage;
};
