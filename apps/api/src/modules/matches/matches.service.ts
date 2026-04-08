import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import type { MatchDetailRecord, MatchRecord, MatchResultSubmission } from "@judo-bracket/types";

import { mapMatchDetailRecord, mapMatchRecord } from "../../common/mappers";
import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class MatchesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private isRetryableTransactionError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
  }

  private async runSerializableTransaction<T>(operation: (tx: PrismaService) => Promise<T>): Promise<T> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        return await this.prisma.$transaction((tx) => operation(tx as unknown as PrismaService), {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
      } catch (error) {
        if (!this.isRetryableTransactionError(error) || attempt === maxRetries - 1) {
          throw error;
        }
      }
    }

    throw new ConflictException("Could not finalize the match result after transaction retries.");
  }

  private async advanceWinner(
    tx: PrismaService,
    currentMatchId: string,
    winnerEntryId: string,
    winnerAthleteId: string
  ): Promise<void> {
    const currentMatch = await tx.match.findUnique({
      where: { id: currentMatchId },
      select: {
        nextMatchId: true,
        nextMatchSlot: true
      }
    });

    if (!currentMatch?.nextMatchId || !currentMatch.nextMatchSlot) {
      return;
    }

    await tx.match.update({
      where: { id: currentMatch.nextMatchId },
      data:
        currentMatch.nextMatchSlot === 1
          ? { homeEntryId: winnerEntryId, homeAthleteId: winnerAthleteId }
          : { awayEntryId: winnerEntryId, awayAthleteId: winnerAthleteId }
    });

    const nextMatch = await tx.match.findUnique({
      where: { id: currentMatch.nextMatchId }
    });

    if (!nextMatch) {
      return;
    }

    if (nextMatch.homeEntryId && nextMatch.awayEntryId) {
      await tx.match.update({
        where: { id: nextMatch.id },
        data: {
          status: "READY",
          winnerEntryId: null,
          winnerAthleteId: null,
          completedAt: null
        }
      });
      return;
    }

    const provisionalWinnerEntryId = nextMatch.homeEntryId ?? nextMatch.awayEntryId;
    const provisionalWinnerAthleteId = nextMatch.homeAthleteId ?? nextMatch.awayAthleteId;

    if (!provisionalWinnerEntryId || !provisionalWinnerAthleteId) {
      return;
    }

    const missingSourceMatchId = nextMatch.homeEntryId ? nextMatch.sourceAwayMatchId : nextMatch.sourceHomeMatchId;
    const missingSource = missingSourceMatchId
      ? await tx.match.findUnique({
          where: { id: missingSourceMatchId },
          select: { status: true, winnerEntryId: true }
        })
      : null;

    await tx.match.update({
      where: { id: nextMatch.id },
      data: {
        status: "BYE",
        winnerEntryId: provisionalWinnerEntryId,
        winnerAthleteId: provisionalWinnerAthleteId
      }
    });

    const branchIsDead = missingSource === null || (missingSource.status === "BYE" && missingSource.winnerEntryId === null);
    if (branchIsDead) {
      await this.advanceWinner(tx, nextMatch.id, provisionalWinnerEntryId, provisionalWinnerAthleteId);
    }
  }

  async submitResult(payload: MatchResultSubmission): Promise<MatchRecord> {
    const updatedMatch = await this.runSerializableTransaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: payload.matchId },
        include: {
          bracket: true
        }
      });

      if (!match) {
        throw new NotFoundException("Match not found.");
      }

      if (match.status === "COMPLETED") {
        throw new ConflictException("Match result has already been submitted.");
      }

      if (match.status !== "READY" && match.status !== "IN_PROGRESS") {
        throw new ConflictException("Only READY or IN_PROGRESS matches can accept results.");
      }

      const allowedWinnerIds = [match.homeEntryId, match.awayEntryId].filter(
        (entryId): entryId is string => entryId !== null
      );

      if (!allowedWinnerIds.includes(payload.winnerEntryId)) {
        throw new ConflictException("Winner must belong to the current match.");
      }

      const allowedEventEntryIds = new Set(allowedWinnerIds);
      if (!payload.scoreEvents.every((event) => allowedEventEntryIds.has(event.entryId))) {
        throw new ConflictException("Score events must reference competitors in the current match.");
      }

      const winnerAthleteId = payload.winnerEntryId === match.homeEntryId ? match.homeAthleteId : match.awayAthleteId;
      if (!winnerAthleteId) {
        throw new ConflictException("Winner athlete linkage is missing for this match.");
      }

      await tx.matchScoreEvent.deleteMany({
        where: { matchId: match.id }
      });

      if (payload.scoreEvents.length > 0) {
        await tx.matchScoreEvent.createMany({
          data: payload.scoreEvents.map((event) => ({
            matchId: match.id,
            athleteId: event.entryId === match.homeEntryId ? match.homeAthleteId : match.awayAthleteId,
            tournamentEntryId: event.entryId,
            eventType: event.eventType,
            technique: event.technique,
            pointsAwarded: event.pointsAwarded,
            occurredAtSeconds: event.occurredAtSeconds,
            note: event.note
          }))
        });
      }

      await tx.match.update({
        where: { id: match.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(payload.completedAt),
          winnerEntryId: payload.winnerEntryId,
          winnerAthleteId
        }
      });

      await this.advanceWinner(tx as unknown as PrismaService, match.id, payload.winnerEntryId, winnerAthleteId);

      const remainingOpenMatches = await tx.match.count({
        where: {
          bracketId: match.bracketId,
          status: {
            in: ["PENDING", "READY", "IN_PROGRESS"]
          }
        }
      });

      await tx.bracket.update({
        where: { id: match.bracketId },
        data: {
          status: remainingOpenMatches === 0 ? "COMPLETED" : "IN_PROGRESS"
        }
      });

      const persistedMatch = await tx.match.findUnique({ where: { id: match.id } });
      if (!persistedMatch) {
        throw new NotFoundException("Match not found after update.");
      }

      return persistedMatch;
    });

    return mapMatchRecord(updatedMatch);
  }

  async getMatch(matchId: string): Promise<MatchDetailRecord | undefined> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeAthlete: { include: { organization: true } },
        awayAthlete: { include: { organization: true } },
        winnerAthlete: { include: { organization: true } },
        scoreEvents: {
          orderBy: [{ occurredAtSeconds: "asc" }, { createdAt: "asc" }]
        }
      }
    });
    return match ? mapMatchDetailRecord(match, match.scoreEvents) : undefined;
  }
}
