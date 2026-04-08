import { describe, expect, it, vi } from "vitest";

import type { AuthPrincipal } from "@judo-bracket/types";

import { OrganizationsController } from "./organizations.controller";

const managerPrincipal: AuthPrincipal = {
  userId: "manager-user",
  role: "MANAGER",
  organizationIds: ["org-seoul-dojo"],
  organizationRoles: {
    "org-seoul-dojo": "MANAGER"
  }
};

describe("OrganizationsController", () => {
  it("throws not found when the manager can access the org id but it does not exist", async () => {
    const controller = new OrganizationsController({
      getById: vi.fn().mockResolvedValue(undefined)
    } as never);

    await expect(controller.getOrganization("org-seoul-dojo", managerPrincipal)).rejects.toThrow("Organization not found.");
  });

  it("throws forbidden when the manager requests a different organization", async () => {
    const controller = new OrganizationsController({
      getById: vi.fn()
    } as never);

    await expect(controller.getOrganization("org-han-river-club", managerPrincipal)).rejects.toThrow(
      "You cannot access this organization."
    );
  });
});
