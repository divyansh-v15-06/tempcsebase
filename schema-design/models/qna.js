"use strict";
/** FAQ entries (replaces QnAs; NOT NULL now DB-enforced, matching the model intent). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Qna extends Model {
        static associate() {}
    }
    Qna.init(
        {
            question: { type: DataTypes.STRING(500), allowNull: false },
            answer: { type: DataTypes.TEXT, allowNull: false },
        },
        {
            sequelize,
            modelName: "Qna",
            tableName: "qna",
            underscored: true,
            indexes: [{ fields: [{ name: "question", length: 191 }] }], // create-path dedup lookup
        }
    );
    return Qna;
};
