import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../common/prisma.service";
import { AthletesService } from "./athletes.service";

describe("AthletesService", () => {
  it("returns athlete match history with display-ready match records", async () => {
    const prisma = {
      athlete: {
        findUnique: vi.fn().mockResolvedValue({
          id: "athlete-1",
          userId: "user-1",
          organizationId: "org-1",
          firstName: "Minjun",
          lastName: "Kim",
          gender: "MALE",
          birthDate: new Date("2008-05-12"),
          beltLevel: "Brown",
          weightClassLabel: "-66kg",
          ageDivisionLabel: "U18",
          organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" },
          homeMatches: [
            {
              id: "match-1",
              bracketId: "bracket-1",
              bracket: {
                tournamentId: "tournament-1",
                tournament: {
                  id: "tournament-1",
                  createdById: "demo-admin",
                  name: "Spring Invitational",
                  code: "JUDO26",
                  venue: "Seoul Arena",
                  startsAt: new Date("2026-04-18T09:00:00.000Z"),
                  endsAt: null,
                  status: "IN_PROGRESS"
                },
                division: {
                  id: "division-1",
                  tournamentId: "tournament-1",
                  name: "U18 Men -66kg",
                  gender: "MALE",
                  ageGroup: "U18",
                  weightClass: "-66kg",
                  sortOrder: 1
                }
              },
              roundNumber: 1,
              matchNumber: 1,
              status: "COMPLETED",
              scheduledAt: null,
              completedAt: new Date("2026-06-01T10:00:00.000Z"),
              createdAt: new Date("2026-06-01T09:00:00.000Z"),
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
              homeAthlete: { firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" } },
              awayAthlete: { firstName: "Jisoo", lastName: "Park", organization: { id: "org-2", name: "Han River Club", code: "HANRVR", type: "CLUB" } },
              winnerAthlete: { firstName: "Minjun", lastName: "Kim", organization: { id: "org-1", name: "Seoul Dojo", code: "SEOUL", type: "DOJO" } },
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
                  note: null,
                  createdAt: new Date("2026-06-01T10:00:45.000Z")
                }
              ]
            }
          ],
          awayMatches: []
        })
      }
    } as unknown as PrismaService;
    const service = new AthletesService(prisma);

    const history = await service.getMatchHistory("athlete-1");

    expect(history?.athlete.organizationName).toBe("Seoul Dojo");
    expect(history?.matches[0]?.homeAthleteName).toBe("Minjun Kim");
    expect(history?.matches[0]?.scoreEvents[0]?.technique).toBe("Seoi Nage");
    expect(history?.matches[0]?.tournamentName).toBe("Spring Invitational");
    expect(history?.matches[0]?.divisionName).toBe("U18 Men -66kg");
  });
});
