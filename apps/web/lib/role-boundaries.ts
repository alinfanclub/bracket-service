import { authProvider, roleHomeRoute, routeBoundaries } from "@judo-bracket/config";
import type { UserRole } from "@judo-bracket/types";

export interface RoleBoundarySummary {
  role: UserRole;
  homeRoute: string;
  apiHeaders: string[];
}

export const roleBoundariesSummary: RoleBoundarySummary[] = [
  {
    role: "ADMIN",
    homeRoute: roleHomeRoute.ADMIN,
    apiHeaders: ["x-demo-user-id", "x-demo-role=ADMIN"]
  },
  {
    role: "MANAGER",
    homeRoute: roleHomeRoute.MANAGER,
    apiHeaders: ["x-demo-user-id", "x-demo-role=MANAGER", "x-demo-org-ids", "x-demo-org-roles"]
  },
  {
    role: "ATHLETE",
    homeRoute: roleHomeRoute.ATHLETE,
    apiHeaders: ["x-demo-user-id", "x-demo-role=ATHLETE", "x-demo-athlete-id"]
  }
];

export const webBoundarySummary = {
  authProvider,
  publicRoute: routeBoundaries.public
};
