const ServiceError = require("../utils/serviceError");
const { User, Team } = require("../models/index.modal");

const departmentService = {
  AddDepartment: async ({ name, description, manager_id }) => {
    if (!name) {
      throw new ServiceError(400, { error: "Department name is required" });
    }

    if (manager_id) {
      const manager = await User.findByPk(manager_id);

      if (!manager) {
        throw new ServiceError(404, { error: "Manager user not found" });
      }

      if (manager.role !== "manager") {
        throw new ServiceError(400, {
          error: "User is not assigned the 'manager' role",
        });
      }
    }

    const newDept = await Team.create({
      name,
      description,
      manager_id,
    });

    return { message: "Department created", department: newDept };
  },

  GetAllDepartments: async () => {
    const departments = await Team.findAll({
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
    });

    return { departments };
  },
};

module.exports = departmentService;
