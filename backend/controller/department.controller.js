const ServiceError = require("../utils/serviceError");
const departmentService = require("../services/department.service");

const DepartmentController = {
  AddDepartment: async (req, res) => {
    try {
      const result = await departmentService.AddDepartment(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  GetAllDepartments: async (req, res) => {
    try {
      const result = await departmentService.GetAllDepartments();
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = DepartmentController;
