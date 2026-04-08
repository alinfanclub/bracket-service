import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../common/prisma.service";
import { TournamentsService } from "./tournaments.service";

describe("TournamentsService", () => {
  it("rejects entry creation when the athlete organization does not match the provided organization", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({ id: "tournament-spring-2026" }) },
      division: { findUnique: vi.fn().mockResolvedValue({ id: "division-u18-male-66", tournamentId: "tournament-spring-2026" }) },
      athlete: { findUnique: vi.fn().mockResolvedValue({ id: "athlete-kim-minjun", organizationId: "org-seoul-dojo" }) },
      organization: { findUnique: vi.fn().mockResolvedValue({ id: "org-han-river-club" }) },
      tournamentEntry: { findFirst: vi.fn() }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    await expect(service.createEntry("tournament-spring-2026", {
      divisionId: "division-u18-male-66",
      athleteId: "athlete-kim-minjun",
      organizationId: "org-han-river-club"
    })).rejects.toThrow("Athlete does not belong to the provided organization.");
  });

  it("rejects entry creation when the organization does not exist", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({ id: "tournament-spring-2026" }) },
      division: { findUnique: vi.fn().mockResolvedValue({ id: "division-u18-male-66", tournamentId: "tournament-spring-2026" }) },
      athlete: { findUnique: vi.fn().mockResolvedValue({ id: "athlete-kim-minjun", organizationId: "org-seoul-dojo" }) },
      organization: { findUnique: vi.fn().mockResolvedValue(null) }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    await expect(service.createEntry("tournament-spring-2026", {
      divisionId: "division-u18-male-66",
      athleteId: "athlete-kim-minjun",
      organizationId: "org-missing"
    })).rejects.toThrow("Organization not found.");
  });

  it("rejects entries when a division belongs to a different tournament", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({ id: "tournament-2" }) },
      division: { findUnique: vi.fn().mockResolvedValue({ id: "division-u18-male-66", tournamentId: "tournament-spring-2026" }) }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    await expect(service.createEntry("tournament-2", {
      divisionId: "division-u18-male-66",
      athleteId: "athlete-kim-minjun",
      organizationId: "org-seoul-dojo"
    })).rejects.toThrow("Division not found for this tournament.");
  });

  it("creates unique tournament codes across repeated creations", async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-code" })
      .mockResolvedValueOnce(null);
    const create = vi
      .fn()
      .mockResolvedValueOnce({
        id: "tournament-1",
        createdById: "demo-admin",
        name: "Seoul Open",
        code: "SEO111",
        venue: "Arena A",
        startsAt: new Date("2026-06-01T09:00:00.000Z"),
        endsAt: null,
        status: "DRAFT"
      })
      .mockResolvedValueOnce({
        id: "tournament-2",
        createdById: "demo-admin",
        name: "Seoul Open",
        code: "SEO222",
        venue: "Arena B",
        startsAt: new Date("2026-06-02T09:00:00.000Z"),
        endsAt: null,
        status: "DRAFT"
      });
    const prisma = {
      tournament: { findUnique, create }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    const first = await service.createTournament(
      { name: "Seoul Open", venue: "Arena A", startsAt: "2026-06-01T09:00:00.000Z" },
      "demo-admin"
    );
    const second = await service.createTournament(
      { name: "Seoul Open", venue: "Arena B", startsAt: "2026-06-02T09:00:00.000Z" },
      "demo-admin"
    );

    expect(first.code).not.toBe(second.code);
  });

  it("fails closed for athlete-scoped tournament reads without athlete linkage", async () => {
    const service = new TournamentsService({} as PrismaService);

    await expect(
      service.listVisibleTo({ userId: "athlete-user", role: "ATHLETE", organizationIds: [], organizationRoles: {} })
    ).rejects.toThrow("Athlete scope is missing athlete profile linkage.");
  });

  it("rejects duplicate entries when the preflight lookup finds an existing entry", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({ id: "tournament-spring-2026" }) },
      division: { findUnique: vi.fn().mockResolvedValue({ id: "division-u18-male-66", tournamentId: "tournament-spring-2026" }) },
      athlete: { findUnique: vi.fn().mockResolvedValue({ id: "athlete-kim-minjun", organizationId: "org-seoul-dojo" }) },
      organization: { findUnique: vi.fn().mockResolvedValue({ id: "org-seoul-dojo" }) },
      tournamentEntry: {
        findFirst: vi.fn().mockResolvedValue({ id: "existing-entry" })
      }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    await expect(
      service.createEntry("tournament-spring-2026", {
        divisionId: "division-u18-male-66",
        athleteId: "athlete-kim-minjun",
        organizationId: "org-seoul-dojo"
      })
    ).rejects.toThrow("Athlete is already entered in this division.");
  });

  it("returns display-ready public tournament payloads", async () => {
    const prisma = {
      tournament: { findUnique: vi.fn().mockResolvedValue({
        id: "tournament-1",
        createdById: "demo-admin",
        name: "Spring Invitational",
        code: "JUDO26",
        venue: "Seoul Arena",
        startsAt: new Date("2026-04-18T09:00:00.000Z"),
        endsAt: null,
        status: "IN_PROGRESS"
      }) },
      division: { findMany: vi.fn().mockResolvedValue([{ id: "division-1", tournamentId: "tournament-1", name: "U18 Men -66kg", gender: "MALE", ageGroup: "U18", weightClass: "-66kg", sortOrder: 1 }]) },
      tournamentEntry: {
        findMany: vi.fn().mockResolvedValue([{ id: "entry-1", tournamentId: "tournament-1", divisionId: "division-1", athleteId: "athlete-1", organizationId: "org-1", status: "CONFIRMED", seed: 1, notes: null, athlete: { firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" } }, organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" } }])
      },
      bracket: { findMany: vi.fn().mockResolvedValue([{ id: "bracket-1", tournamentId: "tournament-1", divisionId: "division-1", status: "READY", bracketSize: 2, generatedAt: new Date("2026-04-18T08:00:00.000Z"), matches: [{ id: "match-1", bracketId: "bracket-1", roundNumber: 1, matchNumber: 1, status: "READY", scheduledAt: null, completedAt: null, homeAthleteId: "athlete-1", awayAthleteId: "athlete-2", winnerAthleteId: null, homeEntryId: "entry-1", awayEntryId: "entry-2", winnerEntryId: null, nextMatchId: null, nextMatchSlot: null, sourceHomeMatchId: null, sourceAwayMatchId: null, homeAthlete: { firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" } }, awayAthlete: { firstName: "Jisoo", lastName: "Park", organization: { id: "org-2", name: "Han River Club", code: "HANRVR", type: "CLUB" } }, winnerAthlete: null }] }]) }
    } as unknown as PrismaService;
    const service = new TournamentsService(prisma);

    const view = await service.getPublicView("tournament-1");

    expect(view.entries[0]?.athleteName).toBe("Minjun Kim");
    expect(view.entries[0]?.organizationName).toBe("Seoul Dojo");
    expect(view.brackets[0]?.matches[0]?.homeAthleteName).toBe("Minjun Kim");
  });
});
