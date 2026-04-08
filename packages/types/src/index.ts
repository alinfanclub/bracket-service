export const userRoles = ["MASTER", "ADMIN", "MANAGER", "ATHLETE"] as const;
export type UserRole = (typeof userRoles)[number];

export const organizationTypes = ["SCHOOL", "DOJO", "CLUB"] as const;
export type OrganizationType = (typeof organizationTypes)[number];

export const tournamentStatuses = ["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED"] as const;
export type TournamentStatus = (typeof tournamentStatuses)[number];

export const entryStatuses = ["PENDING", "CONFIRMED", "WITHDRAWN"] as const;
export type EntryStatus = (typeof entryStatuses)[number];

export const bracketStatuses = ["DRAFT", "READY", "IN_PROGRESS", "COMPLETED"] as const;
export type BracketStatus = (typeof bracketStatuses)[number];

export const matchStatuses = ["PENDING", "READY", "IN_PROGRESS", "COMPLETED", "BYE"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const scoreEventTypes = ["IPPON", "WAZA_ARI", "YUKO", "SHIDO", "PENALTY", "OTHER"] as const;
export type ScoreEventType = (typeof scoreEventTypes)[number];

export interface AuthPrincipal {
  userId: string;
  role: UserRole;
  organizationIds: string[];
  organizationRoles: Partial<Record<string, UserRole>>;
  athleteId?: string;
}

export interface AthleteSeed {
  entryId: string;
  athleteId: string;
  athleteName: string;
  organizationId: string;
  organizationName: string;
  seed?: number;
}

export interface GeneratedMatchSlot {
  slotIndex: number;
  entryId: string | null;
  athleteId: string | null;
  athleteName: string | null;
  organizationId: string | null;
}

export interface GeneratedMatch {
  roundNumber: number;
  matchNumber: number;
  status: MatchStatus;
  home: GeneratedMatchSlot;
  away: GeneratedMatchSlot;
  winnerEntryId: string | null;
  sourceMatchHomeId?: string;
  sourceMatchAwayId?: string;
}

export interface GeneratedBracket {
  size: number;
  rounds: number;
  matches: GeneratedMatch[];
}

export interface MatchResultSubmission {
  matchId: string;
  winnerEntryId: string;
  completedAt: string;
  scoreEvents: MatchScoreEventDraft[];
}

export interface MatchScoreEventDraft {
  entryId: string;
  eventType: ScoreEventType;
  technique: string;
  pointsAwarded: number;
  occurredAtSeconds: number;
  note?: string;
}

export interface TournamentSummary {
  id: string;
  name: string;
  code: string;
  status: TournamentStatus;
  venue: string;
  startsAt: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  code: string;
  type: OrganizationType;
}

export interface CreateOrganizationInput {
  name: string;
  code: string;
  type: OrganizationType;
}

export interface AthleteRecord {
  id: string;
  userId?: string;
  organizationId: string;
  organizationName?: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  beltLevel?: string;
  weightClassLabel: string;
  ageDivisionLabel: string;
}

export interface CreateAthleteInput {
  userId?: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  beltLevel?: string;
  weightClassLabel: string;
  ageDivisionLabel: string;
}

export interface UpdateAthleteInput {
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  beltLevel?: string;
  weightClassLabel?: string;
  ageDivisionLabel?: string;
}

export interface TournamentRecord extends TournamentSummary {
  createdById: string;
  endsAt?: string;
}

export interface CreateTournamentInput {
  name: string;
  venue: string;
  startsAt: string;
  endsAt?: string;
}

export interface DivisionRecord {
  id: string;
  tournamentId: string;
  name: string;
  gender: string;
  ageGroup: string;
  weightClass: string;
  sortOrder: number;
}

export interface CreateDivisionInput {
  name: string;
  gender: string;
  ageGroup: string;
  weightClass: string;
  sortOrder?: number;
}

export interface TournamentEntryRecord {
  id: string;
  tournamentId: string;
  divisionId: string;
  athleteId: string;
  athleteName?: string;
  organizationId: string;
  organizationName?: string;
  status: EntryStatus;
  seed?: number;
  notes?: string;
}

export interface CreateTournamentEntryInput {
  divisionId: string;
  athleteId: string;
  organizationId: string;
  seed?: number;
  notes?: string;
}

export interface MatchRecord {
  id: string;
  bracketId: string;
  tournamentId?: string;
  tournamentName?: string;
  tournamentCode?: string;
  divisionId?: string;
  divisionName?: string;
  roundNumber: number;
  matchNumber: number;
  status: MatchStatus;
  homeAthleteName?: string;
  awayAthleteName?: string;
  winnerAthleteName?: string;
  homeOrganizationName?: string;
  awayOrganizationName?: string;
  winnerOrganizationName?: string;
  scheduledAt?: string;
  completedAt?: string;
  homeAthleteId?: string;
  awayAthleteId?: string;
  winnerAthleteId?: string;
  homeEntryId?: string;
  awayEntryId?: string;
  winnerEntryId?: string;
  nextMatchId?: string;
  nextMatchSlot?: number;
  sourceHomeMatchId?: string;
  sourceAwayMatchId?: string;
}

export interface MatchScoreEventRecord {
  id: string;
  matchId: string;
  athleteId?: string;
  tournamentEntryId: string;
  eventType: ScoreEventType;
  technique: string;
  pointsAwarded: number;
  occurredAtSeconds: number;
  note?: string;
  createdAt: string;
}

export interface MatchDetailRecord extends MatchRecord {
  scoreEvents: MatchScoreEventRecord[];
}

export interface BracketRecord {
  id: string;
  tournamentId: string;
  divisionId: string;
  status: BracketStatus;
  bracketSize: number;
  generatedAt?: string;
  matches: MatchRecord[];
}

export interface PublicTournamentView {
  tournament?: TournamentRecord;
  divisions: DivisionRecord[];
  entries: TournamentEntryRecord[];
  brackets: BracketRecord[];
}

export interface AthleteMatchHistoryRecord {
  athlete: AthleteRecord;
  matches: MatchDetailRecord[];
}

export interface ShareLinkRecord {
  id: string;
  tournamentId: string;
  slug: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateShareLinkInput {
  tournamentId: string;
  expiresAt?: string;
}

export interface PublicShareLinkView {
  tournament?: PublicTournamentView;
}
