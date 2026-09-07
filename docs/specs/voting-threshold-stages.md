# Voting threshold — execution stages

How to run the tickets of [`voting-threshold.md`](./voting-threshold.md) as parallel lanes. The tickets are #46–#56; their blocking edges are wired as GitHub issue dependencies, so `issue_dependencies_summary.blocked_by` is the live gate. This file is about something the dependency graph does not say: which unblocked tickets can safely run **at the same time**, in separate worktrees, without colliding at merge.

## The constraint

`apps/server/src/services/vote-service.ts` is touched by five of the eleven tickets — #46 (`getPendingVoters`, `checkAndCloseVoting`), #50 (`submitVotes`), #51 (all three), #52 (`getVotingStatus`), #54 (`getMatchVotes`). That file is the serialization spine of the whole effort. Everything else fans out freely.

Two smaller collisions: `packages/shared-types/src/voting.ts` (#49 creates `VoterEligibility`, #54 extends `PendingVote`) and `apps/client/src/features/create-competition-form/voting-section.tsx` (#47 adds the field, #48 adds the readout). Both are sequential in the graph already, so neither is a live hazard.

## Stages

| Stage | Lanes           | Why they do not collide                                                                                                                         |
| ----- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | #46 ‖ #47       | `vote-service.ts` against the schema, request schema and create-competition form. No shared file.                                               |
| 2     | #49 ‖ #48       | The seam is server plus `shared-types/voting.ts`; the readout is `voting-section.tsx` plus a derived-arithmetic module. Disjoint.               |
| 3     | #50 ‖ #53 ‖ #55 | Three disjoint sets: `submitVotes`; the transforms, `utils.ts`, match and dashboard services and `matches-list.tsx`; `match-voting-service.ts`. |
| 4     | #52 ‖ #54       | Different `vote-service.ts` methods, different client features, different shared-types files.                                                   |
| 5     | #51             | Solo — see below.                                                                                                                               |
| 6     | #56             | Solo, on merged `main`.                                                                                                                         |

Stage 3 is the cleanest wave in the set: three lanes with no shared file at any point. #55 (`match-voting-service.ts`) is the only ticket in the whole effort that shares no file with any other.

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

Following the worktree-per-ticket recipe, each lane with `db` tests needs its own database and its own `TEST_DATABASE_URL`: **#46, #49, #50, #51, #55**. The rest are Vitest-only (#48, #56) or have a client half that can share (#52, #53, #54 — their server halves do need one).

## Ticket index

| #   | Ticket                                                       | Blocked by | Stage |
| --- | ------------------------------------------------------------ | ---------- | ----- |
| 46  | Voting closes on the votes just cast (prefactor)             | —          | 1     |
| 47  | An admin sets a Voting threshold when creating a Competition | —          | 1     |
| 48  | The Voting threshold readout and the League ceiling advisory | #47        | 2     |
| 49  | The eligibility seam: one loaded answer per Competition      | #47        | 2     |
| 50  | The Voting gate refuses an ineligible voter at submit        | #49        | 3     |
| 51  | Voting closes when every Eligible voter has voted            | #46, #50   | 5     |
| 52  | The vote page's fourth state                                 | #49        | 4     |
| 53  | Pending counts and the matches list respect the Voting gate  | #49        | 3     |
| 54  | The pending-votes list shows each player's standing          | #49        | 4     |
| 55  | Voting invitations and reminders skip ineligible players     | #49        | 3     |
| 56  | Verify the finished Voting gate against CONTEXT.md           | #51–#55    | 6     |
