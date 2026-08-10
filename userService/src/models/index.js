"use strict";
/** Model loader for the clean schema (mirrors schema-design/schema.sql). */
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const ServerConfig = require("../config/server-config");

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(ServerConfig.DB_NAME, ServerConfig.DB_USER, ServerConfig.DB_PASSWORD, {
    host: ServerConfig.DB_HOST,
    port: ServerConfig.DB_PORT,
    dialect: "mysql",
    logging: ServerConfig.DB_LOGGING ? console.log : false,
    define: { charset: "utf8mb4" },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

fs.readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
