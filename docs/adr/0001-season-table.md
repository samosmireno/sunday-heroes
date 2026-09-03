---
status: accepted
---

# Seasons are a table, and every Match references one

Competition seasons need a number, a start date and an end date per season, and every Match must belong to exactly one. We store them as a `Season` table (`id`, `competitionId`, `number`, `startedAt`, `endedAt` nullable) with a required `Match.seasonId`, rather than as an integer stamped on `Match` from a counter on `Competition`. The table is the only shape that gives Past seasons' date ranges a home, and the migration research showed the cheaper alternative saved just one hand-edited migration file.

## Considered options

- **Integer column on Match** (`Match.season`), stamped from `Competition.currentSeason`, which already existed but was never read. A one-line migration. Rejected because past seasons' start and end dates have nowhere to live, and deriving them from match dates fails: league fixtures are created without a date, and a retroactively entered match would move a closed season's boundaries.
- **Season table** with a required foreign key from Match. Chosen.

## Consequences

- The **Current season** is derived, not pointed at: it is the Season row of a Competition whose `endedAt` is null. There is no `currentSeasonId` on Competition. Start new season is one transaction that stamps `endedAt` on the open row and inserts the next number with the same instant as `startedAt`.
- A **partial unique index** on `Season(competitionId) WHERE endedAt IS NULL` guarantees one open season per competition. The Prisma schema cannot declare it, so it is custom SQL in the migration. The engine shipped with Prisma 6.19 ignores partial indexes, so later `migrate dev` runs leave it alone. Prisma 7.4 and later both see partial indexes and can declare them in the schema, so an upgrade must redeclare it there or the next migration will drop it.
- Season dates are the **admin's acts**: season 1 starts at the Competition's `createdAt`; each rollover closes and opens at one timestamp. Match dates never set or move a season boundary.
- **Only Match is season-scoped.** `TeamCompetition` and `TeamRoster` stay competition-scoped: the standings counters hold the Current season's table and are zeroed in place at rollover and at reset, and rosters carry across seasons. A Past season's Standings are derived from its Matches, not stored (ADR 0003).
- **Reset competition** deletes all Matches and all Seasons, then creates a fresh season 1 at the reset instant. A League keeps its `TeamCompetition` rows with the counters zeroed, exactly as at rollover, so Teams setup pre-fills from them and regenerates season 1's Fixtures; deleting the rows, as the pre-seasons reset did, left a League with no teams and no way to add them. Teams setup copies the match type from the previous Season's Matches, and a reset leaves none, so a League's match type is also stored on `Competition.matchType`: written at League creation, and by the reset itself from the Matches it deletes for a League created before the column existed.
- **Creating a Competition creates season 1** in the same transaction. `Competition.trackSeasons` and `Competition.currentSeason` are dropped, together with their fields in the create-competition request and form.
- **Backfill**: one season 1 per existing Competition with `startedAt` equal to the Competition's `createdAt`, and every existing Match assigned to it, regardless of the stored `currentSeason` value.
- `Match.seasonId` cascades on delete, like every other relation in the schema. No code path deletes a single Season: only Reset competition deletes Seasons, all of a Competition's at once, and opens Season 1 in the same transaction.
