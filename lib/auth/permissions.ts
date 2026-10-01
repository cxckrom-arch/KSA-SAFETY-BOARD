import type { Permission } from "@/lib/route-registry";

export const roles = [
  "platform_owner",
  "org_admin",
  "safety_manager",
  "safety_officer",
  "supervisor",
  "employee",
  "viewer",
] as const;

export type Role = (typeof roles)[number];

const rolePermissions: Record<Role, readonly Permission[]> = {
  platform_owner: ["dashboard.view", "notifications.read", "settings.read", "reports.print"],
  org_admin: ["dashboard.view", "notifications.read", "settings.read", "reports.print"],
  safety_manager: ["dashboard.view", "notifications.read", "reports.print"],
  safety_officer: ["dashboard.view", "notifications.read", "reports.print"],
  supervisor: ["dashboard.view", "notifications.read"],
  employee: ["dashboard.view", "notifications.read"],
  viewer: ["dashboard.view", "reports.print"],
};

export function roleCan(role: Role | null | undefined, permission: Permission) {
  return role ? rolePermissions[role].includes(permission) : permission === "public";
}

export function isRole(value: string | null | undefined): value is Role {
  return Boolean(value && roles.includes(value as Role));
}
