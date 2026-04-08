import { describe, expect, it } from "vitest";

import { generateSingleEliminationBracket, propagateWinner } from "./bracket";

describe("generateSingleEliminationBracket", () => {
  it("keeps seeded athletes apart according to bracket placement", () => {
    const bracket = generateSingleEliminationBracket([
      { entryId: "e1", athleteId: "a1", athleteName: "Kim", organizationId: "o1", organizationName: "Dojo 1", seed: 1 },
      { entryId: "e2", athleteId: "a2", athleteName: "Lee", organizationId: "o2", organizationName: "Dojo 2", seed: 2 },
      { entryId: "e3", athleteId: "a3", athleteName: "Park", organizationId: "o3", organizationName: "Dojo 3", seed: 3 },
      { entryId: "e4", athleteId: "a4", athleteName: "Choi", organizationId: "o4", organizationName: "Dojo 4", seed: 4 }
    ]);

    const roundOne = bracket.matches.filter((match) => match.roundNumber === 1);
    const pairings = roundOne.map((match) => [match.home.entryId, match.away.entryId]);

    expect(pairings).toEqual([
      ["e1", "e4"],
      ["e3", "e2"]
    ]);
  });

  it("creates bye matches when the bracket is not full", () => {
    const bracket = generateSingleEliminationBracket([
      { entryId: "e1", athleteId: "a1", athleteName: "Kim", organizationId: "o1", organizationName: "Dojo 1", seed: 1 },
      { entryId: "e2", athleteId: "a2", athleteName: "Lee", organizationId: "o2", organizationName: "Dojo 2", seed: 2 },
      { entryId: "e3", athleteId: "a3", athleteName: "Park", organizationId: "o3", organizationName: "Dojo 3", seed: 3 }
    ]);

    expect(bracket.size).toBe(4);
    expect(bracket.matches.some((match) => match.status === "BYE")).toBe(true);
  });

  it("avoids same-organization first-round matches when a swap can improve the draw", () => {
    const bracket = generateSingleEliminationBracket([
      { entryId: "e1", athleteId: "a1", athleteName: "Kim", organizationId: "o1", organizationName: "Dojo 1", seed: 1 },
      { entryId: "e2", athleteId: "a2", athleteName: "Lee", organizationId: "o1", organizationName: "Dojo 1", seed: 2 },
      { entryId: "e3", athleteId: "a3", athleteName: "Park", organizationId: "o2", organizationName: "Dojo 2", seed: 3 },
      { entryId: "e4", athleteId: "a4", athleteName: "Choi", organizationId: "o3", organizationName: "Dojo 3", seed: 4 }
    ]);

    const firstRound = bracket.matches.filter((match) => match.roundNumber === 1);
    expect(firstRound.every((match) => match.home.organizationId !== match.away.organizationId)).toBe(true);
  });
});

describe("propagateWinner", () => {
  it("moves the winner into the correct next round slot", () => {
    const bracket = generateSingleEliminationBracket([
      { entryId: "e1", athleteId: "a1", athleteName: "Kim", organizationId: "o1", organizationName: "Dojo 1", seed: 1 },
      { entryId: "e2", athleteId: "a2", athleteName: "Lee", organizationId: "o2", organizationName: "Dojo 2", seed: 2 },
      { entryId: "e3", athleteId: "a3", athleteName: "Park", organizationId: "o3", organizationName: "Dojo 3", seed: 3 },
      { entryId: "e4", athleteId: "a4", athleteName: "Choi", organizationId: "o4", organizationName: "Dojo 4", seed: 4 }
    ]);

    const updated = propagateWinner(bracket.matches, {
      matchId: "1-1",
      winnerEntryId: "e1",
      completedAt: new Date().toISOString(),
      scoreEvents: []
    });

    const semifinal = updated.find((match) => match.roundNumber === 2 && match.matchNumber === 1);
    expect(semifinal?.home.entryId).toBe("e1");
  });

  it("rejects winners that are not part of the current match", () => {
    const bracket = generateSingleEliminationBracket([
      { entryId: "e1", athleteId: "a1", athleteName: "Kim", organizationId: "o1", organizationName: "Dojo 1", seed: 1 },
      { entryId: "e2", athleteId: "a2", athleteName: "Lee", organizationId: "o2", organizationName: "Dojo 2", seed: 2 },
      { entryId: "e3", athleteId: "a3", athleteName: "Park", organizationId: "o3", organizationName: "Dojo 3", seed: 3 },
      { entryId: "e4", athleteId: "a4", athleteName: "Choi", organizationId: "o4", organizationName: "Dojo 4", seed: 4 }
    ]);

    expect(() =>
      propagateWinner(bracket.matches, {
        matchId: "1-1",
        winnerEntryId: "e999",
        completedAt: new Date().toISOString(),
        scoreEvents: []
      })
    ).toThrow("Winner must belong to the current match.");
  });
});
