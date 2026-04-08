import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import type { CreateShareLinkInput } from "@judo-bracket/types";

import { Public } from "../auth/public.decorator";
import { Roles } from "../auth/roles.decorator";
import { ShareLinksService } from "./share-links.service";

@Controller("share-links")
export class ShareLinksController {
  constructor(@Inject(ShareLinksService) private readonly shareLinksService: ShareLinksService) {}

  @Roles("ADMIN")
  @Post()
  createShareLink(@Body() input: CreateShareLinkInput) {
    return this.shareLinksService.createShareLink(input);
  }

  @Roles("ADMIN", "MANAGER")
  @Get("tournaments/:tournamentId")
  listByTournament(@Param("tournamentId") tournamentId: string) {
    return this.shareLinksService.listByTournament(tournamentId);
  }

  @Roles("ADMIN", "MANAGER")
  @Delete(":id")
  async deactivateShareLink(@Param("id") id: string) {
    const result = await this.shareLinksService.deactivateShareLink(id);
    if (!result) {
      throw new NotFoundException("Share link not found.");
    }

    return result;
  }

  @Public()
  @Get("public/by-slug/:slug")
  async getPublicViewBySlug(@Param("slug") slug: string) {
    const view = await this.shareLinksService.getPublicViewBySlug(slug);
    if (!view) {
      throw new NotFoundException("Share link not found or expired.");
    }

    return view;
  }

  @Public()
  @Get(":slug/validate")
  async validateLink(@Param("slug") slug: string) {
    const link = await this.shareLinksService.getBySlug(slug);
    if (!link) {
      return { valid: false, reason: "not_found" };
    }

    const isValid = await this.shareLinksService.isLinkValid(link);
    if (!isValid) {
      return { valid: false, reason: link.isActive ? "expired" : "inactive" };
    }

    return { valid: true };
  }
}
