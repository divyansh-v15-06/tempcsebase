"use strict";
/**
 * Clean-schema model loader (sequelize-cli style).
 * Mirrors schema-design/schema.sql. Connection settings come from env vars so
 * this folder stays self-contained; wire it to your config/ when adopted.
 */
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
    process.env.DB_NAME || "cse_department",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT || "3306", 10),
        dialect: "mysql",
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_0900_ai_ci",
        },
    }
);

fs.readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
