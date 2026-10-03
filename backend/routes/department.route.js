const express = require("express");
const router = express.Router();
const departmentController = require("../controller/department.controller");

router.post("/adddepartment", departmentController.AddDepartment);
router.get("/department", departmentController.GetAllDepartments);

module.exports = router;
