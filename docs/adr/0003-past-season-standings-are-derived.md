---
status: accepted
---

# Past-season standings are derived from completed matches

The Standings table lives as incrementally updated counters on `TeamCompetition`, one row per team per Competition, zeroed at each Start new season (ADR 0001). The seasons effort first ruled that a Past season's table would not be preserved; the selector UX ticket reversed that. We preserve it by **deriving** a Past season's table from that Season's Completed matches at read time, with the same ranking as the live table (points, goal difference, goals for, team name). The Current season keeps the counters. Nothing is stored per Past season.

## Considered options

- **Snapshot at rollover.** Copy the counters into a per-season table inside the rollover transaction, before zeroing. Preserves exactly what the screen showed, drift included, at the cost of a table, a migration and a rollover step.
- **Season-scope the counters.** Add `seasonId` to `TeamCompetition` and insert fresh zeroed rows at rollover. Reverses "only Match is season-scoped", changes the unique index, and touches every counter read and write, with no benefit for read-only seasons.
- **Derive from matches.** Chosen. No schema change, the rollover is untouched, and because Past seasons are read-only (ADR 0002) the derived table never moves.

## Consequences

- The standings read takes a season filter. For the Current season it returns the counters as today; for a Past season it computes the table from that Season's Completed matches; for All seasons it computes the all-time table from every Completed match of the Competition.
- The team set of a Past season is the Competition's teams, since teams are fixed across seasons; a renamed team shows its current name.
- A derived table shows the figures the matches support. Where the live counters had drifted (a known, separately tracked defect), a Past season's table can differ from what the live table showed on its last day. The derived figures are the correct ones.
- Deriving the Current season's table the same way, and retiring the counters, becomes possible later without a further model change. It is not part of the seasons effort.
- ADR 0002 gains a second reason: editing a Past season's Match would move its derived Standings.
