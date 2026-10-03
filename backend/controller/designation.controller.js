const Designation = require("../models/designation");

const DesignationController = {
  AddDesignation: async (req, res) => {
    try {
      const { title, description, department, level, salaryMin, salaryMax } =
        req.body;

      // Validation
      if (!title || !department || salaryMin == null || salaryMax == null) {
        return res.status(400).json({
          error: "Title, department, and salary range are required.",
        });
      }

      // Check for existing designation
      const existing = await Designation.findOne({ where: { title } });
      if (existing) {
        return res.status(409).json({
          error: "Designation title already exists.",
        });
      }

      // Create salary range string
      const salaryRange = `$${parseFloat(
        salaryMin
      ).toLocaleString()} - $${parseFloat(salaryMax).toLocaleString()}`;

      // Create new designation
      const newDesignation = await Designation.create({
        title,
        description: description || null,
        department,
        level: level || "Mid-level",
        status: "active",
        employees: 0,
        salary_range: salaryRange,
        base_salary: parseFloat(salaryMin), // Store minimum as base salary
      });

      res.status(201).json({
        message: "Designation created successfully.",
        designation: newDesignation,
      });
    } catch (error) {
      console.error("Error creating designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  GetDesignation: async (req, res) => {
    try {
      const designations = await Designation.findAll({
        order: [["created_at", "DESC"]],
      });

      // Transform data to match frontend expectations
      const transformedDesignations = designations.map((designation) => ({
        id: designation.id,
        title: designation.title,
        department: designation.department,
        description: designation.description,
        level: designation.level,
        status: designation.status,
        employees: designation.employees,
        salaryRange: designation.salary_range,
        created: new Date(designation.created_at).toLocaleDateString(),
      }));

      res.status(200).json(transformedDesignations);
    } catch (error) {
      console.error("Error fetching designations:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  UpdateDesignation: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, department, level, salaryMin, salaryMax } =
        req.body;

      const designation = await Designation.findByPk(id);
      if (!designation) {
        return res.status(404).json({ error: "Designation not found." });
      }

      // Create salary range if provided
      let updateData = {
        title: title || designation.title,
        description:
          description !== undefined ? description : designation.description,
        department: department || designation.department,
        level: level || designation.level,
      };

      if (salaryMin && salaryMax) {
        updateData.salary_range = `$${parseInt(
          salaryMin
        ).toLocaleString()} - $${parseInt(salaryMax).toLocaleString()}`;
        updateData.base_salary = parseInt(salaryMin);
      }

      await designation.update(updateData);

      // Transform response
      const transformedDesignation = {
        id: designation.id,
        title: designation.title,
        department: designation.department,
        description: designation.description,
        level: designation.level,
        status: designation.status,
        employees: designation.employees,
        salaryRange: designation.salary_range,
        created: new Date(designation.created_at).toLocaleDateString(),
      };

      res.status(200).json({
        message: "Designation updated successfully.",
        designation: transformedDesignation,
      });
    } catch (error) {
      console.error("Error updating designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  DeleteDesignation: async (req, res) => {
    try {
      const { id } = req.params;

      const designation = await Designation.findByPk(id);
      if (!designation) {
        return res.status(404).json({ error: "Designation not found." });
      }

      await designation.destroy();

      res.status(200).json({
        message: "Designation deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting designation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
};

module.exports = DesignationController;
