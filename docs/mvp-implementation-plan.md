# MVP Implementation Plan

## Why this structure

- `npm` workspaces: stable, available in the current environment, and simple for a fresh monorepo.
- `apps/web`: Next.js App Router for clearly separated admin, manager, athlete, and public entry points.
- `apps/api`: NestJS backend for tournament operations, bracket logic orchestration, and future mobile API reuse.
- `packages/*`: shared roles, route metadata, bracket logic, and UI primitives to keep web/mobile expansion possible.

## Auth decision

- Initial choice: **Clerk**.
- Reason: the product needs role-separated web access now, but also future mobile clients and a standalone NestJS API. Clerk gives hosted identity, frontend SDKs, server token verification, and a cleaner multi-client path than keeping auth tightly coupled to Next.js sessions.
- Implementation approach: keep the domain auth-agnostic behind `AuthPrincipal` and role checks so Auth.js remains swappable if product constraints change.

## MVP build order

1. Monorepo scaffold and shared packages
2. Role-separated web routes and layouts
3. Prisma domain schema
4. API modules for organizations, athletes, tournaments, brackets, matches
5. Single-elimination bracket generation logic
6. Same-organization first-round avoidance and bye handling
7. Match result submission + event-based score recording
8. Winner propagation to next round
9. Public read-only access by code/share link
10. Athlete match-history views
11. PDF/print-friendly bracket surface

## DB modeling priority

1. Auth and access boundary: `User`, `UserRole`, `Organization`, `OrganizationMembership`
2. Competition actors: `Athlete`, `Tournament`, `Division`, `TournamentEntry`
3. Bracket execution: `Bracket`, `BracketRound`, `Match`, `MatchParticipantSlot`
4. Match history: `MatchScoreEvent`
5. Public access: `ShareLink`, `TournamentAccessCode`

## First implementation target

- Establish the scaffold and core bracket domain logic first.
- That unlocks both admin operations and read-only public/athlete flows without reworking the data model later.
