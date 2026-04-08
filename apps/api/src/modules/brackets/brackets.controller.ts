import { Controller, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import { Roles } from "../auth/roles.decorator";
import { BracketsService } from "./brackets.service";

@Controller("brackets")
export class BracketsController {
  constructor(@Inject(BracketsService) private readonly bracketsService: BracketsService) {}

  @Roles("ADMIN")
  @Post("divisions/:divisionId/generate")
  generateDivisionBracket(@Param("divisionId") divisionId: string) {
    return this.bracketsService.generateDivisionBracket(divisionId);
  }

  @Roles("ADMIN", "MANAGER", "ATHLETE")
  @Get("divisions/:divisionId")
  async getDivisionBracket(@Param("divisionId") divisionId: string) {
    const bracket = await this.bracketsService.getDivisionBracket(divisionId);
    if (!bracket) {
      throw new NotFoundException("Bracket not found for this division.");
    }

    return bracket;
  }
}
