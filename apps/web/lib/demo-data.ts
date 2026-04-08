import type { AthleteMatchHistoryRecord, PublicTournamentView } from "@judo-bracket/types";

export const publicTournamentDemo: PublicTournamentView = {
  tournament: {
    id: "tournament-spring-2026",
    createdById: "demo-admin",
    name: "2026 Spring Judo Invitational",
    code: "JUDO26",
    status: "IN_PROGRESS",
    venue: "Seoul Student Gymnasium",
    startsAt: "2026-04-18T09:00:00.000Z"
  },
  divisions: [
    {
      id: "division-u18-male-66",
      tournamentId: "tournament-spring-2026",
      name: "U18 Men -66kg",
      gender: "MALE",
      ageGroup: "U18",
      weightClass: "-66kg",
      sortOrder: 1
    }
  ],
  entries: [
    {
      id: "entry-1",
      tournamentId: "tournament-spring-2026",
      divisionId: "division-u18-male-66",
      athleteId: "athlete-1",
      athleteName: "Minjun Kim",
      organizationId: "org-1",
      organizationName: "Seoul Dojo",
      status: "CONFIRMED",
      seed: 1
    },
    {
      id: "entry-2",
      tournamentId: "tournament-spring-2026",
      divisionId: "division-u18-male-66",
      athleteId: "athlete-2",
      athleteName: "Jisoo Park",
      organizationId: "org-2",
      organizationName: "Han River Club",
      status: "CONFIRMED",
      seed: 2
    }
  ],
  brackets: [
    {
      id: "bracket-1",
      tournamentId: "tournament-spring-2026",
      divisionId: "division-u18-male-66",
      status: "READY",
      bracketSize: 2,
      generatedAt: "2026-04-18T08:00:00.000Z",
      matches: [
        {
          id: "match-1",
          bracketId: "bracket-1",
          roundNumber: 1,
          matchNumber: 1,
          status: "READY",
          homeAthleteId: "athlete-1",
          homeAthleteName: "Minjun Kim",
          awayAthleteId: "athlete-2",
          awayAthleteName: "Jisoo Park",
          homeEntryId: "entry-1",
          awayEntryId: "entry-2",
          homeOrganizationName: "Seoul Dojo",
          awayOrganizationName: "Han River Club"
        }
      ]
    }
  ]
};

export const athleteHistoryDemo: AthleteMatchHistoryRecord = {
  athlete: {
    id: "athlete-1",
    userId: "athlete-user-1",
    organizationId: "org-1",
    organizationName: "Seoul Dojo",
    firstName: "Minjun",
    lastName: "Kim",
    gender: "MALE",
    birthDate: "2008-05-12",
    beltLevel: "Brown",
    weightClassLabel: "-66kg",
    ageDivisionLabel: "U18"
  },
  matches: [
    {
      id: "match-1",
      bracketId: "bracket-1",
      tournamentId: "tournament-spring-2026",
      tournamentName: "2026 Spring Judo Invitational",
      tournamentCode: "JUDO26",
      divisionId: "division-u18-male-66",
      divisionName: "U18 Men -66kg",
      roundNumber: 1,
      matchNumber: 1,
      status: "COMPLETED",
      completedAt: "2026-04-18T10:02:00.000Z",
      homeAthleteId: "athlete-1",
      homeAthleteName: "Minjun Kim",
      awayAthleteId: "athlete-2",
      awayAthleteName: "Jisoo Park",
      winnerAthleteId: "athlete-1",
      winnerAthleteName: "Minjun Kim",
      homeEntryId: "entry-1",
      awayEntryId: "entry-2",
      winnerEntryId: "entry-1",
      homeOrganizationName: "Seoul Dojo",
      awayOrganizationName: "Han River Club",
      winnerOrganizationName: "Seoul Dojo",
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
          createdAt: "2026-04-18T10:00:45.000Z"
        }
      ]
    }
  ]
};
