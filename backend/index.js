require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnection = require("./config/Database/dbConn");
require("./models/index.modal");
require("./models/employee");
require("./models/messages");
require("./models/notifications");

const Routes = require("./routes");
const buildChannelRouter = require("./routes/channel.route");

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use("/api", Routes);
app.use("/channel", buildChannelRouter(io));

dbConnection
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
