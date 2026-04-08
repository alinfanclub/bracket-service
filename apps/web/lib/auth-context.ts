import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import type { UserRole } from "@judo-bracket/types";

import { getCurrentAthleteId } from "./api";

export async function resolveCurrentAthleteId(): Promise<string | null> {
  const { userId } = await auth();

  if (userId) {
    return getCurrentAthleteId();
  }

  return null;
}

export async function getCurrentUser() {
  return await currentUser();
}

export async function getClerkAuthContext() {
  const { userId, orgId, orgRole } = await auth();

  return {
    userId,
    orgId,
    orgRole
  };
}

export async function getUserRole(): Promise<UserRole> {
  const role = await getCurrentUserRole();
  return role || "ATHLETE";
}

export async function isAdmin(): Promise<boolean> {
  return checkRole("ADMIN");
}

export async function isManager(): Promise<boolean> {
  return checkRole("MANAGER");
}

export async function isAthlete(): Promise<boolean> {
  return checkRole("ATHLETE");
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error("[getCurrentUserRole] CLERK_SECRET_KEY not found");
      return "ATHLETE";
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("[getCurrentUserRole] Clerk API error:", response.status);
      return "ATHLETE";
    }

    const user = await response.json();
    const role = user.public_metadata?.role;

    if (role === "MASTER" || role === "ADMIN" || role === "MANAGER" || role === "ATHLETE") {
      return role as UserRole;
    }

    return "ATHLETE";
  } catch (error) {
    console.error("[getCurrentUserRole] Error:", error);
    return "ATHLETE";
  }
}

export async function checkRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();

  if (!userRole) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    MASTER: 4,
    ADMIN: 3,
    MANAGER: 2,
    ATHLETE: 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export async function isMaster(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "MASTER";
}

export async function requireRole(role: UserRole): Promise<void> {
  const hasRole = await checkRole(role);
  if (!hasRole) {
    redirect("/");
  }
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}
