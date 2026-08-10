"use strict";
/** Students (replaces Students; the one-column Years lookup is dropped). */
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Student extends Model {
        static associate(models) {
            this.belongsTo(models.Program, { foreignKey: "programId", as: "program" });
        }
    }
    Student.init(
        {
            name: { type: DataTypes.STRING(255), allowNull: false },
            rollNo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
            email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
            photoUrl: { type: DataTypes.STRING(1024), allowNull: true },
            programId: {
                type: DataTypes.INTEGER,
                allowNull: false, // was typo'd 'programmEnroled'
                references: { model: "programs", key: "id" },
                onDelete: "RESTRICT", // deleting a program must not delete students
                onUpdate: "CASCADE",
            },
            currentSemester: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 10 } },
            admissionYear: { type: DataTypes.SMALLINT, allowNull: false }, // was Students.year
        },
        {
            sequelize,
            modelName: "Student",
            tableName: "students",
            underscored: true,
            indexes: [{ fields: ["program_id"] }, { fields: ["current_semester"] }, { fields: ["admission_year"] }],
        }
    );
    return Student;
};
