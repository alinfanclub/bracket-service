import type { AuthPrincipal, UserRole } from "@judo-bracket/types";

export const canManageOrganization = (principal: AuthPrincipal, organizationId: string): boolean => {
  if (principal.role === "ADMIN") {
    return true;
  }

  const membershipRole = principal.organizationRoles[organizationId];
  return membershipRole === "ADMIN" || membershipRole === "MANAGER";
};

export const hasRole = (principal: AuthPrincipal, ...roles: UserRole[]): boolean => {
  return roles.includes(principal.role);
};

export const canReadAthleteProfile = (principal: AuthPrincipal, athleteUserId: string): boolean => {
  return principal.role === "ADMIN" || principal.userId === athleteUserId;
};
