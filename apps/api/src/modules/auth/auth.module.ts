import { Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./roles.guard";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      inject: [Reflector, AuthService],
      useFactory: (reflector: Reflector, authService: AuthService) => new RolesGuard(reflector, authService)
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
