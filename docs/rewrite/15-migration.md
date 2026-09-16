# Data migration

_Branch session 15, 2026-09-16. Output of the sixteenth and last `/grill-with-docs` session for the rewrite. Takes `00-map.md` and `01-identity.md` through `14-operations.md` as settled; settles the open questions under area 15 of the map and records the proposals put to the user, accepted and declined. The one hard-to-reverse choice is recorded as `adr/0012-migrated-accounts-verified-with-no-sign-in-method.md`. Nothing here is code._

## Purpose

Carry the past into the new app once, so that today's results, lineups and ballots are not lost, and then never look at the old database again. The migration is a one-time job with three parts: an **import** that inserts the old data into the new schema under the new vocabulary, a **verifier** that runs the new app's own engine over the result and writes a **Migration report** of what moved, what was dropped and what changed, and a **Cut-over** evening on which the old app is frozen, the import runs, the report is read, and the address moves. Ratings and crowns are never carried: they are re-derived from the ballots, and the report names every match where the old stored number differs.

## Decisions carried in from the map and the branch sessions

- One-time migration of Groups, Players, Accounts and their links, competitions as Pickup, Seasons, matches with lineups and every ballot. Ratings and crowns are re-derived, with a report of where they differ from what was stored (map).
- From the architecture session: the job inserts rows directly into the new schema, one transaction per Group, and then runs the domain engine over the result to produce the report; it does not write through the acts, because the old data breaks rules that history is allowed to break, and the database constraints hold either way; the old database is read over its own connection, never through the new app; ids are minted by the job; a "recorded" change-record entry per migrated match naming the competition's admin; no Deliveries, sessions or security events migrate; the Award threshold is stamped as 50% on every migrated Season; whether password hashes carry is this session's.
- From the operations session: Read-only mode on the new app and the old app's last deploy as the freeze; a dump of the old database taken through the same `pg_dump` path and kept in the bucket; DNS moving the apex to the new app with the old app kept reachable on a subdomain until the report is accepted; the cut-over runbook outlined there, its job and report here.
- From the identity session: today's Accounts have no verified-email flag and no Google subject id, so the migration decides what to assume for each; an Account has one or two Sign-in methods; Google attaches to an existing Account only when both emails are verified.
- From the groups session: every dashboard with at least one competition becomes a Group with its owner as the first admin Member and each linked DashboardPlayer's user as a Member; empty dashboards are dropped; nickname collisions under the new rule are reported for the admin to merge; used invitations need not migrate, unused ones may be voided; the two moderator rows become Manager assignments if their players are linked.
- From the competitions session: every Duel becomes a Pickup, Active, with its voting switch, period and threshold carried over as voting, voting period and Minimum matches; the usual match format from the most common match type of its matches, else the Group default; `minPlayers`, the reminder lead and the Knockout period are dropped.
- From the seasons session: Season 1 per competition with its start at the competition's creation; the one production rollover carries over as two Seasons with the same closing and opening instant; no labels; no Not played matches.
- From the matches session: every Duel match becomes a Completed Pickup match with its date, scores, video link, its match type as the match format, its Home and Away rows as two coloured sides, each player row as a lineup row with goals, assists, no own goals, no guest mark, the ordinal position as the slot order under the default formation for its size; penalties, `penaltyScored`, round and `bracketPosition` are dropped.
- From the voting session: every vote row becomes a pick on a ballot keyed by voter and match, three rows per ballot, with no enterer since today records none, submitted at the rows' creation instant; stored ratings and crown flags are dropped and re-derived; the report lists every match whose derived rating or crown differs from what was stored, including every match that closed with one or two ballots and becomes Not rated; the voting deadline of an open vote carries over as its instant; the per-voter vote link, the pending-votes page and the reminder lead are retired.
- From the stats, teams, League, Knockout, notifications and frontend sessions: nothing stored there migrates; every stat re-derives; no Team, Entry or roster is created; every migrated Account starts with the reminder off and the prompt unasked; every migrated Player is a missing sticker until linked.

## What today holds, as evidence

Facts from the production dump of 2026-09-03 and from the current schema and code, read in this session. The job reads the live database at cut-over, so the dry run replaces every count below; the shapes are what the design rests on.

- **The data is one group.** 51 Users, 51 Dashboards, 5 competitions, 6 Seasons, 102 matches, 1144 lineup rows, 799 ballots of 2397 vote rows. Four dashboards have a competition: the real one (62 players, 73 matches, 765 ballots), a second with two competitions (38 players, 28 matches), the user's own Season-2 test of 2026-09-03 (one match), and one with a voting-off competition and no players or matches. 47 dashboards are sign-up shells, 46 of 51 Users signed up and never returned, every dashboard name is the auto-generated `<given name>'s Dashboard`.
- **Every competition is a Duel**, five-a-side, every match Completed, round 1, no penalties, no bracket position, no roster, no League or Knockout row. 44 Team rows exist: nine Home and Away pairs, one per competition plus leftovers, and 26 named teams from tests that nothing references.
- **Accounts have two shapes.** 41 Users have no password and signed in with Google; 10 hold bcrypt hashes with the `$2b$10$` prefix. No User table column says whether an email was verified or which Google account signed in. Every User is `ADMIN`; every User owns exactly one dashboard; no email collides under lowercasing.
- **Invariants the new schema demands already hold.** No User has two players in one dashboard; no nickname collides with another in its dashboard after lowercasing, whitespace collapsing or even stripping diacritics; 17 nicknames carry Serbian letters; no self-vote; every ballot is exactly three rows worth 3, 2 and 1 by a voter who is in the match; positions run 1 to n on every side; every match has exactly one Home and one Away row; no side has fewer than 5 or more than 7 players.
- **Rules the old data breaks.** One side has more assists than goals, which the completion check refuses. 34 sides have goals the scorers do not account for, which the new model allows as unattributed. Five matches carry ten crowns and six carry all-zero ratings from the voteless-match bug; fourteen matches were rated with the closing ballot left out; six carry an old rounding of one point received; one single-ballot match has ratings on three players and nulls on seven. 19 matches closed with one or two ballots. Two repair migrations on `main` fix the first two classes in production today; none of it moves a crown.
- **Dates are local noon in Europe/Belgrade** stored as UTC, 10:00 or 11:00 by daylight saving, except the first three matches of August 2025, stored as local midnight. Every vote row was created before its match's deadline; the one open vote is on the Season-2 test match.
- **Two users have players in several dashboards**, each with the same nickname everywhere; three linked players sit in dashboards with no competition. Two moderator rows exist, both linked, on the real competition. 50 invitations were issued, all bearer, 45 used, 5 expired unused, one of them to a player linked meanwhile.
- **better-auth's facts**, from its documentation and source: passwords live on a credential row of the account table with `providerId` "credential" and `accountId` equal to the user id; a custom `verify` may branch on a bcrypt prefix but nothing re-hashes on sign-in; Google links to an existing user only when the Google profile and the local row both say verified, and refuses with "account not linked" otherwise; a user whose email is unverified cannot sign in with a password under mandatory verification; nothing requires session rows; forgot password works for a user with no credential row and creates it on reset.

## The model

### Scope

What migrates, into what, and what does not. "Dropped" means not carried, with its count in the report; nothing is deleted from the old database, which is archived whole.

| Old                                                                                     | New                                                                                    | Rule                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User                                                                                    | Account, verified, with no Sign-in method                                              | Every User, whether or not it ends up a Member anywhere; display name from given and family name with whitespace collapsed; the creation instant kept                                                              |
| User.password, RefreshToken, resetToken                                                 | nothing                                                                                | No hash migrates; every session, token and reset is dropped (ADR 0012)                                                                                                                                             |
| Dashboard with at least one Completed match                                             | Group                                                                                  | Unless listed in the job's skip input; named by the job's name input, else the competition's name where there is one competition, else the admin's display name plus "'s group"; Europe/Belgrade; default 5-a-side |
| Dashboard with no Completed match                                                       | dropped, with its competitions and Players                                             | Its Players have no match rows by definition                                                                                                                                                                       |
| Dashboard owner                                                                         | the Group's first Group admin Member, linked to their DashboardPlayer where one exists | Join date from the dashboard's creation                                                                                                                                                                            |
| DashboardPlayer with a user                                                             | Player, linked to a Member of that Account                                             | Join date from the used invitation's instant, else the Player's creation                                                                                                                                           |
| DashboardPlayer without a user                                                          | Player, unlinked                                                                       | Nickname kept as typed; Unicode letters are letters                                                                                                                                                                |
| CompetitionModerator                                                                    | Manager assignment                                                                     | When its Player is linked; otherwise dropped and reported                                                                                                                                                          |
| DashboardInvitation                                                                     | nothing                                                                                | Used or unused; an admin re-issues any pending one from the Members page                                                                                                                                           |
| Competition (Duel)                                                                      | Competition, Pickup, Active                                                            | Voting switch as is; voting period as is, or the default 3 where null; Minimum matches from the live threshold column, off where null; Award threshold 50%; usual match format 5-a-side; the Managers above        |
| minPlayers, reminderDays, knockoutVotingPeriodDays, isRoundRobin, Competition.matchType | nothing                                                                                |                                                                                                                                                                                                                    |
| Season                                                                                  | Season                                                                                 | Number, start and end as stored; no label; the Award threshold stamped 50% on a closed one; a closed Season 1 and an Empty Season 2 carried as they are                                                            |
| Team, TeamCompetition, TeamRoster, MatchTeam                                            | nothing                                                                                | Home becomes the first side in Black, Away the second in White, as facts of each match                                                                                                                             |
| Match                                                                                   | Match, Completed                                                                       | The date as the stored instant read in Europe/Belgrade; scores; video link; note empty; match format 5-a-side; the settings snapshot from the competition; the completion instant as the old creation instant      |
| Match.round, bracketPosition, penalty scores                                            | nothing                                                                                |                                                                                                                                                                                                                    |
| MatchPlayer                                                                             | Lineup row                                                                             | Goals and assists as stored, own goals 0, no guest mark, the slot from the position under the default formation for 5-a-side, rows beyond the fifth on the bench                                                   |
| MatchPlayer.rating, isMotm, penaltyScored                                               | nothing                                                                                | Re-derived by the engine; the deltas go in the report                                                                                                                                                              |
| PlayerVote, three rows per (match, voter)                                               | Ballot                                                                                 | The three rows' players as the first, second and third pick by points; no acting Account; first-submitted and last-changed both the rows' creation instant; never voided                                           |
| Match.votingStatus, votingEndsAt                                                        | the vote's deadline, closed instant and reason                                         | By the four-case rule below                                                                                                                                                                                        |

Nothing is written into Deliveries, sessions, security events, invitations, Teams, Entries, rosters, Ties, or any derived number.

### Accounts: verified, and no Sign-in method

Every migrated Account is inserted with its email **verified**, and with **no Sign-in method**. Google attaches on the person's first Google sign-in, by subject id, exactly as the identity session's rule says for a verified Account; a password Account sets a password through forgot password, which creates the credential row; the Cut-over chat message says both. The identity session's "one or two Sign-in methods" gains this one exception, stated in the glossary: a migrated Account has none until its first sign-in.

Verified because 41 of the 51 Accounts are Google-only and cannot sign in at all otherwise, and the alternative for the 10 password Accounts, the verify wall on day one and the seven-day purge behind it, was judged worse than the takeover risk it closes; the report lists those ten by id for a look. No hash because ten Accounts, nine of which never returned, are not worth a bcrypt dependency and a branching verifier in a codebase built to have neither. Recorded as ADR 0012 because the old database is deleted 30 days after Cut-over, after which neither choice can be revisited.

An Account with no Group sees "Create a Group", as any fresh Account does. The Operator's Account section shows "no Sign-in method" for a migrated Account that has not signed in yet.

### Groups

A dashboard becomes a Group when it has at least one Completed match and is not in the job's skip input. The four candidates today: the real group, the two-competition group, the user's Season-2 test and a shell with a voting-off competition; the rule drops the shell, and the skip input is for the test. Every dropped dashboard is named in the report with its counts.

The Group's name comes from the job's name input, a list of dashboard id and name, and otherwise from the default rule above, because every dashboard name today is auto-generated. The time zone is Europe/Belgrade, a job input with that default; the dump's hour-of-day distribution tracks Belgrade daylight saving to the minute, so nothing is inferred per Group. The default match format is the most common format across the Group's migrated matches, which is 5-a-side everywhere.

Membership: the owner is the first Group admin, linked to their own DashboardPlayer where one exists, which is the "I play too" answer; every DashboardPlayer with a user makes its User a Member linked to that Player; a User with Players in several dashboards is a Member of each Group that survives, one Player in each; a User in a dropped dashboard alone is an Account with no Membership. The two moderators are linked, so both become Managers of the real competition.

### Matches and the vote

Every match is Completed, with the completion instant equal to the old creation instant because a Duel was born completed. Home is the first side in Black and Away the second in White, so every migrated match reads "Black 4-3 White" and the next match a Manager adds prefills that pair from the previous one. The date is the stored instant read as a calendar day in the Group's time zone, which yields the intended day both for the noon rows and for the three midnight rows of August 2025. The default formation for 5-a-side, 1-2-1, takes the first five positions of each side in order; a sixth and seventh sit on the bench.

The vote maps by four cases from `votingStatus` and `votingEndsAt`:

| Old                            | New                                                                     |
| ------------------------------ | ----------------------------------------------------------------------- |
| OPEN, deadline in the future   | open; the deadline carried as its instant                               |
| OPEN, deadline in the past     | closed by the deadline; closed instant = the deadline                   |
| CLOSED, deadline in the past   | closed by the deadline; closed instant = the deadline                   |
| CLOSED, deadline in the future | closed by the last ballot; closed instant = the latest ballot's instant |

No fifth "migrated" reason exists: every old close fits one of the two automatic reasons the voting session defined, and the data has no CLOSED vote with a future deadline anyway. A vote open at Cut-over runs to its deadline on the new address; the Cut-over evening is chosen so there is none.

Ballots carry as the voting session settled: one row per (match, voter), three picks ordered by points, no acting Account because today records none, so a ballot an admin submitted on someone's behalf becomes the Player's own. Ratings and crowns are discarded and read from the ballots: the 19 one- and two-ballot matches become Not rated, the closing-ballot and rounding differences vanish, the ten-crown and all-zero matches lose their stored fiction, and no crown moves.

### History that breaks a rule

The principle: **the job never changes a number someone recorded.** Every fact is migrated as it is wherever the schema admits it. A migrated match that fails one of the eight completion checks is Completed all the same, counts everywhere, and is named in the report with a link; its first edit re-runs the checks, as every edit does, and has to fix the violation in the same save, which is honest history surfacing when someone touches it. Where a database constraint would refuse a row outright, one stated rule per case applies and every application is reported; the data today needs none of them, and the rules stand for the dry run to prove it:

- a second Player of one Account in one Group: the Player with more match rows keeps the link, the other is migrated unlinked, reported for merge;
- a nickname collision under the normalised rule: the Player with more match rows keeps the nickname, the other gets a numeric suffix, reported for merge;
- a competition name collision under the normalised rule: the later competition gets a numeric suffix, reported;
- a ballot naming a Player not in the match, or fewer or more than three rows, or a self-pick: migrated as a voided ballot with the voided instant equal to its creation, reported.

Unattributed goals need no rule: they are what the matches session allows. The one side with more assists than goals is the only completion-check violation in the dump.

### The job

**`import-legacy`** is the seventh command of the image, beside `server`, `worker`, `migrate`, `seed`, `backup` and `rehearse`, living in `server/src/legacy/`. It imports the schema, the typed environment and the domain engine, so a schema change breaks it at compile time and the verifier is the app's own arithmetic. It runs as a one-off job in the target environment and reads the old database over `LEGACY_DATABASE_URL` with a read-only role; the old Postgres is reachable from the internet and the new one is not, which is why the new app reads the old and never the reverse. It is deleted from the repository in the release after the report is accepted, with the deletion noted in this document.

Inputs: the old database URL, the time zone (default Europe/Belgrade), the dashboards to skip, the Group names, the report destination, and `--dry-run`.

Rules:

- it refuses a target database that holds any Account or Group; a re-run means emptying the target and running again;
- one transaction for the Accounts, then one transaction per Group, as the architecture session settled;
- ids are UUIDv7 minted fresh on every run (ADR 0009); the old-to-new id map is a CSV in the report and never a column in the schema;
- `--dry-run` does every insert and every verification inside the same transactions and rolls them back, emitting only the report;
- the report is written to stdout and to the bucket under `migration/<run instant>/`;
- it writes one activity-record entry per Group of kind "imported", actor null, with the source dump instant and the counts of Players, competitions, matches and ballots, and one change-record entry per match of kind "recorded" naming the Group's first admin at the old creation instant, carrying `imported: true` so the match page reads "Imported · recorded by Ana" rather than claiming Ana pressed Complete.

**Three dry runs**, by hand, each from the live old database in read-only access, each report reviewed and kept in the bucket: one when the job first compiles, one when the new app reaches the bar below, one the day before Cut-over. No workflow step: the job lives for weeks.

### The verifier and the Migration report

After the import, and inside the dry run's transactions, the job runs the engine over what it wrote. The **Migration report** is a Markdown summary with CSV tables:

- row counts per source table against rows written per target table, and the counts of everything dropped: dashboards, Players, invitations, Teams, tokens;
- every dropped dashboard by id with its counts, and whether it was dropped by rule or by the skip input;
- every migrated match whose re-derived rating or crown differs from the stored one, with old and new values, and the 19 matches now Not rated, each with its new link;
- every migrated match that fails a completion check, with the check and the link;
- every application of a constraint rule above, with the affected ids;
- the moderators and their outcome; the password Accounts by id, for the look Q17 asked for;
- a **career cross-check**: every Player's matches, goals and assists re-derived from the old lineup rows in SQL against the engine's numbers, so a lineup row lost in transit is caught;
- a **derivation pass**: the engine's Standings, Season summary, MVP and player table executed once per migrated Season, not compared, so a derivation that throws on a legacy shape fails the dry run rather than the Group home;
- the old-to-new id map as CSV;
- the Cut-over chat message, drafted from the run.

The report is an Operator artifact. Nothing about a rating that changed is written into the app: nothing derived is stored, and a note would be the first stored fact about a rating. The Group hears the two facts that matter in the chat message.

### The Cut-over

The runbook lives in `docs/ops/cut-over.md` of the new repository; its outline:

**Before.** The new app matches what the group uses today: identity, Groups, Pickup, match recording, voting, stats and the reminder, with the staging smoke green. League and Knockout may arrive in later releases; nothing in the migrated data touches a team-format table, and those tables land as ordinary later migrations under expand-and-contract. The three dry runs have been read. The old app's last release has shipped: a `READ_ONLY` flag that makes every mutating route under `/api` and `/auth` except sign-in and refresh answer 503 with a plain message, stops both in-process crons so the frozen app neither closes a vote nor mails a reminder, and shows a banner naming the new address. The old Google client has `old.sunday-heroes.app` as a callback.

**The evening.** Chosen when no vote is open and no match is expected, a Thursday or Friday after Wednesday's deadline in the current rhythm.

1. Flip `READ_ONLY` on the old app.
2. Take the final dump through the `backup` path into the bucket's `archive/` prefix, outside the eight-week rotation, kept indefinitely.
3. With the new production database empty and the new app in Read-only mode, run `import-legacy` as a one-off job in the new production environment.
4. Read the report. Accept it, or flip `READ_ONLY` off and stop.
5. Clear Read-only mode on the new app.
6. Move the apex DNS to the new app; move the old app to `old.sunday-heroes.app`.
7. Post the chat message.

**The point of no return** is the first write in the new app after DNS moves. Before it, rollback is DNS back and the old flag off. After it there is no rollback: mistakes are Corrections and repairs in the new app.

**Old links.** Every old URL in the chat history (`/competition/:id`, `/match/:id`, `/vote?...`, `/invite/:token`) hits the new app after DNS moves and lands on one page: "this link is from the old Sunday Heroes", pointing at the Group home. No per-id redirect: old vote links are per-voter credentials the voting session retired, and old votes are closed by Cut-over. The id map in the report answers any question by hand.

**The chat message**, drafted by the report and posted by the admin, no mail:

> Sunday Heroes has moved to sunday-heroes.app. Sign in with Google as before; if you used a password, tap "forgot password" once to set it again. Every match, lineup and vote is there. Ratings were recomputed from the ballots, so a few numbers differ from what the old app showed, and matches with only one or two ballots now read "Not rated". Old links in this chat no longer open a match.

**After.** The old web service stays reachable read-only on the subdomain until the report is accepted and for 14 days after, then is suspended; the old Postgres is deleted 30 days after Cut-over; the old repository is archived on GitHub with a README pointer to the new one, as ADR 0001 says; the old Google client and the old Resend records go with the services; the `import-legacy` command and its module are deleted from the new repository in the next release.

### Roles

Nobody in a Group acts here. The Operator runs the job, reads the report and flips the flags; a Group admin posts the chat message and, afterwards, makes any Correction the report suggested. Read-only mode during the evening is the operations session's, refusing every act with `maintenance`.

## Scenarios that shaped the model

- **Marko, Google, never returned.** His Account is migrated verified with no Sign-in method. On the new address he taps Google; the profile is verified, the row is verified, better-auth attaches Google by subject id, and his Player, linked since 2025, is on his home with the sticker card.
- **Ana, password.** Her Account has no method. She taps forgot password, the mail arrives, the reset creates her credential row with a scrypt hash. Nothing of bcrypt exists anywhere.
- **The 4-3 with one ballot.** Stored as 3.00 for one player and a crown; migrated as one ballot and a closed vote; the engine reads Not rated, 1 of 12 ballots; the report names it and the chat message explains it.
- **The closing-ballot matches.** Fourteen matches stored a rating that left out the last ballot. The ballots migrate; the engine counts all of them; nobody repairs anything; the report shows the old and new numbers, and no crown moves.
- **The side with six assists and five goals.** Migrated as recorded, Completed, counting everywhere. The report links it. The first Manager to edit it is refused until an assist goes, which is the moment the truth gets typed.
- **The owner of two dashboards.** An Account, admin of their own Group linked to their Player there, and a plain Member of the real Group linked to their Player there, with the same nickname in both because that is what was typed.
- **The empty shell with a competition.** No Completed match, so no Group; its competition and its Account's ownership vanish; the Account remains and sees "Create a Group".
- **The Season-2 test.** In the skip input; the report lists it as dropped by input; the one match, its Season 1 and Season 2 go with it.
- **The open vote nobody wanted at Cut-over.** The evening is a Friday; Wednesday's deadline has passed; nothing is open; the four-case rule still stands for the day it is not so.
- **A dry run that throws.** The Season summary of the real competition throws on a match with a six-player bench; the dry run fails; the engine is fixed; the next dry run passes; the Group home never saw it.
- **The report rejected.** The career cross-check shows twelve goals missing from one Player. `READ_ONLY` goes off, DNS never moved, the old app resumes; the bug is fixed and the evening is repeated a week later.
- **A week after.** Someone pastes an old match link from the chat; the page says the link is from the old app and offers the Group home; the match is one tap away in the competition's list.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **One time zone as a job input**, Europe/Belgrade, confirmed by the dump's hour-of-day distribution.
- **Every User becomes an Account**, Member or not.
- **Home in Black, Away in White**, as sides of every migrated match.
- **The four-case vote mapping** with no "migrated" reason.
- **Migrate as recorded, report every violation**, with one stated rule per constraint the schema would refuse.
- **The report as an Operator artifact only**, the Group told through the chat.
- **`import-legacy` as a seventh image command** reading the old database over its own URL, deleted after acceptance.
- **Refusal of a non-empty target, one transaction per Group, fresh ids each run, a dry-run flag, the id map in the report.**
- **The old app's `READ_ONLY` flag** as the freeze, reversible in seconds, also stopping its crons.
- **The Cut-over sequence** with the point of no return at the first write after DNS moves.
- **One "from the old app" page** for every old path.
- **The chat message, no mail.**
- **Decommissioning**: 14 days read-only after acceptance, the old Postgres gone after 30, the final dump archived indefinitely, the old repository archived.
- **An "imported" activity-record entry per Group** and **`imported: true` on the "recorded" change-record entry**.
- **No invitation migrates**; the moderator rule stands.
- **Group settings at birth**: the name input with the competition-or-admin default, 5-a-side, the owner linked to their own Player.
- **Every migrated Account verified.**
- **No password hash migrates**; a migrated Account is born with no Sign-in method (ADR 0012).
- **Dashboards with a Completed match become Groups, minus the skip input.**
- **Unicode letters are letters** in a Nickname.
- **The mapping details** as tabled: display names, join dates, the default voting period where null, Minimum matches from the live column, the date read in Belgrade, the Season pair carried, the Team rows and the empty-dashboard Players dropped.
- **The career cross-check and the derivation pass** in the verifier.
- **Cut-over allowed once the new app matches what the group uses today**, team formats later.
- **Three dry runs by hand.**
- **Cut-over and Migration report** in the glossary.

### Declined, and why

- **Inferring a time zone per Group** from match hours, or **UTC**. One group in one city; UTC puts a late match on the wrong day.
- **Accounts only for Users that end up Members**, or **only for recent sign-ins**. Deleting a person's sign-in for no gain; the purge rule applied without its warning.
- **Alternating or null side colours.** Every match reads the same way and the domain has no colourless side.
- **A "migrated" close reason.** The two automatic reasons cover every old close.
- **Repairing violations in the job**, or **refusing to migrate until the old app is fixed by hand.** The first invents facts; the second edits production one last time.
- **A per-match note on changed ratings**, or **an admin banner listing them.** The first stored fact about a rating; the Operator and the admin are the same person; the chat is the channel.
- **A separate throwaway package**, or **SQL-only with `INSERT … SELECT`.** The first duplicates the schema; the second cannot run the engine.
- **Deterministic ids from old ids** for idempotent re-runs. UUIDv5 against ADR 0009 for no lasting benefit.
- **Suspending the old app without a code change**, or **the host's maintenance mode.** The first loses the readable old app the operations session asked for; the second hides everything.
- **Per-id redirects for old links.** A second artifact to ship and delete for links a week old.
- **An Account mail at Cut-over.** Fifty mails from a new domain on day one, to addresses never verified through the new app.
- **Verifying only the password Accounts that become Members**, or **sending them a verification mail at Cut-over.** A third Account state; a day-one mail burst.
- **Migrating bcrypt hashes with a branching verifier.** Ten people, nine gone, against a dependency the new app was built without.
- **The settled "any competition makes a Group" rule** as is. It would create a Group out of an empty shell.
- **Waiting for League and Knockout before Cut-over.** Every week on the old app is a week of drifting counters; the migrated data touches no team-format table.
- **A dry run in the deploy workflow.** Ceremony for a job that lives for weeks.

## Hand-offs to other sessions

This is the last session; the hand-offs are amendments applied to the other documents in this session, and the two things the new repository inherits.

- **Identity (1)**: the glossary's Account entry gains the migrated exception, no Sign-in method until the first sign-in; every migrated Account is verified; forgot password is the path to a first password; ADR 0012.
- **Groups (2)**: the rule is tightened from "at least one competition" to "at least one Completed match" plus a skip input; the Nickname rule reads Unicode letters; no invitation migrates; the "imported" activity-record kind.
- **Competitions (3)**: a null voting period becomes the default 3; Minimum matches is read from the live column.
- **Seasons (4)**: the closed Season 1 and Empty Season 2 pair migrates as it is, unless its dashboard is skipped.
- **Matches (8)**: Black and White as the migrated sides; the "recorded" entry carries `imported: true`; a migrated match that fails a completion check is Completed and fixed on first edit.
- **Voting (9)**: the four-case vote mapping; a malformed ballot, should one appear, migrates voided.
- **Architecture (12)**: `import-legacy` as a module of `server` and a seventh image command, deleted after acceptance; the dry-run flag; the verifier's career cross-check and derivation pass.
- **Frontend (13)**: the "from the old app" page; "Imported · recorded by Ana" on a migrated match's change record.
- **Operations (14)**: the Cut-over runbook outline above for `docs/ops/cut-over.md`; the `archive/` prefix in the bucket; the old app's `READ_ONLY` flag; the decommissioning timeline.
- **The new repository**: this document becomes `docs/spec/15-migration.md`; the two counts to re-run are the dump profile, replaced by the first dry run, and the better-auth facts, checked against the version pinned at the time.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md` under Operations: **Cut-over**, **Migration report**. Amended there: **Account** (the migrated exception), **Nickname** (Unicode letters). "Import", "dry run", "skip input", "id map" and "legacy" are implementation vocabulary and live in the job and `docs/ops/cut-over.md`. Retired: "the dump at the repo root" as a source, "Dashboard" as anything the new app has ever seen.
