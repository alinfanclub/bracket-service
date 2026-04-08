import { ConflictException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../common/prisma.service";
import { MatchesService } from "./matches.service";

describe("MatchesService", () => {
  it("rejects results for non-playable match states", async () => {
    const tx = {
      match: {
        findUnique: vi.fn().mockResolvedValue({
          id: "match-1",
          bracketId: "bracket-1",
          status: "PENDING",
          homeEntryId: "entry-1",
          awayEntryId: "entry-2",
          homeAthleteId: "athlete-1",
          awayAthleteId: "athlete-2",
          bracket: { id: "bracket-1" }
        })
      }
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new MatchesService(prisma);

    await expect(
      service.submitResult({
        matchId: "match-1",
        winnerEntryId: "entry-1",
        completedAt: "2026-06-01T10:00:00.000Z",
        scoreEvents: []
      })
    ).rejects.toThrow("Only READY or IN_PROGRESS matches can accept results.");
  });

  it("rejects results when the winner is not in the current match", async () => {
    const tx = {
      match: {
        findUnique: vi.fn().mockResolvedValue({
          id: "match-1",
          bracketId: "bracket-1",
          status: "READY",
          homeEntryId: "entry-1",
          awayEntryId: "entry-2",
          homeAthleteId: "athlete-1",
          awayAthleteId: "athlete-2",
          bracket: { id: "bracket-1" }
        })
      }
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new MatchesService(prisma);

    await expect(
      service.submitResult({
        matchId: "match-1",
        winnerEntryId: "entry-999",
        completedAt: "2026-06-01T10:00:00.000Z",
        scoreEvents: []
      })
    ).rejects.toThrow(ConflictException);
  });

  it("persists score events and returns the completed match", async () => {
    const tx = {
      matchScoreEvent: {
        deleteMany: vi.fn().mockResolvedValue(undefined),
        createMany: vi.fn().mockResolvedValue(undefined)
      },
      match: {
        update: vi
          .fn()
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce({
            id: "match-1",
            bracketId: "bracket-1",
            roundNumber: 1,
            matchNumber: 1,
            status: "COMPLETED",
            scheduledAt: null,
            completedAt: new Date("2026-06-01T10:00:00.000Z"),
            homeAthleteId: "athlete-1",
            awayAthleteId: "athlete-2",
            winnerAthleteId: "athlete-1",
            homeEntryId: "entry-1",
            awayEntryId: "entry-2",
            winnerEntryId: "entry-1",
            nextMatchId: null,
            nextMatchSlot: null,
            sourceHomeMatchId: null,
            sourceAwayMatchId: null
          }),
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({
            id: "match-1",
            bracketId: "bracket-1",
            status: "READY",
            homeEntryId: "entry-1",
            awayEntryId: "entry-2",
            homeAthleteId: "athlete-1",
            awayAthleteId: "athlete-2",
            bracket: { id: "bracket-1" }
          })
          .mockResolvedValueOnce({ nextMatchId: null, nextMatchSlot: null })
          .mockResolvedValueOnce({
            id: "match-1",
            bracketId: "bracket-1",
            roundNumber: 1,
            matchNumber: 1,
            status: "COMPLETED",
            scheduledAt: null,
            completedAt: new Date("2026-06-01T10:00:00.000Z"),
            homeAthleteId: "athlete-1",
            awayAthleteId: "athlete-2",
            winnerAthleteId: "athlete-1",
            homeEntryId: "entry-1",
            awayEntryId: "entry-2",
            winnerEntryId: "entry-1",
            nextMatchId: null,
            nextMatchSlot: null,
            sourceHomeMatchId: null,
            sourceAwayMatchId: null
          }),
        count: vi.fn().mockResolvedValue(0)
      },
      bracket: {
        update: vi.fn().mockResolvedValue(undefined)
      }
    };

    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new MatchesService(prisma);

    const result = await service.submitResult({
      matchId: "match-1",
      winnerEntryId: "entry-1",
      completedAt: "2026-06-01T10:00:00.000Z",
      scoreEvents: [
        {
          entryId: "entry-1",
          eventType: "IPPON",
          technique: "Seoi Nage",
          pointsAwarded: 10,
          occurredAtSeconds: 45
        }
      ]
    });

    expect(result.status).toBe("COMPLETED");
    expect(tx.matchScoreEvent.createMany).toHaveBeenCalledTimes(1);
    expect(tx.bracket.update).toHaveBeenCalledWith({ where: { id: "bracket-1" }, data: { status: "COMPLETED" } });
  });

  it("returns ordered score events in match detail reads", async () => {
    const prisma = {
      match: {
        findUnique: vi.fn().mockResolvedValue({
          id: "match-1",
          bracketId: "bracket-1",
          roundNumber: 1,
          matchNumber: 1,
          status: "COMPLETED",
          scheduledAt: null,
          completedAt: new Date("2026-06-01T10:00:00.000Z"),
          homeAthleteId: "athlete-1",
          awayAthleteId: "athlete-2",
          winnerAthleteId: "athlete-1",
          homeEntryId: "entry-1",
          awayEntryId: "entry-2",
          winnerEntryId: "entry-1",
          nextMatchId: null,
          nextMatchSlot: null,
          sourceHomeMatchId: null,
          sourceAwayMatchId: null,
          scoreEvents: [
            {
              id: "event-2",
              matchId: "match-1",
              athleteId: "athlete-1",
              tournamentEntryId: "entry-1",
              eventType: "IPPON",
              technique: "Tai Otoshi",
              pointsAwarded: 10,
              occurredAtSeconds: 90,
              note: null,
              createdAt: new Date("2026-06-01T10:01:00.000Z")
            },
            {
              id: "event-1",
              matchId: "match-1",
              athleteId: "athlete-2",
              tournamentEntryId: "entry-2",
              eventType: "WAZA_ARI",
              technique: "Uchi Mata",
              pointsAwarded: 7,
              occurredAtSeconds: 30,
              note: null,
              createdAt: new Date("2026-06-01T10:00:30.000Z")
            }
          ]
        })
      }
    } as unknown as PrismaService;
    const service = new MatchesService(prisma);

    const match = await service.getMatch("match-1");

    expect(match?.scoreEvents.map((event) => event.id)).toEqual(["event-1", "event-2"]);
  });

  it("rejects resubmission when the transaction re-reads a completed match", async () => {
    const prisma = {
      $transaction: vi.fn(async (callback: (client: PrismaService) => unknown) =>
        callback({
          match: {
            findUnique: vi.fn().mockResolvedValue({
              id: "match-1",
              bracketId: "bracket-1",
              status: "COMPLETED",
              homeEntryId: "entry-1",
              awayEntryId: "entry-2",
              homeAthleteId: "athlete-1",
              awayAthleteId: "athlete-2",
              bracket: { id: "bracket-1" }
            })
          }
        } as unknown as PrismaService)
      )
    } as unknown as PrismaService;
    const service = new MatchesService(prisma);

    await expect(
      service.submitResult({
        matchId: "match-1",
        winnerEntryId: "entry-1",
        completedAt: "2026-06-01T10:00:00.000Z",
        scoreEvents: []
      })
    ).rejects.toThrow("Match result has already been submitted.");
  });
});
