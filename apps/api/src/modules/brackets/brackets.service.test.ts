import { ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../common/prisma.service";
import { BracketsService } from "./brackets.service";

describe("BracketsService", () => {
  it("rejects generation when the division does not exist", async () => {
    const tx = {
      division: { findUnique: vi.fn().mockResolvedValue(null) }
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new BracketsService(prisma);

    await expect(service.generateDivisionBracket("missing-division")).rejects.toThrow(NotFoundException);
  });

  it("rejects regeneration when live matches already exist", async () => {
    const tx = {
      division: {
        findUnique: vi.fn().mockResolvedValue({
          id: "division-1",
          tournamentId: "tournament-1",
          entries: [
            {
              id: "entry-1",
              seed: 1,
              athlete: { id: "athlete-1", firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo" } }
            }
          ],
          bracket: {
            id: "bracket-1",
            matches: [{ status: "IN_PROGRESS" }]
          }
        })
      }
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new BracketsService(prisma);

    await expect(service.generateDivisionBracket("division-1")).rejects.toThrow(ConflictException);
  });

  it("creates a completed zero-match bracket for a one-entrant division", async () => {
    const tx = {
      division: {
        findUnique: vi.fn().mockResolvedValue({
          id: "division-1",
          tournamentId: "tournament-1",
          entries: [
            {
              id: "entry-1",
              seed: 1,
              athlete: { id: "athlete-1", firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo" } }
            }
          ],
          bracket: null
        })
      },
      bracket: {
        create: vi.fn().mockResolvedValue({
          id: "bracket-1",
          tournamentId: "tournament-1",
          divisionId: "division-1",
          status: "COMPLETED",
          bracketSize: 1,
          generatedAt: new Date("2026-06-01T09:00:00.000Z")
        })
      },
      match: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    } as unknown as PrismaService;
    const service = new BracketsService(prisma);

    const bracket = await service.generateDivisionBracket("division-1");

    expect(bracket.status).toBe("COMPLETED");
    expect(bracket.matches).toHaveLength(0);
  });
});
