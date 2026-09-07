/*
  One-off repair, no schema change.

  Until `63b7a61`, `VoteService.calculateAndStoreMatchRatings` read the match on
  a separate connection from the submit transaction that called it. Every match
  that closed on its last participant's own ballot was therefore rated from one
  ballot fewer than had been cast, and both sides of the fraction were wrong:
  `calculatePlayerScore` saw the `3(V-1)` vote rows committed before the
  transaction where `3V` had been cast. The numbers are final — `closeExpiredVoting`
  skips a match that is already CLOSED — so nothing has ever recomputed them.

  Nothing in the schema distinguishes a match closed by the submit path from one
  the nightly cron closed, and nothing needs to: recomputing a correctly rated
  match writes its own numbers back, so both statements below are self-limiting
  (`IS DISTINCT FROM`) and the first run's row count is the number of rows that
  were wrong. Replayed — against an empty shadow database, or a second time —
  both touch zero rows.

  Scope is every CLOSED match holding `PlayerVote` rows, because that is where
  the wrong numbers are. The submit path writes the ratings and closes the match
  in one transaction, so every match it rated is CLOSED. The cron rates and
  closes in two steps — `closeExpiredVoting` rates the whole expired batch, then
  updates their status — which leaves a window where a match is rated and still
  OPEN, but nothing in that window is wrong: the cron opens no transaction, so
  its read always saw the whole ballot set, and a match stranded there is rated
  again by the next run. The two matches this leaves out are left out
  deliberately.

  A match still OPEN, because rating it now would crown whoever leads mid-vote
  and the crown would stick: `markManOfTheMatch` only ever sets the flag, so the
  close that follows would stamp the real winner without taking this one off —
  the very defect the second statement is here to repair.

  A match with no ballots, because `20260907104753_voteless_match_repair` owns
  those rows and has already cleared them to `rating NULL, isMotm false`. The
  `EXISTS` in the second statement is load-bearing for the same reason: a
  voteless match has no maximum to compare against.
*/

-- The arithmetic is `calculatePlayerScore` (`src/utils/utils.ts`), operation for
-- operation, in the same IEEE doubles: `(received / cast) * 3`, then
-- `Math.round(x * 100) / 100`, which for a non-negative x is `floor(x + 0.5)`.
-- Not as an identity — `Math.round(0.49999999999999994)` is 0 where `floor`
-- makes it 1 — but on every pair this can produce: the two were swept against
-- each other over every (points received, votes cast) pair up to 900 votes
-- cast, 135,750 of them, and never once disagreed.
-- Deliberately not `ROUND(numeric, 2)`: exact decimal arithmetic disagrees with
-- the service where the division lands on a half, and 5 points of 24 cast is
-- one of those (0.625, which the service rounds up to 0.63 and a numeric
-- division rounds down to 0.62). The stored value is what the client reads —
-- every transform is `player.rating ?? calculatePlayerScore(...)`, so the column
-- wins wherever it is populated — and a repair that wrote a different number
-- from the one the service computes would just be a quieter version of this bug.
-- `test/closing-ballot-rating-repair.db.test.ts` pins the equivalence.
--
-- The `3` is `config.votes.maxVotesPerPlayer`. A player nobody voted for scores
-- 0, not null: `calculatePlayerScore` returns 0 for an empty received set, and
-- `COALESCE(..., 0)` reproduces that.
WITH totals AS (
  SELECT pv."matchId", COUNT(*)::float8 AS cast_votes
  FROM "PlayerVote" pv
  JOIN "Match" m ON m.id = pv."matchId"
  WHERE m."votingStatus" = 'CLOSED'
  GROUP BY pv."matchId"
),
received AS (
  SELECT "matchPlayerId", SUM("points")::float8 AS points
  FROM "PlayerVote"
  GROUP BY "matchPlayerId"
),
correct AS (
  SELECT mp.id,
         floor(
           (COALESCE(r.points, 0::float8) / t.cast_votes) * 3::float8 * 100::float8
           + 0.5::float8
         ) / 100::float8 AS rating
  FROM "MatchPlayer" mp
  JOIN totals t ON t."matchId" = mp."matchId"
  LEFT JOIN received r ON r."matchPlayerId" = mp.id
)
UPDATE "MatchPlayer" mp
SET "rating" = c.rating
FROM correct c
WHERE c.id = mp.id
  AND mp."rating" IS DISTINCT FROM c.rating;

-- The crown, recomputed across the whole match rather than stamped on the new
-- winner. `markManOfTheMatch` (`vote-service.ts:343`) only ever sets `isMotm`
-- true and never clears it, so a match whose maximum moved is carrying a stale
-- crown on a player who no longer holds it — and those rows feed career MOTM
-- totals through `dashboard-player-stats-repo.ts:65`.
--
-- True for every player holding the maximum, false for everyone else: a tie is
-- shared, not broken (CONTEXT.md, Man of the match), exactly as the service's
-- `updateMany({ where: { matchId, rating: maxRating } })` crowns jointly. The
-- one exception is the invariant the service holds: a maximum of 0 crowns
-- nobody. It reads the ratings the statement above just wrote, which is why the
-- two are one migration in this order.
WITH rated AS (
  SELECT mp.id,
         mp."rating",
         MAX(mp."rating") OVER (PARTITION BY mp."matchId") AS best
  FROM "MatchPlayer" mp
  JOIN "Match" m ON m.id = mp."matchId"
  WHERE m."votingStatus" = 'CLOSED'
    AND EXISTS (
          SELECT 1 FROM "PlayerVote" pv WHERE pv."matchId" = mp."matchId"
        )
),
crown AS (
  SELECT id, (best > 0::float8 AND "rating" = best) AS is_motm
  FROM rated
)
UPDATE "MatchPlayer" mp
SET "isMotm" = c.is_motm
FROM crown c
WHERE c.id = mp.id
  AND mp."isMotm" IS DISTINCT FROM c.is_motm;
