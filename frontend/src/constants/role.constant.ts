const Roles = {
  ADMIN: "admin",
  HR_MANAGER: "manager",
  EMPLOYEE: "employee",
};

export type RoleType = (typeof Roles)[keyof typeof Roles];

export default Roles;
