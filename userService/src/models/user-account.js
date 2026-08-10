"use strict";
/**
 * Login credentials (replaces SignUps). Faculty accounts link by FK; the admin is a
 * role, not a magic 'admin' string. first_login moved here from Faculties.
 */
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
    class UserAccount extends Model {
        static associate(models) {
            this.belongsTo(models.Faculty, { foreignKey: "facultyId", as: "faculty" });
        }
    }
    UserAccount.init(
        {
            facultyId: {
                type: DataTypes.INTEGER,
                allowNull: true, // NULL for non-faculty accounts (admin)
                unique: true,
                references: { model: "faculty", key: "id" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            // Login id for accounts without a faculty row (today's admin row).
            username: { type: DataTypes.STRING(50), allowNull: true, unique: true },
            role: { type: DataTypes.ENUM("faculty", "admin"), allowNull: false, defaultValue: "faculty" },
            // Only for accounts without a faculty row; faculty email lives on faculty.
            email: { type: DataTypes.STRING(255), allowNull: true },
            passwordHash: { type: DataTypes.STRING(100), allowNull: false },
            firstLogin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            sequelize,
            modelName: "UserAccount",
            tableName: "user_accounts",
            underscored: true,
            validate: {
                hasIdentity() {
                    // == null covers both null and undefined (unset attribute).
                    // This is the sole guard: MySQL forbids a CHECK on faculty_id
                    // because it participates in a CASCADE foreign key.
                    if (this.facultyId == null && !this.username) {
                        throw new Error("An account needs either a faculty link or a username.");
                    }
                },
            },
        }
    );
    UserAccount.beforeCreate((account) => {
        // Preserves the SignUp.beforeCreate hashing behavior (cost matches current code).
        if (account.passwordHash && !account.passwordHash.startsWith("$2")) {
            account.passwordHash = bcrypt.hashSync(account.passwordHash, 8);
        }
    });
    return UserAccount;
};
