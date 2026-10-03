const express = require("express");
const route = express.Router();

const employeeRoute = require("./employee.route");
const userRoute = require("./user.route");
const departmentRoute = require("./department.route");
const designationRoute = require("./desgination.route");
const taskRoute = require("./task.route");
const notificationRoute = require("./notification.route");
const meetRoute = require("./meet.route");
const messageRoute = require("./message.route");

route.use("/employee", employeeRoute);
route.use("/user", userRoute);
route.use("/department", departmentRoute);
route.use("/designation", designationRoute);
route.use("/tasks", taskRoute);
route.use("/notification", notificationRoute);
route.use("/meet", meetRoute);
route.use("/message", messageRoute);

module.exports = route;
