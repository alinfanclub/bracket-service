import { Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Post } from "@nestjs/common";

import type { AuthPrincipal, CreateAthleteInput, UpdateAthleteInput } from "@judo-bracket/types";
import { canManageOrganization } from "@judo-bracket/utils";

import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { Roles } from "../auth/roles.decorator";
import { AthletesService } from "./athletes.service";

@Controller("athletes")
export class AthletesController {
  constructor(@Inject(AthletesService) private readonly athletesService: AthletesService) {}

  @Roles("ADMIN", "MANAGER", "ATHLETE")
  @Get()
  async listAthletes(@CurrentPrincipal() principal: AuthPrincipal) {
    if (principal.role === "ATHLETE" && !principal.athleteId) {
      throw new ForbiddenException("Athlete scope is missing athlete profile linkage.");
    }

    if (principal.role === "ATHLETE" && principal.athleteId) {
      const athlete = await this.athletesService.getById(principal.athleteId);
      return athlete ? [athlete] : [];
    }

    if (principal.role === "ADMIN") {
      return this.athletesService.listAll();
    }

    return this.athletesService.listByOrganizationIds(principal.organizationIds);
  }

  @Roles("ADMIN", "MANAGER", "ATHLETE")
  @Get(":id")
  async getAthlete(@Param("id") athleteId: string, @CurrentPrincipal() principal: AuthPrincipal) {
    const athlete = await this.athletesService.getById(athleteId);
    if (!athlete) {
      throw new NotFoundException("Athlete not found.");
    }

    if (principal.role === "ATHLETE") {
      if (principal.athleteId !== athleteId) {
        throw new ForbiddenException("Athletes can only access their own profile.");
      }

      return athlete;
    }

    if (!canManageOrganization(principal, athlete.organizationId)) {
      throw new ForbiddenException("You cannot access this athlete.");
    }

    return athlete;
  }

  @Roles("ADMIN", "MANAGER", "ATHLETE")
  @Get(":id/history")
  async getAthleteHistory(@Param("id") athleteId: string, @CurrentPrincipal() principal: AuthPrincipal) {
    const athlete = await this.athletesService.getById(athleteId);
    if (!athlete) {
      throw new NotFoundException("Athlete not found.");
    }

    if (principal.role === "ATHLETE" && principal.athleteId !== athleteId) {
      throw new ForbiddenException("Athletes can only access their own match history.");
    }

    if (principal.role !== "ATHLETE" && !canManageOrganization(principal, athlete.organizationId)) {
      throw new ForbiddenException("You cannot access this athlete history.");
    }

    const history = await this.athletesService.getMatchHistory(athleteId);
    if (!history) {
      throw new NotFoundException("Athlete history not found.");
    }

    return history;
  }

  @Roles("ADMIN", "MANAGER")
  @Post()
  createAthlete(@Body() input: CreateAthleteInput, @CurrentPrincipal() principal: AuthPrincipal) {
    if (!canManageOrganization(principal, input.organizationId)) {
      throw new ForbiddenException("You cannot create athletes for this organization.");
    }

    return this.athletesService.create(input);
  }

  @Roles("ADMIN", "MANAGER")
  @Patch(":id")
  async updateAthlete(
    @Param("id") athleteId: string,
    @Body() input: UpdateAthleteInput,
    @CurrentPrincipal() principal: AuthPrincipal
  ) {
    const athlete = await this.athletesService.getById(athleteId);
    if (!athlete) {
      throw new NotFoundException("Athlete not found.");
    }

    if (!canManageOrganization(principal, athlete.organizationId)) {
      throw new ForbiddenException("You cannot update this athlete.");
    }

    return this.athletesService.update(athleteId, input);
  }

  @Roles("ADMIN", "MANAGER")
  @Delete(":id")
  async deleteAthlete(@Param("id") athleteId: string, @CurrentPrincipal() principal: AuthPrincipal) {
    const athlete = await this.athletesService.getById(athleteId);
    if (!athlete) {
      throw new NotFoundException("Athlete not found.");
    }

    if (!canManageOrganization(principal, athlete.organizationId)) {
      throw new ForbiddenException("You cannot delete this athlete.");
    }

    return this.athletesService.remove(athleteId);
  }
}
