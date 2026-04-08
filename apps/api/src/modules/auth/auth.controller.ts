import { Controller, Get, Headers, Inject } from "@nestjs/common";

import { Public } from "./public.decorator";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Get("session")
  getSession(@Headers() headers: Record<string, string | string[] | undefined>) {
    return {
      provider: this.authService.getProvider(),
      principal: this.authService.resolvePrincipal(headers)
    };
  }
}
