const Designation = require("./designation");
const Team = require("./department");
const User = require("./user");
const Tasks = require("./task");

User.hasMany(Tasks, { foreignKey: "assigned_to", as: "assignedTasks" });
Tasks.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

User.hasMany(Tasks, { foreignKey: "created_by", as: "createdTasks" });
Tasks.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// constraints: false avoids create-order deadlock (teams ↔ users mutual FKs)
Team.belongsTo(User, {
  foreignKey: "manager_id",
  as: "manager",
  constraints: false,
});
User.hasMany(Team, {
  foreignKey: "manager_id",
  as: "departments",
  constraints: false,
});

User.belongsTo(Team, {
  foreignKey: { name: "department_id", allowNull: true },
  as: "department",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Team.hasMany(User, {
  foreignKey: { name: "department_id", allowNull: true },
  as: "employees",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

User.belongsTo(Designation, {
  foreignKey: { name: "designation_id", allowNull: true },
  as: "designation",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Designation.hasMany(User, {
  foreignKey: { name: "designation_id", allowNull: true },
  as: "employee",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = {
  User,
  Tasks,
  Team,
  Designation,
};
