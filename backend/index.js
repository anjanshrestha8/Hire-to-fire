require("dotenv").config();
const express = require("express");
const dbConnection = require("./config/Database/dbConn");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());

dbConnection
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
