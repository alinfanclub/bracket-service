import { describe, expect, it } from "vitest";

import { principalFromHeaders } from "./request-principal";

describe("principalFromHeaders", () => {
  it("rejects athlete principals without athlete ids", () => {
    const principal = principalFromHeaders({
      "x-demo-user-id": "athlete-user",
      "x-demo-role": "ATHLETE"
    });

    expect(principal).toBeNull();
  });

  it("rejects mismatched organization role mappings", () => {
    const principal = principalFromHeaders({
      "x-demo-user-id": "manager-user",
      "x-demo-role": "MANAGER",
      "x-demo-org-ids": "org-seoul-dojo",
      "x-demo-org-roles": "org-other:MANAGER"
    });

    expect(principal).toBeNull();
  });

  it("builds a valid manager principal when ids and roles agree", () => {
    const principal = principalFromHeaders({
      "x-demo-user-id": "manager-user",
      "x-demo-role": "MANAGER",
      "x-demo-org-ids": "org-seoul-dojo",
      "x-demo-org-roles": "org-seoul-dojo:MANAGER"
    });

    expect(principal?.organizationRoles["org-seoul-dojo"]).toBe("MANAGER");
  });
});
