const ServiceError = require("../utils/serviceError");
const employeeService = require("../services/employee.service");

const EmployeeController = {
  AddEmployee: async (req, res) => {
    try {
      const result = await employeeService.addEmployee(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error adding employee:", error);
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong." });
    }
  },

  GetEmployee: async (req, res) => {
    try {
      const result = await employeeService.getEmployee();
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  createSuperAdmin: async (req, res) => {
    try {
      const result = await employeeService.createSuperAdmin(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating super admin:", error);
      return res
        .status(500)
        .json({ error: error.message || "Something went wrong." });
    }
  },
};

module.exports = EmployeeController;
