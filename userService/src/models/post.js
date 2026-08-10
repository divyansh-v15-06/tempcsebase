"use strict";
/**
 * Dated content posts (merges 'Achievements' + 'AcademicsNews' — identical columns,
 * identical CRUD/top-N endpoints). 'ReserchNews' is dropped entirely: it has no
 * write endpoint and its repository computes "research news" from publications/
 * projects/patents instead.
 */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Post extends Model {
        static associate() {}
    }
    Post.init(
        {
            category: { type: DataTypes.ENUM("achievement", "academic_news"), allowNull: false },
            title: { type: DataTypes.STRING(500), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false }, // was VARCHAR with a 10k app validator
            photoUrl: { type: DataTypes.STRING(1024), allowNull: true },
            pdfUrl: { type: DataTypes.STRING(1024), allowNull: true },
            publishedOn: { type: DataTypes.DATEONLY, allowNull: true }, // was VARCHAR 'date'
        },
        {
            sequelize,
            modelName: "Post",
            tableName: "posts",
            underscored: true,
            indexes: [{ fields: ["category", "published_on"] }],
        }
    );
    return Post;
};
