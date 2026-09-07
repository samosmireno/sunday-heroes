# Voting threshold — execution stages

How to run the tickets of [`voting-threshold.md`](./voting-threshold.md) as parallel lanes. The tickets are #46–#56, plus #57, found while building #46 and folded in below. Their blocking edges are wired as GitHub issue dependencies, so `issue_dependencies_summary.blocked_by` is the live gate. This file is about something the dependency graph does not say: which unblocked tickets can safely run **at the same time**, in separate worktrees, without colliding at merge.

## The constraint

`apps/server/src/services/vote-service.ts` is touched by six of the twelve tickets — #46 (`getPendingVoters`, `checkAndCloseVoting`), #50 (`submitVotes`), #51 (those two plus `submitVotes`), #52 (`getVotingStatus`), #54 (`getMatchVotes`), #57 (`calculateAndStoreMatchRatings`). That file is the serialization spine of the whole effort. Everything else fans out freely.

No two of those want the same **method**, which is why the file serializes the effort without any lane having to negotiate a hunk. The spine is a scheduling constraint, not a design one.

Two smaller collisions: `packages/shared-types/src/voting.ts` (#49 creates `VoterEligibility`, #54 extends `PendingVote`) and `apps/client/src/features/create-competition-form/voting-section.tsx` (#47 adds the field, #48 adds the readout). Both are sequential in the graph already, so neither is a live hazard.

## Stages

| Stage | Lanes           | Why they do not collide                                                                                                                                                                                                                     |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 ✅  | #46 ‖ #47       | `vote-service.ts` against the schema, request schema and create-competition form. No shared file. **Landed** — `9860155`, `e948614`, review follow-up `2f0a43b`.                                                                            |
| 2 ✅  | #49 ‖ #48 ‖ #57 | The seam is server plus `shared-types/voting.ts`; the readout is `voting-section.tsx` plus a derived-arithmetic module; #57 is `vote-service.ts` alone. Disjoint. **Landed** — `63b7a61`, `68a87f7`, `d58ec92`, review follow-up `47aabbc`. |
| 3 ✅  | #50 ‖ #53 ‖ #55 | Three disjoint sets: `submitVotes`; the transforms, `utils.ts`, match and dashboard services and `matches-list.tsx`; `match-voting-service.ts`. **Landed** — `7f63f2d`, `5317256`, `da6104f`, review follow-up `4556c75`.                   |
| 4     | #52 ‖ #54       | Different `vote-service.ts` methods, different client features, different shared-types files.                                                                                                                                               |
| 5     | #51             | Solo — see below.                                                                                                                                                                                                                           |
| 6     | #56             | Solo, on merged `main`.                                                                                                                                                                                                                     |

Stage 3 inherits one thing from stage 2 worth knowing: `VoterEligibility.remaining` is `max(0, threshold - matchesThisSeason)` regardless of `qualified`, so a player who qualified in a closed Season and has played nothing this Season reports a non-zero `remaining` while `canVote` is `true`. That is §4.1's literal formula and the seam keeps it. The client rule that guards it is `armed && !qualified` — the copy lanes (#52, #53, #54) must not render `remaining` on its own.

Stage 3 is the cleanest wave in the set: three lanes with no shared file at any point. #55 (`match-voting-service.ts`) is the only ticket in the whole effort that shares no file with any other.

### What stage 3 hands to #54 and #56

Two things the stage-3 review turned up that are real but belong to a later ticket, recorded here so they are not rediscovered:

**The matches-list affordance is the only route to `/pending/:matchId`.** `app.tsx` maps that path to `AdminPendingVotes`, and nothing else in the client navigates to it. Gating the button on the viewer's own `canVote` therefore took the on-behalf-of page away from an admin, which `4556c75` fixed by keeping the live link whenever `isAdmin`. What remains is narrower: §6.3 scopes the lock to _"a match **the viewer played**"_, and the cell has never known who played — it shows the affordance on any open match. So a non-admin viewer who did not play an armed Competition's match sees a Current-season counter on a match they were never on. Harmless today (see below), and the fix belongs with #54, which owns the destination page: either put the viewer's participation on the wire, or drop the lock for a non-participant.

**The All Matches page is admin-only today.** `MatchService.getMatchesForUser` resolves its dashboard through `DashboardService.getDashboardIdFromUserId` → `DashboardRepo.findByAdminId`, so a plain PLAYER hitting it gets `NotFoundError("Dashboard")` — even though `MatchRepo.findByUserWithDeduplication` carries a "matches this user played in" branch that implies otherwise. That is pre-existing and outside this effort, but it is why the paragraph above is harmless for now, and it caps how much of #53's client half is reachable at all. Worth confirming at #56 before declaring the gate's third surface done.

### #57 goes in stage 2, and only stage 2

#57 (the closing ballot dropped from the ratings it closes on) is blocked by nothing — it wants neither the threshold column nor the eligibility seam — so the graph will never schedule it. It has to be placed by hand, and stage 2 is the only place it fits.

**Stage 2 is the one wave where nothing wants `vote-service.ts`.** #49 builds the eligibility seam with nothing yet calling it, and #48 is client-only. Every other wave has a lane on the spine: #46 in stage 1, #50 in 3, #52 and #54 in 4, #51 in 5. Put #57 anywhere else and it either waits for stage 6 or contends for the file.

**It is one file.** `vote-service.ts` plus its db test. `closeExpiredVoting` calls `calculateAndStoreMatchRatings(match.id)` with no transaction client, so the `tx || prisma` fallback preserves that path byte for byte — `match-voting-service.ts` needs no change and #55 is untouched.

**Going early is worth more than convenience.** #51's acceptance criteria include a db test that a match "closes on the last eligible submit, inside the submit transaction". Written on top of the unfixed bug, that test either asserts bare counts — which is what let this bug live through #46's closure tests — or pins rating values computed one ballot short, codifying it. Landing #57 in stage 2 means every closure test written after it is written against correct arithmetic, and #50 and #51 inherit a `calculateAndStoreMatchRatings` that means what it says.

Method-level, #57 owns `calculateAndStoreMatchRatings` and no other ticket touches it. #51 rewrites its caller, `checkAndCloseVoting` — adjacent, and trivially rebaseable in either order, but before is strictly better than after.

### Stage 4 is hygiene, not a dependency

#52 and #54 are blocked only by #49 and could technically join stage 3. They sit after #50 so that `vote-service.ts` already carries the established idiom — load the eligibility object before the transaction, ask `eligibility.for(id).canVote` — and its import line, instead of three lanes each inventing a convention and colliding on the import block.

Running all five in one wave works. Merge them one at a time with a rebase between, and accept that whichever lands first sets the pattern the others conform to.

## Better alone

**#49, the eligibility seam.** Five downstream tickets consume its interface, so a lane that guesses the shape of the total lookup wrong costs five rebases rather than one. It is also the fattest ticket and carries the bulk of the unit-test matrix. Give it an undivided context window.

**#51, closure counting only Eligible voters.** It rewrites the exact regions #46 and #50 both edited, and it is the one place where a mistake fails closed and silently: a match that never auto-closes is indistinguishable from ordinary slow turnout. Nothing else should be in `vote-service.ts` while it runs.

**#56.** The integration check, solo by construction.

## Merge discipline

**#47 merges alone, deliberately.** It carries the schema migration, and a push to `main` deploys and runs `prisma migrate deploy` minutes later. Rehearse against a restored production dump first (restore into a scratch database on the compose Postgres, `migrate deploy`, check, drop). Develop it in parallel with #46 by all means; do not fold it into a batch fast-forward merge.

**Rebuild `packages/shared-types` inside each worktree** that touches or consumes it — #49, #53 and #54 all change it, and dependent apps do not pick up the change until the package is built.

**Watch #53's size.** Seven files across server, client and the shared package; it is the lane most likely to exhaust a context window. It splits cleanly at the wire boundary if needed: the server-side counts plus `viewerEligibility` reaching the wire, then the matches-list cell as its own client ticket.

## Databases per lane

Following the worktree-per-ticket recipe, each lane with `db` tests needs its own database and its own `TEST_DATABASE_URL`: **#46, #49, #50, #51, #55, #57**. The rest are Vitest-only (#48, #56) or have a client half that can share (#52, #53, #54 — their server halves do need one).

Stage 2 therefore needs two databases, not one: #49 and #57 both run `db` tests, and #48 needs none.

## Ticket index

| #   | Ticket                                                       | Blocked by | Stage |
| --- | ------------------------------------------------------------ | ---------- | ----- |
| 46  | Voting closes on the votes just cast (prefactor)             | —          | 1 ✅  |
| 47  | An admin sets a Voting threshold when creating a Competition | —          | 1 ✅  |
| 48  | The Voting threshold readout and the League ceiling advisory | #47        | 2 ✅  |
| 49  | The eligibility seam: one loaded answer per Competition      | #47        | 2 ✅  |
| 50  | The Voting gate refuses an ineligible voter at submit        | #49        | 3 ✅  |
| 51  | Voting closes when every Eligible voter has voted            | #46, #50   | 5     |
| 52  | The vote page's fourth state                                 | #49        | 4     |
| 53  | Pending counts and the matches list respect the Voting gate  | #49        | 3 ✅  |
| 54  | The pending-votes list shows each player's standing          | #49        | 4     |
| 55  | Voting invitations and reminders skip ineligible players     | #49        | 3 ✅  |
| 56  | Verify the finished Voting gate against CONTEXT.md           | #51–#55    | 6     |
| 57  | The closing ballot is dropped from the ratings it closes on  | —          | 2 ✅  |
