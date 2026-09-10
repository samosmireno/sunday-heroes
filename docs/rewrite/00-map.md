# Sunday Heroes rewrite: the map

_Overall pass, 2026-09-09. Output of the first `/grill-with-docs` session for a from-scratch rebuild. Nothing here is code; the current repo was read only as evidence of what the app does today._

## How to read this

The rewrite reuses no code. The current repo (`CONTEXT.md`, `docs/adr/`, `docs/specs/`, the Prisma schema, every service and test) was read for **behaviour**, never for structure: no module boundary, table shape, endpoint name or layering carries over. Where a rule of today's app exists only because of how the old code is built, the map says so.

Each area below has its purpose, a verdict (**keep**, **drop**, **reshape**), the cross-cutting rules it depends on, and the open questions a dedicated branch session must settle. Areas are ordered by dependency: an area is listed after every area it depends on. The last section gives a one-line prompt per area to start that branch session.

## What was decided in this session

The product and its shape:

- **A general competition manager**, not a single-group tool. The features that serve one group (man of the match, the vote) are features of the product, not its whole purpose.
- **All three formats** are implemented: Pickup (today's "Duel"), League and Knockout. They split into **squad formats** (one pool of players, sides drawn per match, a player table) and **team formats** (fixed teams with rosters, a schedule or a bracket, a team table plus player stats).
- **Group** is first class. A person may create several, belong to several and administer several. Sign-up creates no Group.
- **A Player is a group-level identity; an Account is optional.** The admin types nicknames, players may never log in, and an Account is what a Player attaches to in order to vote.
- **Voting is the heart**, switched on per competition at creation and editable later.
- **Seasons for every format**, admin-triggered like a real football season, so a recurring competition never has to be recreated and its player pool carries over. A closed Season is read-only.
- **The voting gate becomes "Minimum matches"**: N completed matches in this competition, counted across seasons, editable, applied from the first match that crosses it. Squad format only; team formats are roster-based and need no gate.
- **Competition settings are editable** after creation. A change applies to matches created after it and never rewrites the past.
- **Match format (five-a-side, six-a-side and so on) lives at two levels.** In Pickup it is a fact of each match, chosen when the match is added. In League and Knockout it is a competition setting fixed at creation, because a schedule and its rosters are built for one size.
- **A draw is a result** in Pickup and League. Penalties exist only in a one-leg Knockout match, where they decide the winner.
- **Ratings are derived from ballots at read time**, never stored, so a correction is never a repair. Voting reopens only when a lineup changes and only before the deadline.
- **A Player casts their own ballot through a linked Account.** A Group admin or competition manager may submit a ballot on behalf of any Player in the match, linked or not, because some players will never register.
- **Sign-in is Google or email and password**, and one email is one Account across both.
- **Members only.** Nothing is visible outside a Group; public share links are a future feature.
- **All current player stats survive** and gain a rating history.
- **Mobile-first web app** with a large-screen layout, English only, look and feel open.
- **Operational rigour**: staging, migrations as a deliberate deploy step, health check, error tracking, automated backups, scheduled work outside the request process, hosting open.
- **TypeScript end to end**; everything else in the stack is open. The shared-types package was a workaround for one contract across client and server, and the architecture session finds the proper mechanism.
- **One-time data migration** of Groups, Players, Accounts and their links, competitions as Pickup, Seasons, matches with lineups, and every ballot. Ratings and crowns are re-derived, with a report of where they differ from what was stored.

## Vocabulary

Renames accepted in this session. The rewrite starts its own glossary (`docs/rewrite/CONTEXT.md`, created lazily by the first branch session that resolves a term) rather than editing the current app's `CONTEXT.md`, which stays accurate for the code it describes.

| Today                                                                                                                               | Rewrite                 | Note                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------- |
| Dashboard                                                                                                                           | **Group**               | Today "dashboard" is both the group and the home page.                     |
| Duel                                                                                                                                | **Pickup**              | One pool of players, sides drawn per match. Home and Away meant nothing.   |
| DashboardPlayer                                                                                                                     | **Player**              | Belongs to one Group. Identity is the nickname within the Group.           |
| User                                                                                                                                | **Account**             | May claim one Player per Group.                                            |
| Admin (dashboard owner)                                                                                                             | **Group admin**         | Several per Group. The `Role` enum on accounts is gone; roles are derived. |
| Moderator                                                                                                                           | **Competition manager** | Per competition. Name open to the groups-and-roles session.                |
| Voting threshold, Eligible voter, Voting gate                                                                                       | **Minimum matches**     | The runway and arming rules are dropped.                                   |
| Reset competition                                                                                                                   | dropped                 | Seasons replace the destructive wipe.                                      |
| Teams setup                                                                                                                         | **Roster setup**        | Per Season, team formats only.                                             |
| Fixture, Completed match, Standings, Season, Current season, Past season, Start new season, All seasons, Man of the match, Win rate | kept                    | Definitions carry over; branch sessions may tighten them.                  |

Terms today's code uses without defining, to be settled in the sessions named: **side** (matches), **round** and **matchday** (league schedule), **ballot**, **vote**, **points** and **rating** (voting), **pending votes** (voting, today both a roster and a count), **registered** (identity, today two meanings), **match type** (matches, today "format" and validated nowhere).

## Cross-cutting rules

Rules that more than one area depends on. Each branch session takes them as given unless it is the session named as owner.

| Rule                                                                                                                                                                                                                                  | Owner        | Status                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Completed match is the unit that counts** for standings, stats and Minimum matches. A Pickup match is born completed; a Fixture is completed by an act.                                                                             | Matches      | Kept.                                                                                                                                          |
| **Every new match lands in the Current season.** A Past season is read-only for match writes. Voting open at rollover runs to its deadline.                                                                                           | Seasons      | Kept, by purpose this time: rollover happens when the old matches are settled.                                                                 |
| **A Player's identity is the nickname within the Group.** An Account is optional and is what voting requires.                                                                                                                         | Groups       | Kept.                                                                                                                                          |
| **Roles are derived**, never stored on the Account: Group admin from Group membership, Competition manager from a per-competition assignment.                                                                                         | Groups       | Reshaped: several Group admins.                                                                                                                |
| **Ratings and man of the match are derived from ballots at read time.** Nothing about a vote is stored except the ballot.                                                                                                             | Voting       | Reshaped. Today they are stored at close and repaired by migration.                                                                            |
| **A settings change applies forward.** Voting on or off, period, Minimum matches and format details apply to matches created after the change.                                                                                        | Competitions | New.                                                                                                                                           |
| **A draw is a result.** A level Pickup or League match is a draw for standings and win rate. Only a one-leg Knockout match goes to penalties, and there the decision is a win and a loss.                                             | Matches      | New. Today the glossary and win rate treat a penalty result as a win or loss while the standings and the SQL career record treat it as a draw. |
| **Members only.** Every read is scoped to a Group the Account belongs to. Public share links are future work.                                                                                                                         | Identity     | New. Today many reads are open by omission.                                                                                                    |
| **Minimum matches applies to Pickup only** and counts completed matches in this competition across Seasons.                                                                                                                           | Voting       | Reshaped.                                                                                                                                      |
| **Match format is per match in Pickup and per competition in team formats.** A Pickup match carries its own size, chosen when it is added. A League or Knockout competition fixes its size at creation and every Fixture inherits it. | Competitions | New. Today it is a free-text match type on League creation and on each match, validated nowhere.                                               |

## Areas

### 1. Identity and accounts

**Purpose.** Let a person prove who they are so they can be attached to Players, run Groups and vote.

**Today.** Google OAuth or email and password. Both paths create an `ADMIN` account and a Dashboard on the spot, so the role enum never varies. Cookie JWT access and refresh tokens with rotation and a global sweep of expired tokens. Password reset by a one-hour emailed token; the reset endpoint returns 404 for an unknown email while the copy says otherwise. Rate limits on login, forgot and reset only. Google login on an email that registered with a password silently signs into that account. Client session is a `localStorage` entry; the `/auth/me` route exists and is never called. Several read routes carry no authentication at all.

**Verdict: reshape.** Keep Google and email-and-password. One email is one Account: an Account created with a password may sign in with Google for the same email, and the reverse. Sign-up creates nothing else. Drop the stored role.

**Depends on.** Members only.

**Open questions.**

- Is "same email" enough to link a Google sign-in to a password Account, given Google verifies the address, or does the first password login after a Google sign-up need a confirmation step?
- Session shape: cookie sessions, token pair, or something the chosen stack gives for free.
- Account deletion and what happens to the Players it claimed.
- Rate limiting and abuse protection across sign-up, not only login.

### 2. Groups, players and roles

**Purpose.** The social unit. A Group owns competitions and a pool of Players; people run it, belong to it, and are invited into it.

**Today.** One Dashboard per account, created automatically, owner is "the admin". A DashboardPlayer is a nickname unique within the Dashboard, created by typing a name into a match roster, deleted when it has no match rows and no account. An invitation link (admin only, seven days, email optional and never sent by the UI) links a DashboardPlayer to a User on accept; the accepting user also gets their own empty Dashboard. Moderators are per competition and may record matches, run Teams setup and see votes, but not reset, roll over, delete or manage moderators. Per-competition role is derived. No rename or delete of a player, no revoking or listing invitations. The moderator code confuses user ids with player ids and works only because the client sends the id it expects.

**Verdict: reshape.** Group is first class and created deliberately. Several Group admins. Competition managers per competition. Players stay nickname-first with optional Account links. Invitations gain a life cycle: list, revoke, expire, resend.

**Depends on.** Player identity is the nickname; roles are derived; members only.

**Open questions.**

- Can a Group admin create Players ahead of any match, and rename or merge Players (two nicknames that turned out to be one person)?
- Does an Account claim a Player by invitation only, or may a Group admin link an Account by email directly?
- Can a Player leave a Group, and what happens to their matches and ballots?
- Name for the per-competition role; whether a Group admin is automatically a manager of every competition.
- Whether a Group has any settings of its own (name, default match format, time zone).

### 3. Competitions and formats

**Purpose.** A named run of matches inside a Group with one format and its own settings, including whether voting is on.

**Today.** Duel is the only format in production: two literal Team rows named Home and Away, sides free-picked per match, every match born completed with round 1. League is created through its own endpoint with a match type, a number of teams and a double-round-robin flag misnamed `isRoundRobin`. Knockout exists as an enum value, a stored voting period nobody reads and a form schema; a Knockout match cannot be created. Settings are write-once because no update endpoint exists. `minPlayers` is stored and never read. Deletion is admin-only and prunes orphaned players.

**Verdict: reshape.** Three formats under one Competition concept: **Pickup** (squad format), **League** and **Knockout** (team formats). Settings editable after creation, applied forward. Voting is a per-competition switch with its own settings. Match format is a competition setting for League and Knockout, fixed at creation; a Pickup competition has none, because each Pickup match picks its own.

**Depends on.** Settings apply forward; roles are derived.

**Open questions.**

- The exact settings list per format and which are shared: voting on or off, voting period, reminder, Minimum matches (Pickup only), match format (team formats only), team count, single or double round robin, bracket size.
- Which match formats are offered (five-a-side up to eleven-a-side, or any number) and whether a match format validates a lineup, on the server, at completion.
- What "delete a competition" means once it has Seasons and ballots: hard delete, or archive.
- Whether a competition can change format after creation (almost certainly no) and how that is stated.

### 4. Seasons

**Purpose.** One run of a competition, like a football season, so a recurring competition keeps its history and its player pool without being recreated.

**Today.** A Season table; the Current season is the row with no end date; Season 1 opens with the competition. Start new season needs at least one match, closes and opens at one instant, and zeroes a League's live counters. A Past season refuses match update, completion and deletion, but voting runs on. Reset deletes every match and Season and opens a fresh Season 1. The season selector lives in the URL and offers All seasons. A Fixture left not completed at rollover stays not completed forever. Read-only exists in today's code because standings are incremental counters (ADR 0002 and 0003).

**Verdict: keep, reshaped.** Seasons for every format. Read-only Past seasons stay, now by purpose: rollover happens when the previous matches are settled. Reset is dropped.

**Depends on.** Completed match; every new match lands in the Current season.

**Open questions.**

- What a season means per format: for League a new schedule, for Knockout a new bracket, for Pickup only a boundary. Does rollover for a team format require the schedule to be finished?
- Whether a Past season can ever be reopened by a Group admin for a correction, or whether read-only is absolute.
- What carries across rollover: teams and rosters, the Minimum matches count (yes, by decision), managers.
- Season naming: numbers only, or a label such as "2026/27".
- Whether an unfinished Fixture at rollover is carried, voided or blocks the rollover.

### 5. Teams and rosters

**Purpose.** For team formats, the fixed sides that play each other and the Players assigned to each.

**Today.** Team rows are group-wide and joined to a competition by a row that also holds the standings counters. Teams setup renames or merges placeholder teams and doubles as the fixture generator for a new season, so an admin must re-save unchanged names to get fixtures. A roster table exists with no route, capped at sixteen with one team per player, and a League match never checks its players against it (issue #45). Adding a team does not regenerate fixtures; deleting one strands matches. The League page's "Manage Teams" button is commented out.

**Verdict: reshape.** Rosters become real: a team format match's players come from the two teams' rosters. Roster setup is a per-Season act for team formats and is separate from generating a schedule.

**Depends on.** Player identity is the nickname; Seasons.

**Open questions.**

- Is a team a thing within one competition, or can the same team play in several competitions of the Group?
- Roster changes mid-season: allowed freely, allowed with a transfer window, or frozen.
- Whether a Player may be on two teams' rosters in the same Season (a guest), and how a guest appearance is recorded.
- Team identity: name only, or colours and a captain.
- Minimum and maximum roster size, and whether they follow the competition's match format.

### 6. League schedule and standings

**Purpose.** A round-robin schedule of Fixtures for a Season and the table it produces.

**Today.** Circle-method generation with a bye for odd counts, home and away balanced with a random tiebreak, mirrored rounds for double round robin. Fixtures are created undated, 0-0 and not completed. Standings: three, one, zero; ranked by points, goal difference, goals for, name; live counters for the Current season and derived from completed matches for Past and All seasons. Penalties are ignored, so a level score is a draw. Known counter drift from a non-atomic increment, a delta applied in a separate transaction, and a team delete that cascades without unwinding opponents. A League match cannot be deleted because nothing can unwind the counters.

**Verdict: keep, reshaped.** Standings are always derived from completed matches, never counted. Schedule generation is its own act.

**Depends on.** Completed match; Seasons; Teams and rosters; a draw is a result.

**Open questions.**

- Tiebreak order and whether head-to-head enters it.
- Whether an admin can add a Fixture outside the schedule, reschedule, postpone or void one.
- Rounds versus matchdays as the visible grouping, and whether Fixtures carry a planned date.
- Whether a League can be created with the schedule left for later.

### 7. Knockout bracket

**Purpose.** A single-elimination bracket of teams for a Season, with a winner.

**Today.** Nothing beyond a name: an enum value, a `bracketPosition` column always null, a voting period stored and never read, and a form schema identical to the League's. Hidden from the create form and the filters.

**Verdict: keep, built from nothing.** A team format sharing teams, rosters and match recording with League.

**Depends on.** Teams and rosters; Seasons; a draw is a result, so a one-leg Knockout match is the only match penalties decide; Completed match.

**Open questions.**

- Bracket size and seeding: fixed powers of two with byes, or any count; seeded by the admin, by a previous League table, or at random.
- One leg or two, and how a two-leg tie is decided.
- A level one-leg match goes to penalties, since extra time is not recorded: must it carry a penalty result before it can be completed, and how is a level two-leg tie decided?
- Third-place match, group stage before the bracket (probably a later format), and what happens to a team that withdraws.
- Whether a Knockout Season ends automatically when the final is completed.

### 8. Match recording

**Purpose.** Capture what happened in one match: who played on which side, the result, and the individual contributions that feed stats and the vote.

**Today.** Date, two scores, penalties (built, hidden in the UI, the away value written as a copy of the home value), a video link, match type, round. Per side a Team row; per player goals, assists, a `penaltyScored` flag that is always null, an ordinal position that draws shirts on a pitch, rating and man-of-the-match flag. A Pickup match is created already completed; a League Fixture is completed by a separate act that needs players, teams and a date. Editing rewrites date, scores and video, reconciles players by nickname and side, and moving a player across sides loses their rating and cascades their votes away. Every edit reopens voting with a fresh deadline. Validation is mostly client-side: four per side, goals and assists each at most the side's score; the server accepts zero players. Nothing validates the match format against the lineup.

**Verdict: reshape.** A match records scores, scorers, assists, own goals, a penalty shoot-out for a one-leg Knockout match, a lineup per side with a chosen formation, and a video link. Goals reconcile with the score. No cards, minutes or substitutes.

**Depends on.** Completed match; every new match lands in the Current season; a draw is a result; Teams and rosters for team formats; Player identity is the nickname for Pickup; match format is per match in Pickup and inherited from the competition in team formats.

**Open questions.**

- Is a Pickup match still born completed, or does it get the same "record then complete" life cycle as a Fixture?
- Formation: chosen from a list per match format, or free placement; whether a Player's position is a fact worth keeping for stats. In Pickup the list follows the size chosen for that match.
- Whether an own goal is a per-player fact or only a score adjustment.
- Exactly which edits reopen voting (lineup change by decision) and which never do (score correction).
- Validation split: what must hold on the server for a match to be completed.
- Match deletion for every format, now that standings are derived.

### 9. Voting and man of the match

**Purpose.** After a match, the players rate each other, producing a rating per player per match and a man of the match.

**Today.** Participants only. A ballot is exactly three distinct other players worth three, two and one; self-vote is prevented only in the UI; anyone on either side may be picked. One ballot per voter, no edit. Voting opens at match creation and on every edit, closing when every eligible participant has voted or at a nightly cron deadline. Rating is points received over the total vote rows in the match times three, stored at close; zero ballots leave it null. Man of the match is every player on the top non-zero rating; the flag is set and never cleared. No recompute after close, hence two repair migrations. Reminders go out from a noon cron within a configured lead time, to eligible non-voters with an email. The Voting threshold gate: qualified is N completed matches in one Season, armed is twice N completed lifetime plus one qualified player, and the runway before arming lets everyone vote. Admins and moderators may submit a ballot for a player. A match caught mid-vote when the gate arms stays open until the deadline.

**Verdict: keep, reshaped.** Same ballot shape and shared crown. Ratings and crowns derived at read time. Reopen only on lineup change before the deadline. A Player casts their own ballot through a linked Account; an admin or manager may submit one on behalf of any Player in the match, linked or not. Minimum matches replaces the gate, Pickup only.

**Depends on.** Completed match; Past season voting runs to its deadline; ratings derived; Minimum matches is Pickup-only; Player identity and Account link.

**Open questions.**

- How a ballot submitted on a Player's behalf is recorded and shown: marked as entered by the admin, or indistinguishable from the Player's own.
- Whether a voter may change a ballot before close.
- Whether the rating denominator should be ballots cast (today it is vote rows, so an absent voter lowers everyone), and whether a match with few ballots should be rated at all.
- Closing: on last ballot, at a deadline, or both; and what a manager can do to a stuck vote.
- Tie on the top rating: shared crown stays, but does it count as a full crown in career totals for each?
- Whether voting exists for team formats in the same shape, or per team.

### 10. Player stats and views

**Purpose.** Let players see what they have done: per competition, per season, across a career, and against their teammates.

**Today.** A per-competition table computed in memory from the selected Season: matches, goals, assists, wins, win rate, average rating over rated matches, man-of-the-match count, team for League. A career page in SQL across every Player an Account has claimed: totals, average rating, win-draw-loss with penalties treated as draws, man-of-the-match count, goal and assist consistency rates, recent form, top matches, top competitions, top teammates by shared side. Win rate is wins plus 0.3 per draw over matches, never stored. A home page with four cards, one counting dated matches as completed. The career page is public.

**Verdict: keep, reshaped.** Everything stays and gains a rating history over time. Group-scoped, not public. A draw counts as a draw everywhere; a Knockout penalty decision counts as a win and a loss.

**Depends on.** Completed match; ratings derived; a draw is a result; All seasons; Account may claim one Player per Group.

**Open questions.**

- Whether a career spans Groups (an Account's Players everywhere) or is per Group.
- Which stats are per Season, per competition, per format, and which only make sense for Pickup (top teammate by shared side) or team formats (clean sheets).
- Whether the 0.3-per-draw win rate is a formula you chose or one that arrived; keep or replace.
- Leaderboards across a Group, and any badges or streaks.
- What the home page is for once there are several Groups.

### 11. Notifications and email

**Purpose.** Tell people what needs them: a vote to cast, an invitation to accept, an account to recover.

**Today.** Three emails: voting invitation (reused as the reminder, with copy that states the wrong number of days), Group invitation (reachable only through the API; the UI copies a link), password reset. Sent through Resend over SMTP from a domain you own with SPF, DKIM and DMARC; no unsubscribe header, no bounce handling. Two crons inside the web process.

**Verdict: reshape.** A share link to post in the group chat is the primary path to a vote. Email stays for account matters and as an opt-in reminder.

**Depends on.** Account link; voting open and close rules; operations for scheduled work.

**Open questions.**

- Per-Account notification preferences: which emails, how often.
- Whether reminders are per competition settings or per Account.
- Push notifications or a PWA install prompt as a later channel.
- Deliverability duties: unsubscribe, bounces, complaints.

### 12. Architecture

**Purpose.** The stack and the shape of the code: one language end to end, one contract between client and server, and a data model that serves derived standings and ratings.

**Today.** Turbo monorepo, Express with a handler, service and repository layering, Prisma over Postgres, React with Vite, TanStack Query, a shared-types package built separately and hand-kept in step. None of this carries over; the shared-types package in particular was a workaround for keeping one contract.

**Verdict: open.** TypeScript end to end is the only constraint.

**Depends on.** Every domain area above; ratings derived; standings derived; members only.

**Open questions.**

- Server and client shape: a full-stack framework with server functions, a separate API with end-to-end typed RPC, or a schema-first contract; the point is one source of truth without a hand-built package.
- Database and access layer; how derived standings and ratings are computed efficiently (on read, cached, or materialised and invalidated).
- Authorization model that makes "members only" the default, not a per-route check.
- Testing strategy: what the current harness got right (real migrations, truncation per test, factories through real services) and what to do differently.
- Repository layout and the workflow for agent-driven development.

### 13. Frontend and design

**Purpose.** The screens people use, mobile-first with a proper large-screen layout.

**Today.** A flat router with an auth-only guard and one real role gate. Dark green pitch with a gold accent, Courier headings, gold, green and blue per format applied by class switching rather than a theme system. A sidebar that becomes a sheet on mobile. No i18n, no PWA. Pages: landing, sign-in, dashboard, competitions list, matches, players, competition page with season selector, League teams setup, vote page, pending votes, competition admin, player stats, add and edit match.

**Verdict: reshape.** Mobile-first with a large-screen layout; the look is open. English only.

**Depends on.** Architecture; every domain area for its screens; members only for what a route may show.

**Open questions.**

- Whether to keep the pitch-and-gold identity and the per-format colours, or start the visual language from zero.
- Information architecture once there are several Groups: what the first screen is.
- The match recording flow on a phone, which is the most-used screen.
- The vote as a shared moment: what the vote page and its share link look like.
- Design system and component approach.

### 14. Operations and hosting

**Purpose.** Run the thing safely: deploy, migrate, watch, back up, schedule.

**Today.** One Docker image on Render serving client and API, migrations run on every container start, CI runs lint, format, types and tests but never builds or deploys, no staging, no health endpoint, no error tracking, cron in-process on a single instance, backups by hand, test-error routes mounted in production, Vercel leftovers, production dumps at the repo root.

**Verdict: reshape.** Staging, migrations as a deliberate step, health check, error tracking, automated backups, scheduled work outside the request process. Hosting open.

**Depends on.** Architecture.

**Open questions.**

- Hosting that fits the stack and gives staging, backups and a scheduler with the least ceremony.
- Deploy pipeline: preview per pull request or a single staging.
- Migration rehearsal as a pipeline step rather than a ritual.
- Observability: logs, errors, uptime; what the alert is.
- Cost ceiling.

### 15. Data migration

**Purpose.** Carry the past into the new app once, so today's results, lineups and ballots are not lost.

**Today.** Production holds Duel competitions only, each with matches, lineups, ballots, stored ratings and man-of-the-match flags, one Dashboard per account, invitations and moderators.

**Verdict: one-time job.** Groups, Players, Accounts and their links, competitions as Pickup, Seasons, matches with lineups and every ballot. Ratings and crowns are re-derived, with a report of where they differ from what was stored.

**Depends on.** Every domain area's final model; Architecture; Operations.

**Open questions.**

- What to do with the empty Dashboards every invited player received: drop them, or keep any that have competitions.
- How Home and Away Team rows collapse into Pickup sides.
- Whether stored ratings that differ from re-derived ones are shown to users as a note or silently replaced.
- Whether password hashes migrate or every Account re-verifies.
- Cut-over: freeze the old app, migrate, verify, redirect.

## Branch session prompts

Paste one line to start that session. Each session reads this map first, settles the open questions of its area, may write its own `docs/rewrite/NN-<area>.md`, and adds resolved terms to `docs/rewrite/CONTEXT.md`.

In every session the agent is expected to do more than ask: it should propose improvements to the area and additional features it thinks would be handy, drawn from what it has read of the current app, of the other branch documents and of how comparable products work. Each proposal is put to the user as a decision like any other question, never adopted silently, and the branch document records the ones that were accepted, the ones that were declined, and why.

1. `/grill-with-docs Sunday Heroes rewrite, branch session: Identity and accounts. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 1, propose improvements and extra features you would find handy, and write docs/rewrite/01-identity.md.`
2. `/grill-with-docs Sunday Heroes rewrite, branch session: Groups, players and roles. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 2, propose improvements and extra features you would find handy, and write docs/rewrite/02-groups.md.`
3. `/grill-with-docs Sunday Heroes rewrite, branch session: Competitions and formats. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 3, propose improvements and extra features you would find handy, and write docs/rewrite/03-competitions.md.`
4. `/grill-with-docs Sunday Heroes rewrite, branch session: Seasons. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 4, propose improvements and extra features you would find handy, and write docs/rewrite/04-seasons.md.`
5. `/grill-with-docs Sunday Heroes rewrite, branch session: Teams and rosters. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 5, propose improvements and extra features you would find handy, and write docs/rewrite/05-teams.md.`
6. `/grill-with-docs Sunday Heroes rewrite, branch session: League schedule and standings. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 6, propose improvements and extra features you would find handy, and write docs/rewrite/06-league.md.`
7. `/grill-with-docs Sunday Heroes rewrite, branch session: Knockout bracket. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 7, propose improvements and extra features you would find handy, and write docs/rewrite/07-knockout.md.`
8. `/grill-with-docs Sunday Heroes rewrite, branch session: Match recording. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 8, propose improvements and extra features you would find handy, and write docs/rewrite/08-matches.md.`
9. `/grill-with-docs Sunday Heroes rewrite, branch session: Voting and man of the match. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 9, propose improvements and extra features you would find handy, and write docs/rewrite/09-voting.md.`
10. `/grill-with-docs Sunday Heroes rewrite, branch session: Player stats and views. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 10, propose improvements and extra features you would find handy, and write docs/rewrite/10-stats.md.`
11. `/grill-with-docs Sunday Heroes rewrite, branch session: Notifications and email. Read docs/rewrite/00-map.md first, take its decisions as settled, settle the open questions under area 11, propose improvements and extra features you would find handy, and write docs/rewrite/11-notifications.md.`
12. `/grill-with-docs Sunday Heroes rewrite, branch session: Architecture. Read docs/rewrite/00-map.md and every docs/rewrite/NN-*.md written so far, take their decisions as settled, settle the open questions under area 12, propose improvements and extra features you would find handy, and write docs/rewrite/12-architecture.md with ADRs for the hard-to-reverse choices.`
13. `/grill-with-docs Sunday Heroes rewrite, branch session: Frontend and design. Read docs/rewrite/00-map.md and docs/rewrite/12-architecture.md first, take their decisions as settled, settle the open questions under area 13, propose improvements and extra features you would find handy, and write docs/rewrite/13-frontend.md.`
14. `/grill-with-docs Sunday Heroes rewrite, branch session: Operations and hosting. Read docs/rewrite/00-map.md and docs/rewrite/12-architecture.md first, take their decisions as settled, settle the open questions under area 14, propose improvements and extra features you would find handy, and write docs/rewrite/14-operations.md.`
15. `/grill-with-docs Sunday Heroes rewrite, branch session: Data migration. Read every docs/rewrite/*.md first, take their decisions as settled, settle the open questions under area 15, propose improvements and extra features you would find handy, and write docs/rewrite/15-migration.md.`

Sessions 1 to 11 are domain and can run in the listed order; 3 and 4 may run together, and 5, 6 and 7 may run together after 4. Session 12 waits for the domain sessions. Sessions 13 and 14 wait for 12. Session 15 is last.
