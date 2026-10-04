const Roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  HR_MANAGER: "manager",
  EMPLOYEE: "employee",
};

export type RoleType = (typeof Roles)[keyof typeof Roles];

export default Roles;
