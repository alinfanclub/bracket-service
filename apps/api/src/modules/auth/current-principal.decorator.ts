import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthPrincipal } from "@judo-bracket/types";

export interface RequestWithPrincipal {
  principal?: AuthPrincipal;
}

export const CurrentPrincipal = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
  return request.principal;
});
