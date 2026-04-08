import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import type { MatchResultSubmission } from "@judo-bracket/types";

import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { MatchesService } from "./matches.service";

@Controller("matches")
export class MatchesController {
  constructor(@Inject(MatchesService) private readonly matchesService: MatchesService) {}

  @Roles("ADMIN")
  @Post(":matchId/result")
  submitResult(@Param("matchId") matchId: string, @Body() payload: Omit<MatchResultSubmission, "matchId">) {
    return this.matchesService.submitResult({ ...payload, matchId });
  }

  @Public()
  @Get(":matchId")
  async getMatch(@Param("matchId") matchId: string) {
    const match = await this.matchesService.getMatch(matchId);
    if (!match) {
      throw new NotFoundException("Match not found.");
    }

    return match;
  }
}
