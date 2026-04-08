import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { defaultTournamentCodeLength } from "@judo-bracket/config";
import type {
  AuthPrincipal,
  BracketRecord,
  CreateDivisionInput,
  CreateTournamentEntryInput,
  CreateTournamentInput,
  DivisionRecord,
  PublicTournamentView,
  TournamentEntryRecord,
  TournamentRecord
} from "@judo-bracket/types";

import { Prisma } from "../../generated/prisma/client";
import type { Division, Tournament, TournamentEntry } from "../../generated/prisma/client";
import { mapBracketRecord, mapDivisionRecord, mapTournamentEntryRecord, mapTournamentEntryRecordWithDisplay, mapTournamentRecord } from "../../common/mappers";
import { PrismaService } from "../../common/prisma.service";

const randomSuffix = () => Math.random().toString(36).slice(2, 8).toUpperCase();

@Injectable()
export class TournamentsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private isKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  async listVisibleTo(principal: AuthPrincipal): Promise<TournamentRecord[]> {
    if (principal.role === "ATHLETE") {
      if (!principal.athleteId) {
        throw new ForbiddenException("Athlete scope is missing athlete profile linkage.");
      }

      const athleteEntries = await this.prisma.tournamentEntry.findMany({
        where: { athleteId: principal.athleteId },
        select: { tournamentId: true }
      });
      const tournamentIds = athleteEntries.map((entry: Pick<TournamentEntry, "tournamentId">) => entry.tournamentId);
      const tournaments = await this.prisma.tournament.findMany({
        where: { id: { in: tournamentIds } },
        orderBy: { startsAt: "desc" }
      });
      return tournaments.map((tournament: Tournament) => mapTournamentRecord(tournament));
    }

    const tournaments = await this.prisma.tournament.findMany({
      orderBy: { startsAt: "desc" }
    });
    return tournaments.map((tournament: Tournament) => mapTournamentRecord(tournament));
  }

  async createTournament(input: CreateTournamentInput, createdById: string): Promise<TournamentRecord> {
    const code = await this.createAccessCode(input.name);
    let tournament: Tournament;

    try {
      tournament = await this.prisma.tournament.create({
        data: {
          createdById,
          name: input.name,
          code,
          venue: input.venue,
          startsAt: new Date(input.startsAt),
          endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
          status: "DRAFT"
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error)) {
        if (error.code === "P2002") {
          throw new ConflictException("Tournament code already exists.");
        }

        if (error.code === "P2003") {
          throw new NotFoundException("Tournament creator does not exist.");
        }
      }

      throw error;
    }

    return mapTournamentRecord(tournament);
  }

  async createDivision(tournamentId: string, input: CreateDivisionInput): Promise<DivisionRecord> {
    const tournament = await this.prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      throw new NotFoundException("Tournament not found.");
    }

    const existingDivisionCount = await this.prisma.division.count({
      where: { tournamentId }
    });

    let division: Division;

    try {
      division = await this.prisma.division.create({
        data: {
          tournamentId,
          name: input.name,
          gender: input.gender,
          ageGroup: input.ageGroup,
          weightClass: input.weightClass,
          sortOrder: input.sortOrder ?? existingDivisionCount + 1
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error) && error.code === "P2003") {
        throw new NotFoundException("Tournament not found.");
      }

      throw error;
    }

    return mapDivisionRecord(division);
  }

  async createEntry(tournamentId: string, input: CreateTournamentEntryInput): Promise<TournamentEntryRecord> {
    const tournament = await this.prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      throw new NotFoundException("Tournament not found.");
    }

    const division = await this.prisma.division.findUnique({ where: { id: input.divisionId } });
    if (!division || division.tournamentId !== tournament.id) {
      throw new NotFoundException("Division not found for this tournament.");
    }

    const athlete = await this.prisma.athlete.findUnique({ where: { id: input.athleteId } });
    if (!athlete) {
      throw new NotFoundException("Athlete not found.");
    }

    const organization = await this.prisma.organization.findUnique({ where: { id: input.organizationId } });
    if (!organization) {
      throw new NotFoundException("Organization not found.");
    }

    if (athlete.organizationId !== input.organizationId) {
      throw new ConflictException("Athlete does not belong to the provided organization.");
    }

    const existingEntry = await this.prisma.tournamentEntry.findFirst({
      where: {
        divisionId: input.divisionId,
        athleteId: input.athleteId
      }
    });
    if (existingEntry) {
      throw new ConflictException("Athlete is already entered in this division.");
    }

    let entry: TournamentEntry;

    try {
      entry = await this.prisma.tournamentEntry.create({
        data: {
          tournamentId,
          divisionId: input.divisionId,
          athleteId: input.athleteId,
          organizationId: input.organizationId,
          status: "PENDING",
          seed: input.seed,
          notes: input.notes
        }
      });
    } catch (error) {
      if (this.isKnownRequestError(error)) {
        if (error.code === "P2002") {
          throw new ConflictException("Athlete is already entered in this division.");
        }

        if (error.code === "P2003") {
          throw new NotFoundException("Referenced tournament resources do not exist.");
        }
      }

      throw error;
    }

    return mapTournamentEntryRecord(entry);
  }

  async getByCode(code: string): Promise<TournamentRecord | undefined> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { code: code.toUpperCase() }
    });
    if (!tournament) {
      return undefined;
    }

    return mapTournamentRecord(tournament);
  }

  async getPublicView(tournamentId: string): Promise<PublicTournamentView> {
    const [tournament, divisions, displayEntries, brackets] = await Promise.all([
      this.prisma.tournament.findUnique({ where: { id: tournamentId } }),
      this.prisma.division.findMany({ where: { tournamentId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.tournamentEntry.findMany({
        where: { tournamentId },
        orderBy: { createdAt: "asc" },
        include: {
          athlete: { include: { organization: true } },
          organization: true
        }
      }),
      this.prisma.bracket.findMany({
        where: { tournamentId },
        include: {
          matches: {
            include: {
              homeAthlete: { include: { organization: true } },
              awayAthlete: { include: { organization: true } },
              winnerAthlete: { include: { organization: true } }
            },
            orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }]
          }
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return {
      tournament: tournament ? mapTournamentRecord(tournament) : undefined,
      divisions: divisions.map((division: Division) => mapDivisionRecord(division)),
      entries: displayEntries.map(mapTournamentEntryRecordWithDisplay),
      brackets: brackets.map((bracket): BracketRecord => mapBracketRecord(bracket, bracket.matches))
    };
  }

  async createAccessCode(name: string): Promise<string> {
    const base = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    let code = `${base.slice(0, 3)}${randomSuffix()}`.slice(0, defaultTournamentCodeLength);

    while (await this.prisma.tournament.findUnique({ where: { code } })) {
      code = `${base.slice(0, 3)}${randomSuffix()}`.slice(0, defaultTournamentCodeLength);
    }

    return code;
  }
}
