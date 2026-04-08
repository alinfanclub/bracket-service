import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { CreateShareLinkInput, PublicTournamentView, ShareLinkRecord } from "@judo-bracket/types";

import { Prisma } from "../../generated/prisma/client";
import type { ShareLink } from "../../generated/prisma/client";
import { PrismaService } from "../../common/prisma.service";
import { mapTournamentRecord, mapDivisionRecord, mapTournamentEntryRecordWithDisplay, mapBracketRecord } from "../../common/mappers";

const randomSlug = () => Math.random().toString(36).slice(2, 10);

@Injectable()
export class ShareLinksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private isKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  private mapShareLinkRecord(shareLink: ShareLink): ShareLinkRecord {
    return {
      id: shareLink.id,
      tournamentId: shareLink.tournamentId,
      slug: shareLink.slug,
      isActive: shareLink.isActive,
      expiresAt: shareLink.expiresAt?.toISOString(),
      createdAt: shareLink.createdAt.toISOString()
    };
  }

  async createShareLink(input: CreateShareLinkInput): Promise<ShareLinkRecord> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: input.tournamentId }
    });
    if (!tournament) {
      throw new NotFoundException("Tournament not found.");
    }

    const slug = randomSlug();
    let shareLink: ShareLink;

    try {
      shareLink = await this.prisma.shareLink.create({
        data: {
          tournamentId: input.tournamentId,
          slug,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
          isActive: true
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error) && error.code === "P2002") {
        throw new ConflictException("Share link slug already exists. Please try again.");
      }
      throw error;
    }

    return this.mapShareLinkRecord(shareLink);
  }

  async getBySlug(slug: string): Promise<ShareLinkRecord | undefined> {
    const shareLink = await this.prisma.shareLink.findUnique({
      where: { slug }
    });

    if (!shareLink) {
      return undefined;
    }

    return this.mapShareLinkRecord(shareLink);
  }

  async isLinkValid(shareLink: ShareLinkRecord): Promise<boolean> {
    if (!shareLink.isActive) {
      return false;
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  async getPublicViewBySlug(slug: string): Promise<PublicTournamentView | undefined> {
    const shareLink = await this.prisma.shareLink.findUnique({
      where: { slug },
      include: {
        tournament: {
          include: {
            divisions: {
              orderBy: { sortOrder: "asc" }
            },
            entries: {
              include: {
                athlete: { include: { organization: true } },
                organization: true
              }
            },
            brackets: {
              include: {
                matches: {
                  include: {
                    homeAthlete: { include: { organization: true } },
                    awayAthlete: { include: { organization: true } },
                    winnerAthlete: { include: { organization: true } }
                  },
                  orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }]
                }
              }
            }
          }
        }
      }
    });

    if (!shareLink) {
      return undefined;
    }

    if (!shareLink.isActive) {
      return undefined;
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return undefined;
    }

    const tournament = shareLink.tournament;

    return {
      tournament: mapTournamentRecord(tournament),
      divisions: tournament.divisions.map(mapDivisionRecord),
      entries: tournament.entries.map(mapTournamentEntryRecordWithDisplay),
      brackets: tournament.brackets.map((bracket) => mapBracketRecord(bracket, bracket.matches))
    };
  }

  async deactivateShareLink(id: string): Promise<ShareLinkRecord | undefined> {
    const existing = await this.prisma.shareLink.findUnique({
      where: { id }
    });

    if (!existing) {
      return undefined;
    }

    const shareLink = await this.prisma.shareLink.update({
      where: { id },
      data: { isActive: false }
    });

    return this.mapShareLinkRecord(shareLink);
  }

  async listByTournament(tournamentId: string): Promise<ShareLinkRecord[]> {
    const shareLinks = await this.prisma.shareLink.findMany({
      where: { tournamentId },
      orderBy: { createdAt: "desc" }
    });

    return shareLinks.map((link) => this.mapShareLinkRecord(link));
  }
}
