const User = require("./user");
const Tasks = require("./task");
const Team = require("./department");
const Designation = require("./designation");

User.hasMany(Tasks, { foreignKey: "assigned_to", as: "assignedTasks" });
Tasks.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

User.hasMany(Tasks, { foreignKey: "created_by", as: "createdTasks" });
Tasks.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Team.belongsTo(User, { foreignKey: "manager_id", as: "manager" });
User.hasMany(Team, { foreignKey: "manager_id", as: "departments" });

User.belongsTo(Team, { foreignKey: "department_id", as: "department" });
Team.hasMany(User, { foreignKey: "department_id", as: "employees" });

User.belongsTo(Designation, {
  foreignKey: "designation_id",
  as: "designation",
});
Designation.hasMany(User, { foreignKey: "designation_id", as: "employee" });

module.exports = {
  User,
  Tasks,
  Team,
  Designation,
};
