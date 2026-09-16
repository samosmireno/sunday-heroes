# Nothing derived is stored

Standings, head-to-head, the champion mark, ratings, crowns, the results breakdown, the turnout, the voting record, Form, streaks, Records, Honours, the Season summary, the played span, an Entry's Result, Qualified, and a competition's Active or Ended state are pure functions in the `domain` package over facts loaded from the database: Completed matches with their lineups and settings snapshots, closed votes with their ballots, Entries, Seasons, Memberships. They are computed on every read. The schema holds no counter, no stored rating, no crown flag and no cached table, and the first release has no cache at all.

## Why

The current app stores standings as counters and ratings at close, and both drifted: a delta applied outside the transaction, a counter never unwound, two repair migrations for ratings. The branch documents rely on derivation everywhere: a Correction changes history, a Player merge changes history, a Season reopened re-derives, and a match's rules never change after the fact. Volumes are a football group's; a few thousand matches derive in milliseconds.

## Consequences

A cache, if a measurement ever asks for one, wraps a loader in `server` and invalidates on the writes the spec lists (match, lineup, ballot, roster, Season and settings writes) without touching the engine. Every scope (a Season, All seasons, the Players page, the Player page, Your career) is the same function over a differently loaded set, so there is one arithmetic and it is unit-tested without a database.
