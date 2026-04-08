import type {
  AthleteSeed,
  GeneratedBracket,
  GeneratedMatch,
  GeneratedMatchSlot,
  MatchResultSubmission
} from "@judo-bracket/types";

const nextPowerOfTwo = (value: number): number => {
  if (value <= 1) return 1;
  return 2 ** Math.ceil(Math.log2(value));
};

const createEmptySlot = (slotIndex: number): GeneratedMatchSlot => ({
  slotIndex,
  entryId: null,
  athleteId: null,
  athleteName: null,
  organizationId: null
});

const toSlot = (slotIndex: number, athlete: AthleteSeed | null): GeneratedMatchSlot => {
  if (!athlete) {
    return createEmptySlot(slotIndex);
  }

  return {
    slotIndex,
    entryId: athlete.entryId,
    athleteId: athlete.athleteId,
    athleteName: athlete.athleteName,
    organizationId: athlete.organizationId
  };
};

const cloneMatches = (matches: GeneratedMatch[]): GeneratedMatch[] => {
  return matches.map((match) => ({
    ...match,
    home: { ...match.home },
    away: { ...match.away }
  }));
};

const getMatchKey = (roundNumber: number, matchNumber: number): string => {
  return `${roundNumber}-${matchNumber}`;
};

const pairedSlotIndex = (slotIndex: number): number => {
  return slotIndex % 2 === 0 ? slotIndex + 1 : slotIndex - 1;
};

const pushWinnerForward = (matches: GeneratedMatch[], matchKey: string, winnerEntryId: string): void => {
  const currentMatch = matches.find((match) => getMatchKey(match.roundNumber, match.matchNumber) === matchKey);
  if (!currentMatch) {
    return;
  }

  const winnerSlot = currentMatch.home.entryId === winnerEntryId ? currentMatch.home : currentMatch.away;
  const nextRound = currentMatch.roundNumber + 1;
  const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);
  const nextMatch = matches.find((match) => match.roundNumber === nextRound && match.matchNumber === nextMatchNumber);

  if (!nextMatch) {
    return;
  }

  if (currentMatch.matchNumber % 2 === 1) {
    nextMatch.home = { ...winnerSlot };
  } else {
    nextMatch.away = { ...winnerSlot };
  }

  if (nextMatch.home.entryId !== null && nextMatch.away.entryId !== null) {
    nextMatch.status = "READY";
    return;
  }

  if (nextMatch.home.entryId !== null || nextMatch.away.entryId !== null) {
    nextMatch.status = "BYE";
    nextMatch.winnerEntryId = nextMatch.home.entryId ?? nextMatch.away.entryId;

    if (nextMatch.winnerEntryId) {
      pushWinnerForward(matches, getMatchKey(nextMatch.roundNumber, nextMatch.matchNumber), nextMatch.winnerEntryId);
    }
  }
};

const seedPlacementOrder = (size: number): number[] => {
  let order = [1, 2];

  while (order.length < size) {
    const expandedSize = order.length * 2;
    order = order.flatMap((seed, index) => {
      const pairedSeed = expandedSize + 1 - seed;
      return index % 2 === 0 ? [seed, pairedSeed] : [pairedSeed, seed];
    });
  }

  return order.slice(0, size);
};

const placeUnseededAthletes = (
  slots: Array<AthleteSeed | null>,
  unseededAthletes: AthleteSeed[]
): Array<AthleteSeed | null> => {
  const remaining = [...unseededAthletes];

  for (let slotIndex = 0; slotIndex < slots.length; slotIndex += 1) {
    if (slots[slotIndex] !== null) {
      continue;
    }

    const opponent = slots[pairedSlotIndex(slotIndex)] ?? null;
    const preferredIndex = remaining.findIndex((athlete) => athlete.organizationId !== opponent?.organizationId);
    const selectedIndex = preferredIndex >= 0 ? preferredIndex : 0;
    const [selectedAthlete] = remaining.splice(selectedIndex, 1);
    slots[slotIndex] = selectedAthlete ?? null;
  }

  return slots;
};

export const generateSingleEliminationBracket = (seeds: AthleteSeed[]): GeneratedBracket => {
  if (seeds.length === 0) {
    return { size: 0, rounds: 0, matches: [] };
  }

  if (seeds.length === 1) {
    return {
      size: 1,
      rounds: 0,
      matches: []
    };
  }

  const bracketSize = nextPowerOfTwo(seeds.length);
  const order = seedPlacementOrder(bracketSize);
  const firstRoundSlots: Array<AthleteSeed | null> = Array.from({ length: bracketSize }, () => null);
  const explicitlySeeded = seeds.filter((athlete) => athlete.seed !== undefined && athlete.seed <= bracketSize);
  const unseeded = seeds
    .filter((athlete) => athlete.seed === undefined || athlete.seed > bracketSize)
    .sort((left, right) => left.athleteName.localeCompare(right.athleteName));

  explicitlySeeded.forEach((athlete) => {
    if (athlete.seed === undefined) {
      return;
    }

    const placementIndex = order.findIndex((seedNumber) => seedNumber === athlete.seed);
    if (placementIndex >= 0 && firstRoundSlots[placementIndex] === null) {
      firstRoundSlots[placementIndex] = athlete;
    }
  });

  placeUnseededAthletes(firstRoundSlots, unseeded);
  const matches: GeneratedMatch[] = [];
  let currentRoundMatches = bracketSize / 2;

  for (let round = 1; round <= Math.log2(bracketSize); round += 1) {
    for (let matchNumber = 1; matchNumber <= currentRoundMatches; matchNumber += 1) {
      const isFirstRound = round === 1;
      const baseIndex = (matchNumber - 1) * 2;
      const homeAthlete = isFirstRound ? firstRoundSlots[baseIndex] ?? null : null;
      const awayAthlete = isFirstRound ? firstRoundSlots[baseIndex + 1] ?? null : null;
      const status = isFirstRound && (homeAthlete === null || awayAthlete === null) ? "BYE" : "PENDING";

      matches.push({
        roundNumber: round,
        matchNumber,
        status,
        home: toSlot(baseIndex + 1, homeAthlete),
        away: toSlot(baseIndex + 2, awayAthlete),
        sourceMatchHomeId: round > 1 ? getMatchKey(round - 1, matchNumber * 2 - 1) : undefined,
        sourceMatchAwayId: round > 1 ? getMatchKey(round - 1, matchNumber * 2) : undefined,
        winnerEntryId:
          status === "BYE"
            ? homeAthlete?.entryId ?? awayAthlete?.entryId ?? null
            : null
      });
    }

    currentRoundMatches /= 2;
  }

  matches
    .filter((match) => match.status === "BYE" && match.winnerEntryId)
    .forEach((match) => {
      if (match.winnerEntryId) {
        pushWinnerForward(matches, getMatchKey(match.roundNumber, match.matchNumber), match.winnerEntryId);
      }
    });

  return {
    size: bracketSize,
    rounds: Math.log2(bracketSize),
    matches
  };
};

export const propagateWinner = (matches: GeneratedMatch[], result: MatchResultSubmission): GeneratedMatch[] => {
  const updated = cloneMatches(matches);

  const currentMatchIndex = updated.findIndex((match) => getMatchKey(match.roundNumber, match.matchNumber) === result.matchId);
  if (currentMatchIndex === -1) {
    return updated;
  }

  const currentMatch = updated[currentMatchIndex];
  const allowedWinnerIds = [currentMatch.home.entryId, currentMatch.away.entryId].filter(
    (entryId): entryId is string => entryId !== null
  );

  if (!allowedWinnerIds.includes(result.winnerEntryId)) {
    throw new Error("Winner must belong to the current match.");
  }

  currentMatch.status = "COMPLETED";
  currentMatch.winnerEntryId = result.winnerEntryId;

  const nextRound = currentMatch.roundNumber + 1;
  const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);
  const nextMatch = updated.find(
    (match) => match.roundNumber === nextRound && match.matchNumber === nextMatchNumber
  );

  if (!nextMatch) {
    return updated;
  }

  const winnerSlot: GeneratedMatchSlot = currentMatch.home.entryId === result.winnerEntryId ? currentMatch.home : currentMatch.away;
  const nextMatchKey = getMatchKey(nextMatch.roundNumber, nextMatch.matchNumber);

  if (currentMatch.matchNumber % 2 === 1) {
    nextMatch.home = { ...winnerSlot };
  } else {
    nextMatch.away = { ...winnerSlot };
  }

  if (nextMatch.home.entryId !== null && nextMatch.away.entryId !== null) {
    nextMatch.status = "READY";
  } else {
    nextMatch.status = "BYE";
    nextMatch.winnerEntryId = nextMatch.home.entryId ?? nextMatch.away.entryId;
    if (nextMatch.winnerEntryId) {
      pushWinnerForward(updated, nextMatchKey, nextMatch.winnerEntryId);
    }
  }

  return updated;
};
