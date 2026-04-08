import { Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import type { AuthPrincipal, CreateOrganizationInput } from "@judo-bracket/types";
import { canManageOrganization } from "@judo-bracket/utils";

import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { Roles } from "../auth/roles.decorator";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(@Inject(OrganizationsService) private readonly organizationsService: OrganizationsService) {}

  @Roles("ADMIN", "MANAGER")
  @Get()
  async listOrganizations(@CurrentPrincipal() principal: AuthPrincipal) {
    if (principal.role === "ADMIN") {
      return this.organizationsService.listAll();
    }

    return this.organizationsService.listByIds(principal.organizationIds);
  }

  @Roles("ADMIN")
  @Post()
  createOrganization(@Body() input: CreateOrganizationInput) {
    return this.organizationsService.create(input);
  }

  @Roles("ADMIN", "MANAGER")
  @Get(":id")
  async getOrganization(@Param("id") organizationId: string, @CurrentPrincipal() principal: AuthPrincipal) {
    if (!canManageOrganization(principal, organizationId)) {
      throw new ForbiddenException("You cannot access this organization.");
    }

    const organization = await this.organizationsService.getById(organizationId);
    if (!organization) {
      throw new NotFoundException("Organization not found.");
    }

    return organization;
  }
}
