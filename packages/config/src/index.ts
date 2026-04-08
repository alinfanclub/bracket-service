import type { UserRole } from "@judo-bracket/types";

export const appName = "유도 대진표";
export const authProvider = "clerk" as const;

export const roleHomeRoute: Record<UserRole, string> = {
  MASTER: "/master",
  ADMIN: "/admin",
  MANAGER: "/manager",
  ATHLETE: "/athlete"
};

export const routeBoundaries = {
  admin: "/admin",
  manager: "/manager",
  athlete: "/athlete",
  public: "/public"
} as const;

export const defaultTournamentCodeLength = 6;
export const defaultShareLinkLength = 18;
