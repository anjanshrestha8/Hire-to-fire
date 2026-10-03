const { User, Team } = require("../models/index.modal");

const DepartmentController = {
  AddDepartment: async (req, res) => {
    try {
      const { name, description, manager_id } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Department name is required" });
      }

      if (manager_id) {
        const manager = await User.findByPk(manager_id);

        if (!manager) {
          return res.status(404).json({ error: "Manager user not found" });
        }

        if (manager.role !== "manager") {
          return res
            .status(400)
            .json({ error: "User is not assigned the 'manager' role" });
        }
      }

      const newDept = await Team.create({
        name,
        description,
        manager_id,
      });

      res
        .status(201)
        .json({ message: "Department created", department: newDept });
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  GetAllDepartments: async (req, res) => {
    try {
      const departments = await Team.findAll({
        include: [
          {
            model: User,
            as: "manager",
            attributes: ["id", "first_name", "last_name", "email", "role"],
          },
        ],
      });


      res.status(200).json({ departments });
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = DepartmentController;
