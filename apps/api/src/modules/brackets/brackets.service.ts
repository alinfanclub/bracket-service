import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { AthleteSeed, BracketRecord } from "@judo-bracket/types";
import { generateSingleEliminationBracket } from "@judo-bracket/utils";

import type { Match } from "../../generated/prisma/client";
import { mapBracketRecord } from "../../common/mappers";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class BracketsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private seedFromEntry(entry: {
    id: string;
    seed: number | null;
    athlete: { id: string; firstName: string; lastName: string; organization: { id: string; name: string } };
  }): AthleteSeed {
    return {
      entryId: entry.id,
      athleteId: entry.athlete.id,
      athleteName: `${entry.athlete.firstName} ${entry.athlete.lastName}`,
      organizationId: entry.athlete.organization.id,
      organizationName: entry.athlete.organization.name,
      seed: entry.seed ?? undefined
    };
  }

  async generateDivisionBracket(divisionId: string): Promise<BracketRecord> {
    const generatedAt = new Date();

    const persistedBracket = await this.prisma.$transaction(async (tx) => {
      const division = await tx.division.findUnique({
        where: { id: divisionId },
        include: {
          entries: {
            where: {
              status: { not: "WITHDRAWN" }
            },
            include: {
              athlete: {
                include: {
                  organization: true
                }
              }
            },
            orderBy: [{ seed: "asc" }, { createdAt: "asc" }]
          },
          bracket: {
            include: {
              matches: true
            }
          }
        }
      });

      if (!division) {
        throw new NotFoundException("Division not found.");
      }

      const activeEntries = division.entries;
      if (activeEntries.length === 0) {
        throw new ConflictException("Division has no entrants to generate a bracket.");
      }

      if (division.bracket && division.bracket.matches.some((match) => match.status === "IN_PROGRESS" || match.status === "COMPLETED")) {
        throw new ConflictException("Cannot regenerate a bracket that already has live or completed matches.");
      }

      const generatedBracket = generateSingleEliminationBracket(activeEntries.map((entry) => this.seedFromEntry(entry)));

      const bracket = division.bracket
        ? await tx.bracket.update({
            where: { id: division.bracket.id },
            data: {
              status: generatedBracket.matches.every((match) => match.status === "BYE") ? "COMPLETED" : "READY",
              bracketSize: generatedBracket.size,
              generatedAt,
              matches: {
                deleteMany: {}
              }
            }
          })
        : await tx.bracket.create({
            data: {
              tournamentId: division.tournamentId,
              divisionId: division.id,
              status: generatedBracket.matches.every((match) => match.status === "BYE") ? "COMPLETED" : "READY",
              bracketSize: generatedBracket.size,
              generatedAt
            }
          });

      const createdMatchByKey = new Map<string, Match>();

      for (const match of generatedBracket.matches) {
        const createdMatch = await tx.match.create({
          data: {
            bracketId: bracket.id,
            roundNumber: match.roundNumber,
            matchNumber: match.matchNumber,
            status: match.status,
            completedAt: match.status === "BYE" && match.winnerEntryId ? generatedAt : undefined,
            homeAthleteId: match.home.athleteId,
            awayAthleteId: match.away.athleteId,
            winnerAthleteId:
              match.winnerEntryId === match.home.entryId
                ? match.home.athleteId
                : match.winnerEntryId === match.away.entryId
                  ? match.away.athleteId
                  : null,
            homeEntryId: match.home.entryId,
            awayEntryId: match.away.entryId,
            winnerEntryId: match.winnerEntryId
          }
        });

        createdMatchByKey.set(`${match.roundNumber}-${match.matchNumber}`, createdMatch);
      }

      for (const match of generatedBracket.matches) {
        const key = `${match.roundNumber}-${match.matchNumber}`;
        const createdMatch = createdMatchByKey.get(key);
        if (!createdMatch) {
          continue;
        }

        const nextKey = `${match.roundNumber + 1}-${Math.ceil(match.matchNumber / 2)}`;
        const nextMatch = createdMatchByKey.get(nextKey);

        await tx.match.update({
          where: { id: createdMatch.id },
          data: {
            nextMatchId: nextMatch?.id,
            nextMatchSlot: nextMatch ? (match.matchNumber % 2 === 1 ? 1 : 2) : null,
            sourceHomeMatchId: match.sourceMatchHomeId ? createdMatchByKey.get(match.sourceMatchHomeId)?.id : null,
            sourceAwayMatchId: match.sourceMatchAwayId ? createdMatchByKey.get(match.sourceMatchAwayId)?.id : null
          }
        });
      }

      const persistedMatches = await tx.match.findMany({
        where: { bracketId: bracket.id },
        orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }]
      });

      return mapBracketRecord(bracket, persistedMatches);
    });

    return persistedBracket;
  }

  async getDivisionBracket(divisionId: string): Promise<BracketRecord | undefined> {
    const bracket = await this.prisma.bracket.findUnique({
      where: { divisionId },
      include: {
        matches: {
          orderBy: [{ roundNumber: "asc" }, { matchNumber: "asc" }]
        }
      }
    });

    if (!bracket) {
      return undefined;
    }

    return mapBracketRecord(bracket, bracket.matches);
  }

  generatePreview(seeds: AthleteSeed[]) {
    return generateSingleEliminationBracket(seeds);
  }
}
