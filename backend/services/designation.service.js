const ServiceError = require("../utils/serviceError");
const Designation = require("../models/designation");

function transformDesignation(designation) {
  return {
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
}

const designationService = {
  AddDesignation: async ({
    title,
    description,
    department,
    level,
    salaryMin,
    salaryMax,
  }) => {
    if (!title || !department || salaryMin == null || salaryMax == null) {
      throw new ServiceError(400, {
        error: "Title, department, and salary range are required.",
      });
    }

    const existing = await Designation.findOne({ where: { title } });
    if (existing) {
      throw new ServiceError(409, {
        error: "Designation title already exists.",
      });
    }

    const salaryRange = `$${parseFloat(
      salaryMin
    ).toLocaleString()} - $${parseFloat(salaryMax).toLocaleString()}`;

    const newDesignation = await Designation.create({
      title,
      description: description || null,
      department,
      level: level || "Mid-level",
      status: "active",
      employees: 0,
      salary_range: salaryRange,
      base_salary: parseFloat(salaryMin),
    });

    return {
      message: "Designation created successfully.",
      designation: newDesignation,
    };
  },

  GetDesignation: async () => {
    const designations = await Designation.findAll({
      order: [["created_at", "DESC"]],
    });

    return designations.map(transformDesignation);
  },

  UpdateDesignation: async (
    id,
    { title, description, department, level, salaryMin, salaryMax }
  ) => {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      throw new ServiceError(404, { error: "Designation not found." });
    }

    const updateData = {
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

    return {
      message: "Designation updated successfully.",
      designation: transformDesignation(designation),
    };
  },

  DeleteDesignation: async (id) => {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      throw new ServiceError(404, { error: "Designation not found." });
    }

    await designation.destroy();

    return {
      message: "Designation deleted successfully.",
    };
  },
};

module.exports = designationService;
