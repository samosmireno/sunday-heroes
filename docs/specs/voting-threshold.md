# Voting threshold — implementation spec

Hand-off document for the effort charted on [Voting threshold — wayfinder map](https://github.com/samosmireno/sunday-heroes/issues/36). Every decision below was settled on that map; this file assembles them against the code so one implementing agent can build the feature without re-reading five issue threads.

Vocabulary is already in `CONTEXT.md` under **Voting** — **Voting threshold**, **Eligible voter**, **Voting gate** (landed in `a98acb8`). Those entries are normative and need no amendment; read them first.

Provenance, for anything this file leaves ambiguous:

| Decision                                                 | Ticket                                                                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| What a blocked voter sees on all three surfaces          | [What a player who cannot vote yet sees](https://github.com/samosmireno/sunday-heroes/issues/37)                      |
| The form field, its bounds and its readout               | [How an admin sets the threshold and learns about the runway](https://github.com/samosmireno/sunday-heroes/issues/38) |
| The eligibility seam, the column, the caller table       | [Where eligibility is computed](https://github.com/samosmireno/sunday-heroes/issues/39)                               |
| Closure, pending counts, the voteless match, the repair  | [What closing voting means with a shrinking electorate](https://github.com/samosmireno/sunday-heroes/issues/40)       |
| The League ceiling line, and that nothing is error-grade | [Whether the threshold is reachable at all in a small League](https://github.com/samosmireno/sunday-heroes/issues/43) |

No ADR. The rule is reversible — drop the column and the feature is gone — and a future reader with this spec is not surprised by anything in the schema.

---

## 1. The rule

A Competition may carry a **Voting threshold** `X`: the number of **Completed** matches a player must have played **within a single Season** of that Competition before their ballot is accepted.

- `qualified` — **some** Season of the Competition has `count >= X` for that player. Never pooled across Seasons: 4 in Season 1 and 4 in Season 2 is not 8.
- `armed` — `X !== null && completedMatchCount >= 2X && at least one player is qualified`. `completedMatchCount` is Competition-wide and lifetime, across every Season.
- `canVote` — `!armed || qualified`.

Before the gate arms — **the runway** — every participant votes exactly as today. Runway matches count toward qualification like any other, so there is no grandfathering: the bar at arming is "played half the runway".

Once armed, an ineligible participant:

- cannot submit votes, **including through the ADMIN/MODERATOR on-behalf-of path**;
- receives neither the voting invitation nor the reminder email;
- **stays on the ballot** — can receive votes and be man of the match.

Eligibility is evaluated **live at submit time**, never snapshotted. Nothing is ever revoked retroactively. Reset competition wipes all qualification and disarms the gate, which is correct: Reset already means "this Competition never happened".

Arming is **monotonic** and happens at most once in a Competition's life (completed matches only accumulate; qualification is permanent). Reset is the only way back, and it disarms wholesale.

---

## 2. The promise, and the two visible deltas

The promise this feature makes to existing users:

> **No Competition acquires a threshold, no vote already cast is discarded, and no rating that any vote produced is ever changed.**

Three of the changes below are **not** threshold-specific — they fix behaviour for every Competition, including the ones with `votingThreshold` null. Gating them behind the flag was explicitly rejected: it would preserve a live bug for most of the fleet and make the League and Duel tables disagree with the dashboard for precisely the competitions _not_ using the feature.

Two deltas will therefore be visible on deploy. Name them in the release note so they are not mistaken for a regression:

1. **Voteless matches stop crowning the whole squad.** A match that closed with no votes stored `rating` 0 for everyone, and `markManOfTheMatch` then flagged `isMotm` on every player. Career MOTM counts fall to the truth.
2. **Competition-table rating averages stop counting voteless matches.** They move _up_, into agreement with the dashboard's SQL `AVG`, which already skipped them.

---

## 3. Schema and migrations

Two migrations, created and applied **only** through the compose database:

```bash
docker compose up -d
cd apps/server
npm run migrate:dev -- --create-only --name <name>   # write the file
npm run migrate:dev                                  # apply + regenerate the client
```

Never run `npx prisma migrate dev` directly — the developer `.env` holds the production `DATABASE_URL`; `migrate:dev` pins the run to compose through the harness's localhost guard. A migration merged to `main` reaches production minutes later, because the Render Docker `CMD` runs `prisma migrate deploy` on every deploy. **Rehearse both migrations against a restored production dump before merging** (restore into a scratch database on the compose Postgres, `migrate deploy`, check, drop).

### 3.1 `voting_threshold` — the column

On `Competition` (`apps/server/prisma/schema.prisma`), beside the existing `voting*` family:

```prisma
votingThreshold Int?
```

`Int?`-means-off matches `votingPeriodDays`. `null` = no gate. Chosen at creation, never edited (there is no competition-update endpoint at all today — see §10).

Add in the same migration, on `Match`:

```prisma
@@index([competitionId, isCompleted])
```

Today `Match` has only `@@index([competitionId])` and `@@index([seasonId])`. Both eligibility aggregates (§4.1) filter on exactly the `(competitionId, isCompleted)` pair, one of them from a cron that fans out across every competition with an expiring match. The index is purely additive and reversible; add it unless a measurement says otherwise.

### 3.2 `voteless_match_repair` — the one-off repair

A **separate** migration from the schema change, written by hand after `--create-only`. It clears the rows the live MOTM bug already produced:

> On every `MatchPlayer` whose `Match` has no `PlayerVote` rows: set `isMotm = false` and `rating = NULL`.

```sql
UPDATE "MatchPlayer" mp
SET "isMotm" = false, "rating" = NULL
WHERE NOT EXISTS (
        SELECT 1 FROM "PlayerVote" pv WHERE pv."matchId" = mp."matchId"
      )
  AND (mp."isMotm" = true OR mp."rating" IS NOT NULL);
```

Both columns, so that afterwards there is **one** representation of "never rated" rather than two. Nulling the placeholder discards nothing: `calculatePlayerScore([], [])` returns 0 deterministically, so that stored 0 was never data — it was a placeholder for a computation with no input. It is invisible on the wire, because every transform coerces `null` back through the same function to `0` (`match-transforms.ts:36`).

The second `AND` clause makes the statement self-limiting and its row count meaningful: matches in voting-disabled competitions never had `calculateAndStoreMatchRatings` run, so their rows are already `rating: null, isMotm: false` and are skipped.

This does **not** conflict with "nothing is ever revoked retroactively" — that rule protects the gate. A legitimately cast vote stands and qualification is never clawed back; it was never a promise to preserve rows that no vote produced.

---

## 4. Server

### 4.1 The eligibility seam

Three new files plus one addition to `SeasonRepo`. Eligibility is a property of `(player, Competition)` — a match contributes only its `competitionId` — so the **unit of computation is the Competition**, and N+1 stops being something callers have to remember to avoid.

#### `apps/server/src/utils/voting-eligibility.ts` — pure, no Prisma

Shaped like `utils/standings.ts`. Do **not** introduce a `domain/` tier; no such layer exists.

```ts
import { VoterEligibility } from "@repo/shared-types";

export class VotingEligibility {
  readonly armed: boolean;
  readonly currentSeasonNumber: number | null;
  /** Total: any id, always a valid record. */
  for(dashboardPlayerId: string): VoterEligibility;
}

export function buildVotingEligibility(input: {
  threshold: number | null;
  completedMatchCount: number; // lifetime, all Seasons
  currentSeason: { id: string; number: number } | null;
  participations: {
    dashboardPlayerId: string;
    seasonId: string;
    count: number;
  }[];
}): VotingEligibility;
```

The whole rule lives in the factory:

- `qualified` — some season has `count >= threshold`; `false` when `threshold === null`.
- `armed` — `threshold !== null && completedMatchCount >= 2 * threshold && someone qualified`.
- `canVote` — `!armed || qualified`.
- `matchesThisSeason` — the Current season's row for that player, or `0`.
- `remaining` — `threshold === null ? 0 : max(0, threshold - matchesThisSeason)`.

**`.for()` is total** — it takes any id and always returns a valid record: a player who never played this Competition, a Competition with no threshold, a Competition still on the runway. This is the point of the value object. There are seven call sites, one an email loop and one the closure condition; with a bare `Map` every one of them writes `map.get(id) ?? someDefault`, and one of them gets the default backwards and a player silently loses their vote.

**Only the Current season gets out.** The per-`(player, season)` breakdown stays inside — the factory needs it to answer `qualified` over any Season, but a "best past season" count would need its own name in `CONTEXT.md` and buys one sentence of copy.

**Voting on a Past-season match still reports Current-season progress.** Voting open when a Season closes runs on to its deadline, so this is reachable. `canVote` is unaffected either way (qualification is permanent and season-agnostic), a Past season's count can never change, and the season worth pointing at is the one the player can still earn it in.

#### `apps/server/src/repositories/voting-eligibility/voting-eligibility-repo.ts`

Its own folder: the query spans `MatchPlayer` and `Match` and belongs to neither's repo.

```ts
VotingEligibilityRepo.participationCounts(competitionIds: string[]):
  Promise<{ competitionId: string; dashboardPlayerId: string; seasonId: string; count: number }[]>

VotingEligibilityRepo.completedMatchCounts(competitionIds: string[]):
  Promise<Map<string, number>>
```

Both count `Match.isCompleted = true`, matching `CONTEXT.md`'s "only Completed matches count toward Standings and player stats".

Implementation note, not a decision: Prisma's `groupBy` only groups by scalar fields of the model being grouped, and `seasonId` lives on `Match`, not `MatchPlayer` — so `matchPlayer.groupBy` cannot produce these rows. Two precedents exist: `$queryRaw` with a real `GROUP BY` (`dashboard-player-stats-repo.ts`, three times, already joining `m."isCompleted" = true`), or `findMany` + count in JS (`competition-query-repo.ts:getAggregates`). `$queryRaw` is one round trip and a small result set; either is fine at this data size.

#### `apps/server/src/services/voting-eligibility-service.ts`

```ts
VotingEligibilityService.loadMany(competitionIds: string[]): Promise<Map<string, VotingEligibility>>
VotingEligibilityService.load(competitionId: string): Promise<VotingEligibility>  // one-liner over loadMany
```

`loadMany` is the real one, because `sendReminderEmails` walks `MatchRepo.findMatchesExpiringSoon()` over every expiring match **in the system** — an unbounded fan-out across competitions. Both aggregates take `IN (...)` without changing shape, so it is three queries regardless of how many competitions come back.

Fire in `Promise.all`: the new repo's two aggregates, `CompetitionRepo` for the thresholds, `SeasonRepo` for the Current seasons.

#### `SeasonRepo.findCurrentMany(competitionIds: string[])`

Add beside `findCurrent` in `apps/server/src/repositories/season/season-repo.ts` rather than duplicating the query in the new repo. Same `where: { competitionId: { in }, endedAt: null }`, returning `Season[]` or a `Map<competitionId, Season>`.

#### No `tx?` on the loader, and no cache

**No `tx?` parameter on `load`/`loadMany`** — a deliberate break from the repo convention, because of a visibility trap. `MatchCreationService.createMatch` creates a Duel match with `isCompleted: true` **and** its `MatchPlayer` rows inside a transaction, then calls `handleMatchVoting` still inside it. That match counts toward qualification, so a player whose Xth match is this one is eligible to vote on it — but only visibly so from inside the transaction. Each caller instead reads at a point where what it needs is committed (§4.2, §4.3).

**No cross-request cache.** Eligibility is live at submit time, and completing a match, adding a player and Reset would each need invalidation. The loaded object **is** the memo: callers hold it and pass it down.

#### The caller table

| Caller                                      | How it gets the object                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `VoteService.submitVotes`                   | `load` **before** opening the `$transaction`; passes it into `checkAndCloseVoting`                           |
| `VoteService.getVotingStatus`               | `load`                                                                                                       |
| `VoteService.getPendingVoters`              | **required parameter, no default**                                                                           |
| `VoteService.getMatchVotes`                 | `load`, threaded into `transformMatchServiceToPendingVotes`                                                  |
| `MatchVotingService.sendVotingEmails`       | `load` **inside the existing `setImmediate`**, which already runs after the transaction callback returns     |
| `MatchVotingService.sendReminderEmails`     | `loadMany` over the distinct `competitionId`s of `findMatchesExpiringSoon()`, once, up front                 |
| `MatchService.getMatchesForUser`            | `loadMany` over the distinct `competitionId`s of the page, threaded into `transformMatchesToMatchesResponse` |
| `DashboardService` → `extractDashboardData` | `loadMany`, threaded into the pure transform                                                                 |
| `calculatePendingVotes`                     | threaded in as a parameter (an addition to #39's original table)                                             |

`getPendingVoters` takes eligibility as a **required parameter with no default**. A default that loads its own is exactly how the N+1 gets reintroduced by the next caller.

### 4.2 `apps/server/src/services/vote-service.ts`

#### `submitVotes`

Load eligibility **before** `prisma.$transaction`, and reject an ineligible voter immediately after the existing `isParticipant` check (`vote-service.ts:41-49`) — before `canUserSubmitVotesForPlayer`, before the duplicate-vote read, before `validateVoteData`:

```ts
const eligibility = await VotingEligibilityService.load(match.competitionId);
if (!eligibility.for(voterId).canVote) {
  throw new VotingError(/* see copy below */);
}
```

"You have not played in this match" and "you cannot vote yet" are sibling rejections about standing; both fire before the vote data is validated. Placing this **before** the authorization check is what closes the ADMIN/MODERATOR on-behalf-of path: the gate is about `voterId`'s standing, not the requester's rights.

Pass the object into `checkAndCloseVoting`.

#### `getVotingStatus`

Stops throwing for an ineligible **participant**. A **non**-participant keeps today's `VotingError` verbatim — the read-only ballot is only for someone who played.

Return the ballot as today plus the viewer's standing:

```ts
return {
  matchId,
  votingOpen: match.votingStatus === "OPEN",
  votingEndsAt: match.votingEndsAt,
  hasVoted,
  eligibility: eligibility.for(voterId),          // VoterEligibility, always present
  seasonNumber: eligibility.currentSeasonNumber,  // number | null
  players: [...],                                 // unchanged
};
```

`seasonNumber` rides as a sibling field on this bespoke payload rather than inside `VoterEligibility`, because the vote page is the only surface that names the season and `VoterEligibility` crosses into two other response types that do not need it.

#### `getPendingVoters`

```ts
static async getPendingVoters(
  matchId: string,
  eligibility: VotingEligibility,
  tx?: Prisma.TransactionClient,
): Promise<string[]>
```

Filter participants through `.for(id).canVote` before subtracting those who have voted, and **thread `tx` into both repo reads** — `MatchPlayerRepo.getMatchPlayersFromMatch` (`match-player-repo.ts:45`) and `VoteRepo.getDistinctVotersByMatch` (`vote-repo.ts:166`) both already accept `tx?` and are simply never passed it.

#### `checkAndCloseVoting`

```ts
private static async checkAndCloseVoting(
  matchId: string,
  eligibility: VotingEligibility,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const pendingVoters = await this.getPendingVoters(matchId, eligibility, tx);
  if (pendingVoters.length === 0) { ... }
}
```

**The `- 1` is deleted, not adapted.** It existed only because the two reads ran on a separate connection and could not see the votes `VoteRepo.createMany(voteData, tx)` had just written, leaving the submitter counted as pending. Threading `tx` removes the cause. Keeping the `- 1` would work today but rests on an unwritten invariant — _"exactly one phantom pending voter, always the submitter"_ — that fails **closed and silently**: the symptom is a match that never auto-closes, indistinguishable from ordinary slow turnout. The next caller to reuse `checkAndCloseVoting` outside a submit transaction (`closeExpiredVoting` is the obvious candidate) would see the true count, subtract one, and never close anything.

#### `calculateAndStoreMatchRatings` and `markManOfTheMatch`

Two guards, at both levels:

```ts
// calculateAndStoreMatchRatings — no votes means nothing was rated
if (match.playerVotes.length === 0) return;

// markManOfTheMatch — nobody scored, nobody is man of the match
if (maxRating === null || maxRating === 0) return;
```

The first carries the meaning: `null` is _never rated_, `0` is _rated and received nothing_. A voteless match is the former, and this guard is the only thing that makes such a match distinguishable downstream at all.

The second is arithmetically redundant given the first — any vote row awards at least 1 point, so a match with votes always has a positive maximum. It stays anyway, because **two paths write ratings** (the submit-time close and `MatchVotingService.closeExpiredVoting`), and the invariant "a 0 maximum never crowns anyone" should hold whichever calls, and whatever a future caller does.

This is the live production bug from §2: `markManOfTheMatch` (`vote-service.ts:257`) aggregates `_max.rating` over rows where `rating` is not null; a voteless match stored `0` for everyone, so `maxRating` was `0` — not `null`, so the early return never fired — and `updateMany({ where: { matchId, rating: maxRating } })` set `isMotm: true` on the entire squad, which `dashboard-player-stats-repo.ts:65` has been counting into career MOTM totals ever since.

Leaving ratings `null` is wire-safe: `rating` is already `Float?`, `match-player-transforms.ts:20` already creates rows with `rating: null`, and every transform coerces on read. No response shape changes. The client already made this call — `match-details.tsx:83` guards its own top-player crown with `topPlayer.rating !== 0`; the server now agrees with it.

#### `getMatchVotes`

Load eligibility for `competitionInfo.id` and thread it into `transformMatchServiceToPendingVotes`.

### 4.3 `apps/server/src/services/match/match-voting-service.ts`

#### `sendVotingEmails`

Load **inside the existing `setImmediate`** (line 89), which already runs after the transaction callback returns — this is what makes the Duel timing safe (§4.1). Filter `dashboardPlayers` by `eligibility.for(player.id).canVote` alongside the existing email filter. `sendVotingEmails` needs the `competitionId`; pass it down from `handleMatchVoting` (it has `match.competitionId`).

#### `sendReminderEmails`

`loadMany` over the distinct `competitionId`s of `MatchRepo.findMatchesExpiringSoon()`, **once, up front**, before the loop. Then extend the `notVotedPlayers` filter (line 124) with `eligibilities.get(match.competitionId)!.for(mp.dashboardPlayer.id).canVote`.

#### `closeExpiredVoting`

Unchanged. It calls `calculateAndStoreMatchRatings`, which needs no eligibility.

**Arming mid-voting is left to this cron.** A match opens during the runway, A/B/C vote, D does not; the Competition then arms because some _other_ match completed, and D goes ineligible. The eligible electorate {A, B, C} is complete, but `checkAndCloseVoting` only runs on a submit and no further submit is coming. The nightly `closeExpiredVoting` (`0 0 * * *`, `match-expired-service.ts:8`) collects it at `votingEndsAt`.

This is accepted, and bounded: arming is monotonic and fires once per Competition lifetime, so the stranded window is the handful of matches open at that single instant, once, ever — and it self-heals. An eager sweep was rejected on merit, not cost: the electorate is **not** monotonically shrinking, because an ineligible participant who crosses the threshold mid-voting _joins_ it, and a "close as soon as all eligible have voted" sweep would slam the ballot shut on someone one match from qualifying who could legitimately still have voted before the deadline. Hooking arming onto `completeMatch`/`createMatch` was rejected too — write-triggers on two hot paths to buy a few days of tidiness for a once-per-competition event.

**Spec line:** a stranded match reads as `votingStatus: OPEN` with `pendingVotes: 0` — _"nothing more can arrive, waiting for the deadline"_, which is exactly the truth. The pending-votes change in §4.4 is what makes that readout honest.

### 4.4 `apps/server/src/utils/utils.ts`

#### `calculatePendingVotes(match, eligibility)`

```ts
export function calculatePendingVotes(
  match: MatchWithDetails,
  eligibility: VotingEligibility,
): number;
```

Count **eligible** non-voters only. It is the closure condition's twin, computed a second time without the filter — so today a match would advertise "2 votes pending" for two people who cannot vote and whose votes will never arrive, while the closure condition had already judged the electorate complete. During the runway `.for()` returns `canVote: true` for everyone, so the count is unchanged.

#### `calculatePlayerStats` (`utils.ts:72`) and `calculateLeaguePlayerStats` (`utils.ts:131`)

Both currently compute `sum(rating || 0) / matches`, dividing by **all** matches over ratings the transform already coerced to 0. The dashboard uses Prisma `_avg: { rating: true }` (`dashboard-player-stats-repo.ts:40`) and SQL `AVG()` skips `NULL` — so the same player's average differs between the dashboard and the competition table, and every voteless match drags the table figure toward zero. Pre-existing, but the gate turns voteless matches from an accident into a **designed outcome**, so a player in a small Duel would watch their rating fall for matches nobody was permitted to vote in.

Divide by **rated** matches instead. No new field is needed, because _a match had votes iff at least one player scored above zero_:

```ts
const matchHadVotes = match.players.some((p) => p.rating > 0);
```

Tally `ratedMatches` in the internal `PlayerTally` alongside `draws`, increment it only when `matchHadVotes`, strip it in the final `.map()` exactly as `draws` is stripped, and compute:

```ts
rating: ratedMatches > 0
  ? Math.round((player.rating! / ratedMatches) * 100) / 100
  : undefined,
```

`matches` and `winRate` keep dividing by **all** matches — this changes the rating divisor only. Returning `undefined` is already the behaviour for `matches === 0` and the client already handles it (`league/columns.tsx:177`, `league/top-performers.tsx:17`). No shared-types change, no wire change, no client change.

The in-band signal works identically on old and new data, which is why it was chosen over making `rating` nullable on the wire: a new voteless match stores `null` and the transform recomputes `calculatePlayerScore([], [])` → `0`; a historical one stores `0` directly. Both arrive as 0 and both are excluded. `rating: number | null` reaching the client was rejected — `match-details.tsx:119` calls `player.rating.toFixed(1)` unguarded and three other sites assume a number.

**No turnout floor.** `calculatePlayerScore` is already normalised: with `V` voters there are `3V` vote rows and a player taking first place on every ballot scores 3.0, whether `V` is 2 or 20. A thin electorate makes ratings _coarse_, not inflated. And this is not new — a ten-participant match where one person votes closes on that single ballot today. The gate changed who _may_ vote, not how many turn up.

### 4.5 Transforms

| Function                                                                                  | Change                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `match-transforms.ts:63` `transformMatchesToMatchesResponse(userId, matches)`             | takes `eligibilities: Map<competitionId, VotingEligibility>` and the **viewer's `dashboardPlayerId`**; passes eligibility to `calculatePendingVotes` and sets `viewerEligibility` on each `MatchPageResponse` |
| `votes-transforms.ts:6` `transformMatchServiceToPendingVotes(match, competition, userId)` | takes `eligibility: VotingEligibility`; sets `eligibility` on each `PendingVote` from `player.dashboardPlayerId`                                                                                              |
| `dashboard-transforms.ts:40` `extractDashboardData(competitions, matches)`                | takes `eligibilities: Map<competitionId, VotingEligibility>`; the `pendingVotes` reduce (line 54) filters participants by `canVote`                                                                           |

`transformMatchesToMatchesResponse` needs the viewer's `dashboardPlayerId`, not their `userId`. `MatchService.getMatchesForUser` (`match-service.ts:35`) already resolves `dashboardId`, so add one `DashboardPlayerRepo.findByUserId(userId, dashboardId)` there and pass the id down. Keep the existing `userId` parameter — `isAdmin` still compares against `dashboard.adminId`.

`transformDashboardCompetitionsToDetailedResponse` hardcodes `pendingVotes: comp.votingEnabled ? 0 : undefined` and needs no change.

### 4.6 Request schemas

`apps/server/src/schemas/create-competition-request-schema.ts` — add to the shared object:

```ts
votingThreshold: z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.number().int().min(1).max(50).optional(),
),
```

The `preprocess` matters: bare `z.coerce.number()` turns `""` into `0`, which trips `min(1)`. **The server must receive a number or no field at all, never `0`.** `createLeagueRequestSchema` (`league-schemas.ts:5`) intersects this object and inherits it for free.

No cross-field refinement. The threshold is optional even when `votingEnabled` is true, and nothing about it is error-grade (§5.1).

`apps/server/src/utils/competition-transforms.ts:149` `transformAddCompetitionRequestToService` — add `votingThreshold: competitionReq.votingThreshold ?? null` beside the other `voting*` fields.

---

## 5. Shared types

`packages/shared-types/src/voting.ts`:

```ts
export type VoterEligibility = {
  canVote: boolean; // the gate's answer; folds in arming
  qualified: boolean; // has reached X in some Season
  armed: boolean; // competition-level, carried per record
  threshold: number | null; // null = no gate
  matchesThisSeason: number; // Current season
  remaining: number;
};

export type PendingVote = {
  playerName: string;
  playerId: string;
  voted: boolean;
  isUser: boolean;
  eligibility: VoterEligibility; // new
};
```

`packages/shared-types/src/match.ts` — `MatchPageResponse` gains `viewerEligibility: VoterEligibility`.

**Always present, never optional.** `threshold: null` means no gate; the client branches on the value, never on the field's presence, or the `?? default` guesswork the value object removed on the server reappears at three call sites on the client. `remaining` is computed server-side so the arithmetic lives in one place, and `armed` rides inside the record rather than as a loose sibling flag on three response types. `MatchSeason` is the precedent for a small embedded type.

The client's three rules fall out as:

- blocked voter → `!canVote`
- "Not eligible yet" badge → `armed && !qualified`
- runway (render exactly as today, no badges at all) → `!armed`

**`packages/shared-types` must be rebuilt** (`npm run build` from the package or root) before client and server pick the change up.

---

## 6. Client

### 6.1 Create-competition form

`apps/client/src/features/create-competition-form/voting-section.tsx`, inside `VotingOptionsSection`.

**Placement.** Its own full-width row under a divider, **below** the Voting Period / Reminder days grid — not a third cell in the grid.

**Label** `Voting Threshold`, marked `(optional)`. It is a `CONTEXT.md` glossary term, so the domain word belongs in the label; the per-Season rule is carried by the readout, not the label.

**Default empty**, meaning no threshold. No suggested number is pre-filled: the rule cannot be changed after creation, so it must never arrive by default.

**Bounds 1–50**, integer.

**Empty must validate.** Same trap as the server: in `create-competition-schema.ts`, `z.coerce.number()` turns `""` into `0` and trips `min(1)`, silently disabling the submit button. Use the same `z.preprocess` mapping `""`/`null` to `undefined`. Add `shouldUnregister: true` to match the sibling fields, and map it in `transformCompetitionFormToRequest` (`create-competition-form/utils.ts`) as `votingThreshold: data.votingThreshold ?? undefined`.

#### The readout

Always visible whenever Voting is enabled, directly under the field.

**Empty:**

> No threshold. Everyone who played a match can vote on it, from the first match onwards.

The off-state is stated positively rather than being an absence.

**A number** — three things, all derived, none of them typed by the admin:

1. **The per-Season rule restated with their own number.** "A player who plays 5 matches in **one season** can vote — in that season and every season after it. Matches do not add up across seasons: 4 last season and 4 this season is still not enough."
2. **The runway as a bar** — `matches 1–10` (everyone votes) against `match 11 onwards` (threshold applies), derived as `2X`. The admin never computes `2X` themselves.
3. **The full arming condition in prose**, including that a player must also have qualified — and that this is deliberate, not a bug.

#### The League ceiling line

**One** derived advisory line, for a **League** only. `numberOfTeams` and `isRoundRobin` are two sections up in the same form and `LeagueService.generateRoundRobinMatches` generates the whole season's fixtures at creation, so the number is exact at form time:

- **ceiling** = `n - 1`, doubled for double round robin — a player rostered to one team can play only that team's fixtures.
- Stated as fact: _"With 4 teams, a player can play at most 3 matches in a season."_
- **Amber when X exceeds it. Submission still goes through.**

A **Duel** shows nothing: it has no fixture list, no team count and no ceiling, so the reachability question does not arise there.

**Nothing about the threshold is error-grade, and there is no confirm step** — no checkbox, no dialog. Two facts kill the hard-error case: the app does not actually hold the ceiling (`MatchPlayerService.createMatchPlayers` never consults `TeamRoster`, and the client's player picker searches the whole dashboard — see §10), and `numberOfTeams` is mutable after creation (add/remove team endpoints exist, and `LeagueService.generateCurrentSeasonFixtures` regenerates each new Season's fixtures from the team set as it stands). A hard error would block a value the app can make reachable two clicks later while permitting values it will happily leave unreachable. A confirm step is the same error said more quietly.

**`2X` needs no warning at all.** `2X <= season` gives `X <= n(n-1)/4`, which exceeds `n-1` for every `n >= 5` and equals it at `n = 4`; the arming rule binds tighter than the ceiling only at 3 teams, single round robin — the smallest League the form allows. And because the arming count is Competition-wide it accumulates across Seasons, so **`2X` delays arming and can never permanently prevent it.** Only the per-player ceiling is a permanent block.

### 6.2 Vote page — the fourth state

`apps/client/src/pages/vote-page.tsx`, `features/voting/`, `features/voting/hooks/use-voting-status.ts`.

A participant who has not reached the threshold is a **fourth** state alongside `hasVoted`, voting-closed and not-a-participant. It is **not** a full-page refusal:

- The ballot renders **read-only**: the match, both team columns, every player card disabled, the viewer among them.
- A **banner above it names the count** — the threshold, matches played in the Current season, how many remain, and that the count is per-Season and does not carry over. Use `seasonNumber` from the payload to name the season.
- The submit affordance is replaced by a lock line ("You can't submit votes yet"). **Back to Dashboard stays.**

Structure comes from prototype variant C (being locked out should read as _waiting your turn_, not as being thrown out); the copy comes from variant B (a number is actionable — "keep turning up" leaves a genuine newcomer unable to tell two matches from twenty).

A **silent gate was rejected**: silence produces "why can't I vote?" messages to the admin, which leaks the rule anyway and more expensively. The disclosure risk it bought is small — a brought-along friend still has to physically appear X times, and the _admin_ is the one who adds players to matches, so faking appearances needs the admin's cooperation, at which point the threshold was never the defence.

Update `use-voting-status.ts`'s local `VotingStatus` interface with `eligibility` and `seasonNumber`.

**Copy guidance — the banner's number is a live figure, not a promise.** Voting opens when a match is **created or edited**, never when it is completed (`handleMatchVoting` is called only from `MatchCreationService.createMatch` and `.updateMatch`; `LeagueService.completeMatch` does not touch voting). So the two competition types behave differently at exactly the moment it matters:

- **Duel** — created with `isCompleted: true` and voting opened in the same transaction. A player's Xth match makes them eligible to vote **on that very match**.
- **League** — the Fixture gets players and scores through `updateMatch` (voting opens, invitations go out) while `isCompleted` is still `false`; the admin flips it later via `completeMatch`. The match just invited to does not yet count, and the on-ballot counter ticks up whenever the admin gets round to pressing Complete — possibly mid-vote.

This asymmetry is accepted, not fixed: excluding the match under vote from its own count would need the match id threaded into what is otherwise a per-Competition load, which is the one thing holding the seam's shape together. Word the banner so a counter that moves under the reader is not a lie.

### 6.3 Matches list

`apps/client/src/features/matches/matches-list.tsx`, the Actions cell (line ~170).

- The vote affordance **stays** on a match the viewer played whose voting is `OPEN`, **disabled with a lock**, carrying the counter (`3/5 to vote`) from `match.viewerEligibility`. Tooltip spells out the per-Season rule.
- The **Voting Status badge is unchanged** — the pending count is the competition's business, not the viewer's.
- During the runway (`!armed`) the cell renders exactly as today.

### 6.4 Pending votes — the admin's on-behalf-of list

`apps/client/src/features/pending-votes/pending-votes-row.tsx` and `pending-votes-table.tsx` (`/pending/:matchId`).

- Ineligible players **stay listed**. Hiding them leaves the admin wondering where they went.
- Each row carries that player's Current-season progress from `vote.eligibility`: an **"Eligible"** badge for eligible players, the meter plus **"Not eligible yet"** in place of the Vote button for ineligible ones.
- Render as today when `!armed` — no badges at all during the runway.
- The row's existing `canVote` local (`pending-votes-row.tsx:26`) gains `&& vote.eligibility.canVote`.

No per-player admin override in this effort (see §10).

The dashboard `pendingVotes` **count** follows the list: a match a player can never vote on is not pending for them. That is §4.5's `extractDashboardData` change.

---

## 7. Test plan

Server tests sit next to the module under test: `foo.test.ts` for pure code (the `unit` project) and `foo.db.test.ts` against the compose Postgres (the `db` project, one file at a time). Factories in `apps/server/test/factories.ts` build state through the real services and use raw Prisma only for leaf state.

### `unit`

**`src/utils/voting-eligibility.test.ts`** — the rule, by handing `buildVotingEligibility` arrays. This is where the bulk of the coverage lives.

- `threshold: null` → `armed: false`, `canVote: true` for everyone, `remaining: 0`.
- Per-Season counting: 4 in Season 1 + 4 in Season 2 with `X = 5` → `qualified: false`. 5 in Season 1 → `qualified: true`.
- Arming boundary: `completedMatchCount` at `2X - 1`, `2X`, `2X + 1`, each crossed with "someone qualified" true and false. `armed` requires **both**.
- `canVote` during the runway for a player with zero matches.
- Permanence: qualified in a closed Season, zero matches in the Current one → `canVote: true`, `matchesThisSeason: 0`.
- `.for()` totality: an id that appears in no participation row.
- `currentSeason: null`.
- `matchesThisSeason` / `remaining` arithmetic, including `remaining: 0` when over the threshold.

**`src/utils/utils.test.ts`** (or alongside) — `calculatePendingVotes` with a stub `VotingEligibility`; `calculatePlayerStats` and `calculateLeaguePlayerStats` for the `ratedMatches` divisor, including a player whose every match was voteless (`rating: undefined`), a mix of rated and voteless, and that `winRate` still divides by all matches.

**`src/utils/match-transforms.test.ts` / `dashboard-transforms.test.ts` / `votes-transforms.test.ts`** — the eligibility record reaches the wire on all three response types, and the runway case is byte-identical to today's output.

**Client** (`apps/client`, Vitest) — the create-competition schema: `""` validates and produces `undefined`; `0` is rejected; `51` is rejected; `5` passes. The readout's derived arithmetic (runway `2X`, League ceiling `n-1` doubled for double round robin, amber-over-ceiling) as pure functions. Testing Library renders of the fourth vote-page state, the disabled matches-list affordance and the pending-votes badges, stubbing axios at the HTTP boundary with `apps/client/src/test/harness.tsx`.

### `db`

**`src/repositories/voting-eligibility/voting-eligibility-repo.db.test.ts`** — the two aggregates: counts grouped per `(competition, player, season)`; only `isCompleted: true` counted; `IN (...)` over several competitions in one call; a competition with no matches.

**`src/services/vote-service.db.test.ts`** — the rule end to end:

- **The arming boundary.** Build a Competition to `2X - 1` completed matches with a qualified player: an unqualified participant still votes. Complete one more: the same submit now throws `VotingError`.
- **The per-Season count.** A player with `X - 1` in the Current season and `X` in a closed Season votes; a player with `X - 1` in each of two Seasons does not.
- **The admin on-behalf-of path.** An ADMIN submitting for an ineligible player is rejected, and the error is the eligibility `VotingError`, not `AuthorizationError` — i.e. the gate fires before the authorization check.
- **Closure.** A match whose only remaining non-voters are ineligible closes on the last eligible submit (`pendingVoters.length === 0`), which is also the regression test for the deleted `- 1`: it must close inside the submit transaction.
- **The stranded match.** Arm the Competition mid-voting; the open match stays `OPEN`, and its response reads `pendingVotes: 0`.
- **The voteless match.** Close voting at the deadline with no votes: every `MatchPlayer` ends `rating: null, isMotm: false`, and no rating is written.
- **Reset.** After Reset the gate is disarmed and every participant can vote again.

**`prisma/migrations/…voteless_match_repair.db.test.ts`** (or a repo-level equivalent) — seed a voteless match with `isMotm: true, rating: 0` on every player plus a voted match, run the repair SQL, assert the voteless rows are cleared and the voted match is untouched. Also assert it is a no-op on rows already `null`/`false`.

**`src/services/match/match-voting-service.db.test.ts`** — the invitation and reminder loops skip ineligible players; `sendReminderEmails` issues one `loadMany` for matches spanning several competitions rather than one load per match.

### Before merge

```bash
npm run lint
npm run check-types
npm run test
```

Plus the production-dump rehearsal for both migrations (§3).

---

## 8. Build order

1. `packages/shared-types` — `VoterEligibility`, `PendingVote.eligibility`, `MatchPageResponse.viewerEligibility`; build the package.
2. Schema migration (`votingThreshold`, the `Match` composite index).
3. The seam: `utils/voting-eligibility.ts` + its unit tests, then the repo, then the service, plus `SeasonRepo.findCurrentMany`.
4. `vote-service.ts` — the gate, `getPendingVoters`, `checkAndCloseVoting`, the two rating guards.
5. `utils.ts` — `calculatePendingVotes`, the two `ratedMatches` divisors.
6. Transforms and their callers.
7. `match-voting-service.ts` — the two email paths.
8. Request schemas and `transformAddCompetitionRequestToService`.
9. Client: form field and readout; then the three blocked-voter surfaces.
10. The repair migration, rehearsed against a production dump.
11. Re-read the `CONTEXT.md` **Voting** entries against the finished code. They are expected to still read true; do not rewrite them.

### Landed early, on `main`, before the feature

The parts of this spec that never mention `votingThreshold` shipped ahead of it, as [Every player is marked man of the match when voting expires with no votes](https://github.com/samosmireno/sunday-heroes/issues/42) — they fix live behaviour for every Competition, and §2 had already ruled out gating them behind the flag. An implementing agent should expect to find them already done:

| Step | What landed                                                                                              | What is still open in that step                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 4    | The two rating guards in `calculateAndStoreMatchRatings` and `markManOfTheMatch` (§4.2)                  | The gate in `submitVotes`, `getPendingVoters`, `checkAndCloseVoting` and the deleted `- 1`, `getVotingStatus`, `getMatchVotes` |
| 5    | The `ratedMatches` divisor in `calculatePlayerStats` and `calculateLeaguePlayerStats` (§4.4)             | `calculatePendingVotes(match, eligibility)`                                                                                    |
| 10   | `20260907104753_voteless_match_repair` (§3.2), rehearsed against a restored production dump and deployed | —                                                                                                                              |

So the repair migration is **out of order relative to the schema migration**: it is on `main` and in production, and `20260903110459_competition_match_type` is the migration before it. The `votingThreshold` column and the `Match` composite index of step 2 are still to be written, and will simply come after it.

Both §2 deltas are therefore already visible in production; do not name them again in the feature's release note. The rehearsal found 60 rows across 6 voteless matches, 5 of which had their whole 10-player squad crowned; MOTM rows fell 147 → 97.

The tests those steps called for are in place: `src/utils/utils.test.ts` for both divisors, the voteless close in `src/services/vote-service.db.test.ts`, and `test/voteless-match-repair.db.test.ts`, which reads the repair SQL out of the migration file. Everything else in §7 is still to be written.

---

## 9. Out of scope

Ruled out on the map. Do not drift into these:

- **Editing voting settings after creation.** There is no competition-update endpoint at all (`CompetitionService` has create / reset / delete; `competition-settings.tsx` renders only SeasonCard / Reset / Delete). Building one drags in `votingPeriodDays` and `reminderDays` and each of their mid-flight semantics.
- **Excluding ineligible players from the ballot.** A different and harsher feature: the problem here is who _gives_ votes, not who receives them.
- **A minimum-turnout floor for storing ratings.** §4.4.
- **Making a League's match players respect the team roster.** `MatchPlayerService.createMatchPlayers` never consults `TeamRoster` and the client's player picker searches the whole dashboard, so the `n-1` ceiling is intent rather than something the app enforces. Filed separately as [A League match never checks its players against the team roster](https://github.com/samosmireno/sunday-heroes/issues/45).
- **A per-player admin override** to rescue someone the rule locks out. Parked, not rejected.
- **The veteran-group hole** — an established group starting a _fresh_ Competition votes ungated through the whole runway. Accepted for now; revisit once the feature has been used.
