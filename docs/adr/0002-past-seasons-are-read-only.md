---
status: accepted
---

# Past seasons are read-only

Once Start new season closes a Season, none of its Matches can be edited, completed or deleted, for League and Duel alike. League Standings are an incrementally updated counter that is zeroed at each rollover, so any later write to a Past season's Match would either corrupt the Current season's table (an edit applies a score delta, a completion adds a result) or create a completed-but-never-counted Match. Refusing the writes outright is the only rule that needs no reconciliation logic, and it matches the glossary: a Past season's Matches are history.

## Considered options

- **Skip the standings write when the Match is not in the Current season.** Keeps Past seasons editable, but a Match completed after its Season closed would never count toward Standings or player stats, and an edited score would silently diverge from what the table once showed.
- **Read-only for League only, editable for Duel.** Duel has no Standings, so its Matches could be edited safely. Rejected for having two rules where one will do; Duel gains nothing it needs.
- **Read-only for both.** Chosen.

## Consequences

- The three write paths (update, complete, delete) refuse a Match whose Season has `endedAt` set, with a conflict error. The client hides the corresponding actions and shows the Season as closed.
- Voting is not a Match write. Voting open at rollover runs on to its deadline and its ratings are stored as they would have been.
- A Fixture that is not completed when its Season closes stays not completed forever and never counts toward player stats. The Start new season dialog states the count so the admin can complete them first.
- Fixtures are never deleted at rollover; a not-completed Fixture stays in the Past season as it is.
- Allowing edits to Past seasons later would require a Standings recompute path, which the codebase does not have.
