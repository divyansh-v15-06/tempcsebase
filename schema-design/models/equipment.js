"use strict";
/** Lab equipment purchases (replaces 'equipment'; money was FLOAT, date was VARCHAR). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Equipment extends Model {
        static associate() {}
    }
    Equipment.init(
        {
            name: { type: DataTypes.STRING(255), allowNull: false },
            quantity: { type: DataTypes.INTEGER, allowNull: false },
            purchaseDate: { type: DataTypes.DATEONLY, allowNull: true }, // was 'date' (assumed purchase date — verify)
            stock: { type: DataTypes.INTEGER, allowNull: false },
            invoiceNo: { type: DataTypes.STRING(100), allowNull: true }, // was 'invoice'
            indenter: { type: DataTypes.STRING(255), allowNull: true },
            vendor: { type: DataTypes.STRING(255), allowNull: true }, // fixes 'vender'
            addressContact: { type: DataTypes.STRING(500), allowNull: true }, // was 'addressAndCon'
            amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // was FLOAT
            academicSession: { type: DataTypes.STRING(9), allowNull: true },
        },
        {
            sequelize,
            modelName: "Equipment",
            tableName: "equipment",
            underscored: true,
            indexes: [{ fields: ["academic_session"] }],
        }
    );
    return Equipment;
};
