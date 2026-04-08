import { describe, expect, it, vi } from "vitest";

import { AthletesController } from "./athletes.controller";
import { AthletesService } from "./athletes.service";

describe("AthletesController", () => {
  it("returns athlete history for the requesting athlete", async () => {
    const mockHistory = {
      athlete: {
        id: "athlete-1",
        userId: "user-1",
        organizationId: "org-1",
        firstName: "Minjun",
        lastName: "Kim",
        gender: "MALE",
        birthDate: "2008-05-15",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      },
      matches: [
        {
          id: "match-1",
          bracketId: "bracket-1",
          tournamentId: "tournament-1",
          tournamentName: "Spring Open",
          tournamentCode: "SPRING26",
          divisionId: "division-1",
          divisionName: "U18 Men -66kg",
          roundNumber: 1,
          matchNumber: 1,
          status: "COMPLETED",
          homeAthleteName: "Minjun Kim",
          awayAthleteName: "Jisoo Park",
          winnerAthleteName: "Minjun Kim",
          homeOrganizationName: "Seoul Dojo",
          awayOrganizationName: "Han River Club",
          winnerOrganizationName: "Seoul Dojo",
          homeAthleteId: "athlete-1",
          awayAthleteId: "athlete-2",
          winnerAthleteId: "athlete-1",
          completedAt: "2026-04-04T10:30:00.000Z",
          scoreEvents: [
            {
              id: "event-1",
              matchId: "match-1",
              athleteId: "athlete-1",
              tournamentEntryId: "entry-1",
              eventType: "IPPON",
              technique: "Seoi Nage",
              pointsAwarded: 10,
              occurredAtSeconds: 45,
              createdAt: "2026-04-04T10:30:00.000Z"
            }
          ]
        }
      ]
    };

    const service = {
      getById: vi.fn().mockResolvedValue(mockHistory.athlete),
      getMatchHistory: vi.fn().mockResolvedValue(mockHistory)
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-1",
      role: "ATHLETE" as const,
      organizationIds: [],
      organizationRoles: {},
      athleteId: "athlete-1"
    };

    const result = await controller.getAthleteHistory("athlete-1", principal);

    expect(result.athlete.id).toBe("athlete-1");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].tournamentName).toBe("Spring Open");
    expect(result.matches[0].divisionName).toBe("U18 Men -66kg");
    expect(result.matches[0].scoreEvents).toHaveLength(1);
  });

  it("prevents athletes from accessing other athletes' history", async () => {
    const service = {
      getById: vi.fn().mockResolvedValue({
        id: "athlete-2",
        userId: "user-2",
        organizationId: "org-1",
        firstName: "Jisoo",
        lastName: "Park",
        gender: "MALE",
        birthDate: "2008-03-20",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      })
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-1",
      role: "ATHLETE" as const,
      organizationIds: [],
      organizationRoles: {},
      athleteId: "athlete-1"
    };

    await expect(controller.getAthleteHistory("athlete-2", principal)).rejects.toThrow("Athletes can only access their own match history.");
  });

  it("allows managers to access their athletes' history", async () => {
    const mockHistory = {
      athlete: {
        id: "athlete-1",
        userId: "user-1",
        organizationId: "org-1",
        firstName: "Minjun",
        lastName: "Kim",
        gender: "MALE",
        birthDate: "2008-05-15",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      },
      matches: []
    };

    const service = {
      getById: vi.fn().mockResolvedValue(mockHistory.athlete),
      getMatchHistory: vi.fn().mockResolvedValue(mockHistory)
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-manager",
      role: "MANAGER" as const,
      organizationIds: ["org-1"],
      organizationRoles: { "org-1": "MANAGER" as const }
    };

    const result = await controller.getAthleteHistory("athlete-1", principal);

    expect(result.athlete.id).toBe("athlete-1");
    expect(result.matches).toHaveLength(0);
  });

  it("prevents managers from accessing athletes from other organizations", async () => {
    const service = {
      getById: vi.fn().mockResolvedValue({
        id: "athlete-1",
        userId: "user-1",
        organizationId: "org-2",
        firstName: "Minjun",
        lastName: "Kim",
        gender: "MALE",
        birthDate: "2008-05-15",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      })
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-manager",
      role: "MANAGER" as const,
      organizationIds: ["org-1"],
      organizationRoles: { "org-1": "MANAGER" as const }
    };

    await expect(controller.getAthleteHistory("athlete-1", principal)).rejects.toThrow("You cannot access this athlete history.");
  });

  it("returns 404 when athlete history not found", async () => {
    const service = {
      getById: vi.fn().mockResolvedValue({
        id: "athlete-1",
        userId: "user-1",
        organizationId: "org-1",
        firstName: "Minjun",
        lastName: "Kim",
        gender: "MALE",
        birthDate: "2008-05-15",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      }),
      getMatchHistory: vi.fn().mockResolvedValue(null)
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-1",
      role: "ATHLETE" as const,
      organizationIds: [],
      organizationRoles: {},
      athleteId: "athlete-1"
    };

    await expect(controller.getAthleteHistory("athlete-1", principal)).rejects.toThrow("Athlete history not found.");
  });

  it("allows admin to access any athlete's history", async () => {
    const mockHistory = {
      athlete: {
        id: "athlete-1",
        userId: "user-1",
        organizationId: "org-1",
        firstName: "Minjun",
        lastName: "Kim",
        gender: "MALE",
        birthDate: "2008-05-15",
        beltLevel: "BROWN",
        weightClassLabel: "-66kg",
        ageDivisionLabel: "U18"
      },
      matches: []
    };

    const service = {
      getById: vi.fn().mockResolvedValue(mockHistory.athlete),
      getMatchHistory: vi.fn().mockResolvedValue(mockHistory)
    } as unknown as AthletesService;

    const controller = new AthletesController(service);
    const principal = {
      userId: "user-admin",
      role: "ADMIN" as const,
      organizationIds: [],
      organizationRoles: {}
    };

    const result = await controller.getAthleteHistory("athlete-1", principal);

    expect(result.athlete.id).toBe("athlete-1");
  });
});
