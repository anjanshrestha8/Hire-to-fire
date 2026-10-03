const { DataTypes } = require("sequelize");
const dbConnection = require("../config/Database/dbConn");

const Designation = dbConnection.define(
  "Designation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM('Junior', 'Mid-level', 'Senior'),
      defaultValue: 'Mid-level',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
    },
    employees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "designation",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Designation;
