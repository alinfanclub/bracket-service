-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MASTER', 'ADMIN', 'MANAGER', 'ATHLETE');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('SCHOOL', 'DOJO', 'CLUB');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BracketStatus" AS ENUM ('DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'BYE');

-- CreateEnum
CREATE TYPE "MatchScoreEventType" AS ENUM ('IPPON', 'WAZA_ARI', 'YUKO', 'SHIDO', 'PENALTY', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "externalAuthId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryRole" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "beltLevel" TEXT,
    "weightClassLabel" TEXT NOT NULL,
    "ageDivisionLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "weightClass" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'PENDING',
    "seed" INTEGER,
    "checkInAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bracket" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "status" "BracketStatus" NOT NULL DEFAULT 'DRAFT',
    "bracketSize" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "homeAthleteId" TEXT,
    "awayAthleteId" TEXT,
    "winnerAthleteId" TEXT,
    "homeEntryId" TEXT,
    "awayEntryId" TEXT,
    "winnerEntryId" TEXT,
    "nextMatchId" TEXT,
    "nextMatchSlot" INTEGER,
    "sourceHomeMatchId" TEXT,
    "sourceAwayMatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScoreEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "athleteId" TEXT,
    "tournamentEntryId" TEXT NOT NULL,
    "eventType" "MatchScoreEventType" NOT NULL,
    "technique" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "occurredAtSeconds" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentAccessCode" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentAccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_userId_organizationId_key" ON "OrganizationMembership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_code_key" ON "Tournament"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_divisionId_athleteId_key" ON "TournamentEntry"("divisionId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_divisionId_key" ON "Bracket"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_bracketId_roundNumber_matchNumber_key" ON "Match"("bracketId", "roundNumber", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_slug_key" ON "ShareLink"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentAccessCode_code_key" ON "TournamentAccessCode"("code");

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeAthleteId_fkey" FOREIGN KEY ("homeAthleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayAthleteId_fkey" FOREIGN KEY ("awayAthleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerAthleteId_fkey" FOREIGN KEY ("winnerAthleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeEntryId_fkey" FOREIGN KEY ("homeEntryId") REFERENCES "TournamentEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayEntryId_fkey" FOREIGN KEY ("awayEntryId") REFERENCES "TournamentEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerEntryId_fkey" FOREIGN KEY ("winnerEntryId") REFERENCES "TournamentEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sourceHomeMatchId_fkey" FOREIGN KEY ("sourceHomeMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sourceAwayMatchId_fkey" FOREIGN KEY ("sourceAwayMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreEvent" ADD CONSTRAINT "MatchScoreEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreEvent" ADD CONSTRAINT "MatchScoreEvent_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreEvent" ADD CONSTRAINT "MatchScoreEvent_tournamentEntryId_fkey" FOREIGN KEY ("tournamentEntryId") REFERENCES "TournamentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentAccessCode" ADD CONSTRAINT "TournamentAccessCode_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
