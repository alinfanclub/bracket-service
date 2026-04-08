import { Injectable } from "@nestjs/common";

import { authProvider } from "@judo-bracket/config";
import type { AuthPrincipal } from "@judo-bracket/types";

import { principalFromHeaders } from "../../common/request-principal";

@Injectable()
export class AuthService {
  getProvider() {
    return authProvider;
  }

  resolvePrincipal(headers: Record<string, string | string[] | undefined>): AuthPrincipal | null {
    return principalFromHeaders(headers);
  }

  getDemoPrincipal(): AuthPrincipal {
    return {
      userId: "demo-admin",
      role: "ADMIN",
      organizationIds: ["org-seoul-dojo"],
      organizationRoles: {
        "org-seoul-dojo": "ADMIN"
      }
    };
  }
}
