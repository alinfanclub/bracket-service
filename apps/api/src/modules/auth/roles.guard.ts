import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { UserRole } from "@judo-bracket/types";

import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { ROLES_KEY } from "./roles.decorator";
import type { RequestWithPrincipal } from "./current-principal.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal & { headers: Record<string, string | string[] | undefined> }>();
    const principal = this.authService.resolvePrincipal(request.headers);

    if (!principal) {
      throw new UnauthorizedException("Missing auth principal headers.");
    }

    request.principal = principal;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) ?? [];
    if (requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(principal.role)) {
      throw new ForbiddenException("Insufficient role for this route.");
    }

    return true;
  }
}
