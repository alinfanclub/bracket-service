import { Injectable } from "@nestjs/common";

import type { UserRole } from "@judo-bracket/types";

@Injectable()
export class UsersService {
  listRoles(): UserRole[] {
    return ["MASTER", "ADMIN", "MANAGER", "ATHLETE"];
  }
}
