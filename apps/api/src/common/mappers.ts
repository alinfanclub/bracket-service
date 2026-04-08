import type {
  Bracket as PrismaBracket,
  Division as PrismaDivision,
  Match as PrismaMatch,
  MatchScoreEvent as PrismaMatchScoreEvent,
  Organization as PrismaOrganization,
  Tournament as PrismaTournament,
  TournamentEntry as PrismaTournamentEntry
} from "../generated/prisma/client";
import type {
  AthleteRecord,
  BracketRecord,
  DivisionRecord,
  MatchDetailRecord,
  MatchRecord,
  MatchScoreEventRecord,
  TournamentEntryRecord,
  TournamentRecord
} from "@judo-bracket/types";

export const mapTournamentRecord = (tournament: PrismaTournament): TournamentRecord => ({
  id: tournament.id,
  createdById: tournament.createdById,
  name: tournament.name,
  code: tournament.code,
  venue: tournament.venue,
  startsAt: tournament.startsAt.toISOString(),
  endsAt: tournament.endsAt?.toISOString(),
  status: tournament.status
});

export const mapDivisionRecord = (division: PrismaDivision): DivisionRecord => ({
  id: division.id,
  tournamentId: division.tournamentId,
  name: division.name,
  gender: division.gender,
  ageGroup: division.ageGroup,
  weightClass: division.weightClass,
  sortOrder: division.sortOrder
});

export const mapTournamentEntryRecord = (entry: PrismaTournamentEntry): TournamentEntryRecord => ({
  id: entry.id,
  tournamentId: entry.tournamentId,
  divisionId: entry.divisionId,
  athleteId: entry.athleteId,
  organizationId: entry.organizationId,
  status: entry.status,
  seed: entry.seed ?? undefined,
  notes: entry.notes ?? undefined
});

type MatchParticipantLike = {
  firstName: string;
  lastName: string;
  organization?: PrismaOrganization | null;
};

type MatchWithDisplay = PrismaMatch & {
  bracket?: {
    tournamentId: string;
    tournament?: PrismaTournament | null;
    division?: PrismaDivision | null;
  } | null;
  homeAthlete?: MatchParticipantLike | null;
  awayAthlete?: MatchParticipantLike | null;
  winnerAthlete?: MatchParticipantLike | null;
};

export const mapAthleteRecordWithOrganization = (
  athlete: {
    id: string;
    userId: string | null;
    organizationId: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: Date;
    beltLevel: string | null;
    weightClassLabel: string;
    ageDivisionLabel: string;
    organization?: PrismaOrganization | null;
  }
): AthleteRecord => ({
  id: athlete.id,
  userId: athlete.userId ?? undefined,
  organizationId: athlete.organizationId,
  organizationName: athlete.organization?.name ?? undefined,
  firstName: athlete.firstName,
  lastName: athlete.lastName,
  gender: athlete.gender,
  birthDate: athlete.birthDate.toISOString().slice(0, 10),
  beltLevel: athlete.beltLevel ?? undefined,
  weightClassLabel: athlete.weightClassLabel,
  ageDivisionLabel: athlete.ageDivisionLabel
});

export const mapTournamentEntryRecordWithDisplay = (
  entry: PrismaTournamentEntry & {
    athlete?: MatchParticipantLike | null;
    organization?: PrismaOrganization | null;
  }
): TournamentEntryRecord => ({
  ...mapTournamentEntryRecord(entry),
  athleteName: entry.athlete ? `${entry.athlete.firstName} ${entry.athlete.lastName}` : undefined,
  organizationName: entry.organization?.name ?? undefined
});

export const mapMatchRecord = (match: PrismaMatch | MatchWithDisplay): MatchRecord => ({
  id: match.id,
  bracketId: match.bracketId,
  tournamentId: "bracket" in match ? match.bracket?.tournamentId ?? undefined : undefined,
  tournamentName: "bracket" in match ? match.bracket?.tournament?.name ?? undefined : undefined,
  tournamentCode: "bracket" in match ? match.bracket?.tournament?.code ?? undefined : undefined,
  divisionId: "bracket" in match ? match.bracket?.division?.id ?? undefined : undefined,
  divisionName: "bracket" in match ? match.bracket?.division?.name ?? undefined : undefined,
  roundNumber: match.roundNumber,
  matchNumber: match.matchNumber,
  status: match.status,
  homeAthleteName: "homeAthlete" in match && match.homeAthlete ? `${match.homeAthlete.firstName} ${match.homeAthlete.lastName}` : undefined,
  awayAthleteName: "awayAthlete" in match && match.awayAthlete ? `${match.awayAthlete.firstName} ${match.awayAthlete.lastName}` : undefined,
  winnerAthleteName: "winnerAthlete" in match && match.winnerAthlete ? `${match.winnerAthlete.firstName} ${match.winnerAthlete.lastName}` : undefined,
  homeOrganizationName: "homeAthlete" in match ? match.homeAthlete?.organization?.name ?? undefined : undefined,
  awayOrganizationName: "awayAthlete" in match ? match.awayAthlete?.organization?.name ?? undefined : undefined,
  winnerOrganizationName: "winnerAthlete" in match ? match.winnerAthlete?.organization?.name ?? undefined : undefined,
  scheduledAt: match.scheduledAt?.toISOString(),
  completedAt: match.completedAt?.toISOString(),
  homeAthleteId: match.homeAthleteId ?? undefined,
  awayAthleteId: match.awayAthleteId ?? undefined,
  winnerAthleteId: match.winnerAthleteId ?? undefined,
  homeEntryId: match.homeEntryId ?? undefined,
  awayEntryId: match.awayEntryId ?? undefined,
  winnerEntryId: match.winnerEntryId ?? undefined,
  nextMatchId: match.nextMatchId ?? undefined,
  nextMatchSlot: match.nextMatchSlot ?? undefined,
  sourceHomeMatchId: match.sourceHomeMatchId ?? undefined,
  sourceAwayMatchId: match.sourceAwayMatchId ?? undefined
});

export const mapMatchScoreEventRecord = (event: PrismaMatchScoreEvent): MatchScoreEventRecord => ({
  id: event.id,
  matchId: event.matchId,
  athleteId: event.athleteId ?? undefined,
  tournamentEntryId: event.tournamentEntryId,
  eventType: event.eventType,
  technique: event.technique,
  pointsAwarded: event.pointsAwarded,
  occurredAtSeconds: event.occurredAtSeconds,
  note: event.note ?? undefined,
  createdAt: event.createdAt.toISOString()
});

export const mapMatchDetailRecord = (
  match: PrismaMatch | MatchWithDisplay,
  scoreEvents: PrismaMatchScoreEvent[]
): MatchDetailRecord => ({
  ...mapMatchRecord(match),
  scoreEvents: scoreEvents
    .sort((left, right) => left.occurredAtSeconds - right.occurredAtSeconds || left.createdAt.getTime() - right.createdAt.getTime())
    .map(mapMatchScoreEventRecord)
});

export const mapBracketRecord = (
  bracket: PrismaBracket,
  matches: PrismaMatch[]
): BracketRecord => ({
  id: bracket.id,
  tournamentId: bracket.tournamentId,
  divisionId: bracket.divisionId,
  status: bracket.status,
  bracketSize: bracket.bracketSize,
  generatedAt: bracket.generatedAt?.toISOString(),
  matches: matches
    .sort((left, right) => left.roundNumber - right.roundNumber || left.matchNumber - right.matchNumber)
    .map(mapMatchRecord)
});
