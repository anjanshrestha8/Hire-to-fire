const ServiceError = require("../utils/serviceError");
const designationService = require("../services/designation.service");

const DesignationController = {
  AddDesignation: async (req, res) => {
    try {
      const result = await designationService.AddDesignation(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error creating designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  GetDesignation: async (req, res) => {
    try {
      const result = await designationService.GetDesignation();
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error fetching designations:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  UpdateDesignation: async (req, res) => {
    try {
      const result = await designationService.UpdateDesignation(
        req.params.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error updating designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  DeleteDesignation: async (req, res) => {
    try {
      const result = await designationService.DeleteDesignation(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json(error.body);
      }
      console.error("Error deleting designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
};

module.exports = DesignationController;
