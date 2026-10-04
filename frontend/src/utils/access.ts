import Roles, { RoleType } from "@/constants/role.constant";

export const hasAccess = (role: RoleType, allowedRoles: RoleType[]) =>
  role === Roles.SUPER_ADMIN || allowedRoles.includes(role);
