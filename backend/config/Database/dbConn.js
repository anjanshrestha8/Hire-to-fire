require("dotenv").config();
const { Sequelize } = require("sequelize");

const dbConnection = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: {
      ssl: false,
    },
  }
);

module.exports = dbConnection;
