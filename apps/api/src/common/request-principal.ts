import type { IncomingHttpHeaders } from "node:http";

import type { AuthPrincipal, UserRole } from "@judo-bracket/types";

const parseRole = (value: string | undefined): UserRole | undefined => {
  if (value === "MASTER" || value === "ADMIN" || value === "MANAGER" || value === "ATHLETE") {
    return value;
  }

  return undefined;
};

export const principalFromHeaders = (headers: IncomingHttpHeaders): AuthPrincipal | null => {
  const role = parseRole(typeof headers["x-demo-role"] === "string" ? headers["x-demo-role"] : undefined);
  const userId = typeof headers["x-demo-user-id"] === "string" ? headers["x-demo-user-id"] : undefined;

  if (!role || !userId) {
    return null;
  }

  const organizationIdsHeader = typeof headers["x-demo-org-ids"] === "string" ? headers["x-demo-org-ids"] : "";
  const organizationRolesHeader = typeof headers["x-demo-org-roles"] === "string" ? headers["x-demo-org-roles"] : "";
  const athleteId = typeof headers["x-demo-athlete-id"] === "string" ? headers["x-demo-athlete-id"] : undefined;

  const organizationIds = organizationIdsHeader
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const organizationRoles = organizationRolesHeader
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .reduce<Partial<Record<string, UserRole>>>((accumulator, entry) => {
      const [organizationId, roleValue] = entry.split(":");
      const parsedRole = parseRole(roleValue);
      if (organizationId && parsedRole) {
        accumulator[organizationId] = parsedRole;
      }

      return accumulator;
    }, {});

  const organizationRoleIds = Object.keys(organizationRoles);
  const hasMismatchedOrganizationScope = organizationRoleIds.some((organizationId) => !organizationIds.includes(organizationId));

  if (hasMismatchedOrganizationScope) {
    return null;
  }

  if (role === "ATHLETE" && !athleteId) {
    return null;
  }

  if (role === "MANAGER" && organizationIds.length === 0) {
    return null;
  }

  return {
    userId,
    role,
    organizationIds,
    organizationRoles,
    athleteId
  };
};
