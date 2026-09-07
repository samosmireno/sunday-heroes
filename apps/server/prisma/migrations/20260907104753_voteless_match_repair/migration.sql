/*
  One-off repair, no schema change.

  `markManOfTheMatch` aggregated `_max.rating` over the MatchPlayer rows whose
  rating is not null and stamped `isMotm` on everyone holding that maximum. A
  match that closed with no votes stored `rating` 0 for every player, so the
  maximum was 0 — not null, so the early return never fired — and the whole
  squad was crowned. `dashboard-player-stats-repo.ts` has been counting those
  into career MOTM totals ever since.

  Clear both columns on every MatchPlayer whose Match has no PlayerVote rows, so
  that afterwards there is one representation of "never rated" rather than two.
  Nulling the placeholder discards nothing: `calculatePlayerScore([], [])`
  returns 0 deterministically, so that stored 0 was never data — it was a
  placeholder for a computation with no input, and it is invisible on the wire
  because every transform coerces null back through the same function to 0.

  The second AND clause makes the statement self-limiting and its row count
  meaningful: matches in voting-disabled competitions never ran
  `calculateAndStoreMatchRatings`, so their rows are already null/false and are
  skipped. Replaying this file against an empty shadow database touches zero rows.
*/
UPDATE "MatchPlayer" mp
SET "isMotm" = false, "rating" = NULL
WHERE NOT EXISTS (
        SELECT 1 FROM "PlayerVote" pv WHERE pv."matchId" = mp."matchId"
      )
  AND (mp."isMotm" = true OR mp."rating" IS NOT NULL);
