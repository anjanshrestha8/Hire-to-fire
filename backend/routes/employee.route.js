const express = require("express");
const router = express.Router();
const EmployeeController = require("../controller/employee.controller");

router.post("/addEmployee", EmployeeController.AddEmployee);
router.get("/employee", EmployeeController.GetEmployee);
router.post("/createSuperAdmin", EmployeeController.createSuperAdmin);

module.exports = router;
