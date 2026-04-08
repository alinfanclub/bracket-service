import { Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import type {
  AuthPrincipal,
  CreateDivisionInput,
  CreateTournamentEntryInput,
  CreateTournamentInput
} from "@judo-bracket/types";
import { canManageOrganization } from "@judo-bracket/utils";

import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { TournamentsService } from "./tournaments.service";

@Controller("tournaments")
export class TournamentsController {
  constructor(@Inject(TournamentsService) private readonly tournamentsService: TournamentsService) {}

  @Roles("ADMIN", "MANAGER", "ATHLETE")
  @Get()
  listTournaments(@CurrentPrincipal() principal: AuthPrincipal) {
    return this.tournamentsService.listVisibleTo(principal);
  }

  @Roles("ADMIN")
  @Post()
  createTournament(@Body() input: CreateTournamentInput, @CurrentPrincipal() principal: AuthPrincipal) {
    return this.tournamentsService.createTournament(input, principal.userId);
  }

  @Roles("ADMIN")
  @Post(":id/divisions")
  createDivision(@Param("id") tournamentId: string, @Body() input: CreateDivisionInput) {
    return this.tournamentsService.createDivision(tournamentId, input);
  }

  @Roles("ADMIN", "MANAGER")
  @Post(":id/entries")
  createEntry(
    @Param("id") tournamentId: string,
    @Body() input: CreateTournamentEntryInput,
    @CurrentPrincipal() principal: AuthPrincipal
  ) {
    if (!canManageOrganization(principal, input.organizationId)) {
      throw new ForbiddenException("You cannot register entries for this organization.");
    }

    return this.tournamentsService.createEntry(tournamentId, input);
  }

  @Public()
  @Get("public/by-code/:code")
  async getPublicTournamentByCode(@Param("code") code: string) {
    const tournament = await this.tournamentsService.getByCode(code);
    if (!tournament) {
      throw new NotFoundException("Tournament not found.");
    }

    return this.tournamentsService.getPublicView(tournament.id);
  }
}
