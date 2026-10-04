import { RoleType } from "@/constants/role.constant";

export const hasAccess = (role: RoleType, allowedRoles: RoleType[]) =>
  allowedRoles.includes(role);
