# Seasons

_Branch session 4, 2026-09-11. Output of the fifth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md` and `03-competitions.md` as settled; settles the open questions under area 4 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

A Season is one run of a Competition, like a football season: the Tuesday five-a-side's 2026/27, the summer league's second edition, the cup as it was played this year. Seasons exist so a recurring competition keeps its history and its Player pool without being recreated, so a League can start a fresh table and a fresh schedule, and so a Past season stays exactly as it was played. Every match belongs to one Season, and every new match lands in the Current one.

## Decisions carried in from the map

- Seasons for every Format, admin-triggered. A closed Season is read-only. Reset competition is dropped.
- Every new match lands in the Current season. Voting open at rollover runs to its deadline. This session owns that rule.
- Completed match is the unit that counts for standings, stats and Minimum matches.
- Minimum matches counts across Seasons.
- From the competitions session: End competition closes the Current season without opening the next and shares Start new season's machinery; an empty Current season is discarded on End; Start new season on an Ended competition reopens it with the next number; numbering continues across an End and a reopening; team count, legs, bracket size and seeding are generation inputs per Season, prefilled from the previous Season; match format on a team format changes only while the Current season has no matches; settings apply forward and a match carries the settings it was created under.
- From the groups session: rolling a Season is a Group admin act; every act that changes what someone may do goes in the activity record; Roster setup draws from the Player pool.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Start new season counts matches of any kind.** Its one precondition is that the Current season has at least one match, and a League's freshly generated Fixtures satisfy it. The button is disabled until then.
- **Closing and opening share one instant.** The transaction stamps the end on the open Season and inserts the next number with the same timestamp; for a League it zeroes the standings counters in place and writes nothing else: no Fixture, no match, no roster. Only an admin may call it; a moderator is refused.
- **A Fixture not completed at rollover stays not completed forever.** No code voids, carries, deletes or blocks. The dialog says "N fixtures are not completed. They stay in season X as they are." ADR 0002 states the rule and the tests assert the counts survive.
- **Read-only is enforced in two places** on the server: a guard shared by match update and delete, and one inside League match completion. Match creation needs no guard because it always stamps the Current season. Voting never looks at the Season at all; ADR 0002 says so ("voting is not a Match write"), and a test accepts a ballot on a Season 1 match after the rollover.
- **Read-only exists because standings are counters.** ADR 0002 gives the reason: the Current season's table is a set of live counters zeroed at rollover, so a late write to a Past season would corrupt it or leave a completed-but-uncounted match. ADR 0003 derives a Past season's and the All seasons table from Completed matches at read time, using the competition's current teams under their current names.
- **After a League rollover the client sends the admin to team setup**, which regenerates Fixtures only while the Season is empty, from the competition's same team rows carried across Seasons, copying the match type from the latest match of any Season.
- **The selector lives in the URL** as a season number or "all"; absent means the Current season. A competition with one Season shows no selector. Seasons are listed newest first with All seasons last. Display is "Season N", the number only, followed by the act timestamps as dates: "Season 2 · 2 Mar 2025 – 14 Sep 2025", "since 14 Sep 2025" for the Current season, and a locked banner on a Past season. There is no label column and no season id on the wire; the number is the identity.
- **Per-competition tables follow the selection**; the career page ignores Seasons entirely and pools every match of every competition.
- **The Voting threshold is counted per Season and never pooled**, the opposite of the map's Minimum matches.
- **Reset deletes every Season** and restarts at 1.
- **Production holds six Season rows across five competitions.** Exactly one rollover has ever happened, closing a one-day Season 1 on 2026-09-03 at the same instant Season 2 opened.

## The model

### Season

A Season belongs to one Competition and has:

- a **number**, from 1, continuing across an End and a reopening; numbering never has gaps, because an empty Season is discarded rather than closed and Reopen last season removes the empty Season after it;
- an optional **label**, up to 30 characters, unique within the Competition ignoring case and surrounding or repeated whitespace, typed on the Start new season screen or edited later by a Group admin;
- a **start** and, once closed, an **end**: the instants of the admin's acts, never moved by a match date;
- its **matches**; and, in a team format, its **teams, rosters and schedule or bracket**.

Nothing else. There are no per-Season settings and no overrides: anything one would want to change per Season is either a generation input (team count, legs, bracket size, seeding) or a competition setting applied forward (match format, changeable only while the Current season is empty). Managers and Minimum matches belong to the Competition and cross Seasons without anyone carrying them.

A Season is shown as "Season N", or "Season N · label" where a label exists, followed by its **played span**: the dates of its first and last Completed match, "Mar to Jun 2026", or "since Mar 2026" for the Current season and "no matches yet" for one with nothing completed. The act instants stay facts, visible in the activity record, not the face of a Season. A match entered with an earlier date may fall outside a Past season's shown span, which is fine.

### What a Season is per Format

| Format   | A Season holds                                   | After rollover                                                                                                                                                             |
| -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pickup   | A boundary and a per-Season player table         | Nothing to do; the next match lands in the new Season                                                                                                                      |
| League   | Teams and rosters, a schedule, Standings         | Roster setup opens prefilled from the previous Season's teams and rosters as a draft, then a Manager generates the schedule with inputs prefilled from the previous Season |
| Knockout | Teams and rosters, a bracket, a winner or nobody | The same, then a Manager draws the bracket with inputs prefilled from the previous Season (settled in `07-knockout.md`)                                                    |

Whether a team is one record across Seasons or a copy per Season, and therefore whether an All seasons Standings table makes sense, was the teams session's call. Settled in `05-teams.md`: a Team is a Group record and a Season holds Entries, one per Team with its roster, so All seasons Standings exist and pool by Team. A Pickup Season needs nothing after rollover.

### Current, Past and empty

The **Current season** is the one open Season of a Competition; an Active competition has exactly one and an Ended competition has none. A **Past season** is a closed one. A Season is **empty** while it has no Completed match: a generated but unplayed schedule and a roster draft do not make it non-empty. Only an empty Season can be discarded, and only a non-empty one can be closed.

### Start new season

A Group admin act on the competition's settings screen, behind a confirmation screen. "Rollover" is its informal name. On an Active competition it closes the Current season and opens the next in one act, at one instant; on an Ended competition it opens the next Season only, making the competition Active again.

**Precondition**: the Current season has at least one Completed match. An empty Current season cannot be rolled; it can be discarded through End competition, or left alone while the League session's regenerate-schedule act fixes whatever went wrong. Nothing about voting blocks the act.

**The confirmation screen** shows the Season being closed with its summary; the outstanding Fixtures, and in Pickup the matches to play, by name, that will become Not played; the open votes that keep running to their deadline; the label field for the new Season; the Award threshold the new Season will run under, with a link to change it (settled in `10-stats.md`); and, for a team format, what comes next: Roster setup, then the schedule or bracket. End competition shows the same screen without the label field and the threshold line.

**Effects**: the closing instant is stamped on the old Season; every match of it that is not completed becomes Not played; the new Season opens with the next number and the label; open votes are untouched. A team format's new Season is Current from that instant and holds no match until the schedule or bracket is generated.

### End competition

The closing half of Start new season, owned by the competitions session and restated here for the two rules this session sharpened: an empty Current season is one with no Completed match, and discarding it on End deletes its unplayed Fixtures and roster drafts rather than marking them Not played, because nothing was played. A non-empty Current season is closed exactly as a rollover closes it, outstanding Fixtures becoming Not played.

### Not played

A match that was not completed when its Season closed. It stays in the Past season's schedule, marked Not played, so the schedule reads as it was. It counts nowhere: not in Standings, not in player stats, not in Minimum matches, and it has no vote. It can never be completed, and a Correction cannot turn it into a result: that would be a new completed match in a Past season with a vote opening months late. The one way back from a Past season is Reopen last season. In Knockout, an unfinished bracket simply has no winner.

The League and Knockout sessions may reuse the state for a mid-season act (a fixture nobody will play, a withdrawn team), and decide separately whether a walkover is an awarded result rather than a Not played match. Settled in `06-league.md`: a Manager may mark a Fixture Not played mid-season, reversibly while the Season is Current, and a Walkover is an awarded 3-0 Completed match with no lineup, kept as such in a Past season. Settled in `08-matches.md`: every Format shares the to play, Completed and Not played states, so a Pickup match to play at closing becomes Not played by the same rule, listed apart from the competition's results; Pickup has no mid-season Mark Not played, a Pickup match nobody played being deleted instead.

### Past seasons are read-only, with one exception

A Past season accepts no new match, no deletion and no lineup change. Every new match lands in the Current season, so a match remembered after rollover lands in the new Season with its true date; a Past season never grows. Read-only is now a matter of purpose, not of counters: a closed Season is the record of what was played.

The exception is a **Correction**: a Group admin's edit of one Past season match's result facts, the scores, scorers, assists, own goals, shoot-out, date and video link. Never the lineup, the sides, the Season or the match format. Any Past season qualifies, including an Ended competition's last one; a Not played match does not. A Correction is allowed while a vote on that match is still open, because result facts do not touch the ballot, and voting never reopens, because voting reopens only on a lineup change. Standings and stats re-derive on their own since nothing is counted. Every Correction is recorded in the activity record with the old and new values. Managers never write to a Past season.

Settled in `08-matches.md`: in the Current season a Manager edits result facts at any time and they never reopen the vote; the lineup is editable while the vote is open or there is none and frozen after the deadline, with Un-complete as the recorded path for a late lineup fix.

### Reopen last season

The only way back, and the only reopening a Season ever gets. A Group admin act on the latest Past season, available while nothing has been played since it closed: either no Season follows it, or the Season that follows is empty. It discards that empty Season with its roster drafts and unplayed schedule, clears the end of the reopened Season, which becomes Current again, and returns the matches made Not played by the closing act to not completed. On an Ended competition it makes the competition Active with the reopened Season as Current. Numbering closes up. Recorded in the activity record.

Once anything has been played after a Season closed, no act reopens it; a Correction is all that remains.

### Voting across the boundary

Voting open at closing runs to its deadline, and a ballot on behalf may be submitted on a Past season match until then. Minimum matches counts Completed matches across every Season and never a Not played match. A Past season lineup cannot change, so a Past season vote never reopens. A Season that is reopened changes nothing about any open vote. Settled in `09-voting.md`: Close now and Extend, the acts on an open vote, are allowed on a Past season match too, since a vote act is not a match write.

### Views

- **Default selection**: the Current season on an Active competition, the latest Season on an Ended one.
- **The selector** lists Seasons newest first, "Season N · label · played span", plus All seasons. Matches, the player table, Standings and per-competition stats all follow it. All seasons player stats always work; an All seasons Standings table depends on team identity across Seasons and is the teams and League sessions' call. Settled in `05-teams.md` and `06-league.md`: it exists, pooled by Team.
- **Season summary**: a derived header on every Season, nothing stored. Leader: the top of the Standings in League, the winner in Knockout or the teams still in before the final, the MVP in Pickup as the stats session defines it. Then top scorer, top assists, most matches, most crowns, and the counts of Completed and Not played matches. A tie shows every name, the way a crown is shared. On the Current season the same lines read "so far". Settled in `10-stats.md`: the Pickup MVP is the Qualified Player with the highest average rating in the Season, ties shared.
- **The Seasons list** on the competition settings screen: every Season with number, label, played span, Completed and Not played counts; label edit on each; Reopen last season on the latest Past season when its condition holds. Since `10-stats.md`: each Season also shows the Award threshold it runs, or ran, under.

### Activity record

Season started, with the label; Season closed by End; Reopen last season; label changed; every Correction with old and new values; matches made Not played by a closing act. Each names the acting Account.

### Two admins at once

Two admins pressing Start new season together must produce one rollover, not two; today's code already loses the second by counting rows updated. How the rewrite guarantees it is the architecture session's business; the domain only requires one open Season per Competition and one act winning. Settled in `12-architecture.md`: a partial unique index holds the one open Season, and every Season act takes a row lock on the Competition, so the second admin re-reads under the lock and is refused.

## Scenarios that shaped the model

- **A rollover pressed a week early.** The new Season is empty; the admin reopens the last Season and the schedule, if generated, is discarded. The next Tuesday's match lands in the reopened Season.
- **A fixture played but not recorded before closing.** It is Not played. If nothing has been played since, reopen, record, close again. Otherwise it stays Not played: the confirmation screen listed it for a reason.
- **The Pickup match remembered on Wednesday, after Monday's rollover.** It lands in the new Season with Sunday's date. The old Season does not grow.
- **The typo found in March.** A 4-3 recorded as 4-2 in November. A Group admin corrects it; the Past season's Standings re-derive; the vote, long closed, is untouched.
- **The League that never finished.** Six Fixtures outstanding at closing become Not played and stay in the schedule as such. The table is what was played.
- **The cup with an unfinished bracket.** Ended with the semi-finals Not played; the Season summary shows the two teams still in and no winner.
- **A Pickup that runs for years.** The admin rolls whenever it feels like a new season; the label says "2026/27"; the pool and the Minimum matches count carry over untouched.
- **An Ended competition brought back.** Start new season opens the next number; Reopen last season instead would continue the old one, available only if the new Season is still empty.
- **A League Season generated by mistake.** Empty, so End discards it with its Fixtures and roster drafts; the last played Season stays the last.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Two named acts, three effects**: Start new season (close and open, or open on an Ended competition) and End competition (close only); no separate Close season.
- **At least one Completed match** as the precondition for closing, replacing "any match".
- **Not played** as the state for a match not completed at closing, in the same act, listed on the confirmation screen; carrying and blocking declined.
- **Past seasons read-only by purpose**, with **Correction** as a Group admin's result-only edit, logged, never reopening voting.
- **Every new match lands in the Current season**, even one remembered after rollover.
- **Reopen last season** as the single undo of both Start new season and End competition, while nothing has been played since.
- **Empty means no Completed match**; an empty Season is discarded, never closed, and its unplayed Fixtures and roster drafts go with it.
- **A Season holds only** number, label, start, end, matches and, for team formats, teams, rosters and schedule or bracket; no per-Season settings.
- **Team formats reopen through Roster setup** prefilled from the previous Season, then generation with prefilled inputs; Pickup needs nothing.
- **"Season N" plus an optional label**, unique within the competition.
- **Act instants as the facts, the played span as the display.**
- **Current season by default**, latest Season on an Ended competition, newest first plus All seasons.
- **A derived Season summary**: leader or winner or MVP, top scorer, top assists, most matches, most crowns, with ties shared, shown "so far" on the Current season.
- **A Seasons list on the settings screen** for labels and Reopen; no label field on the create form.
- **The confirmation screen contents** as listed, and activity record entries for every act.

### Declined, and why

- **Automatic or scheduled rollover.** A Season is the admin's act.
- **Planned start and end dates, with nudges.** The competitions session declined dates on the competition for the same reason; the label carries the year.
- **A Season per calendar year for Pickup.** Same.
- **Carrying unfinished Fixtures into the next Season.** The next Season has its own schedule.
- **Blocking the rollover until every Fixture is completed.** It leaves a League stuck on a match nobody will play.
- **Deleting or hiding a single Past season.** It is history; End and Reopen cover mistakes.
- **Per-Season settings overrides.** Generation inputs and forward-applied settings cover every case raised.
- **Reopening a Season for writes once anything has been played after it.** Correction is enough, and a reopened Season would grow.
- **Turning a Not played match into a result by Correction.** A new completed match in history would open a vote months late.
- **A stored champion or player of the season.** Derived, like every other stat.
- **A "season closed" email or notification.** The Past season's summary page is the moment to paste into the chat; the notifications session may add an opt-in notice later. Settled in `11-notifications.md`: declined; Copy as text of the Season summary is the message.
- **"Voided", "Cancelled" and "Abandoned"** as the name of the state; "Not played" says what happened.

## Hand-offs to other sessions

- **Competitions (3)**: applied to that document in this session: an empty Current season is one with no Completed match and its unplayed Fixtures and roster drafts are deleted on End; outstanding Fixtures at End become Not played; Reopen last season on an Ended competition makes it Active again.
- **Teams and rosters (5)**: Roster setup after a rollover opens prefilled from the previous Season's teams and rosters as a draft, committed only when confirmed; whether a team is one record across Seasons or a copy per Season, which decides whether All seasons Standings exist; roster drafts are discarded with an empty Season. Settled in `05-teams.md`: the draft is the unsaved form, and the "roster drafts" of an Empty season are its Entries and rosters, removed with it; a Team is one Group record across Seasons and competitions.
- **League (6)**: generation runs only in an empty Current season with inputs prefilled from the previous Season; Not played as the state for a fixture nobody will play, mid-season void and postpone acts and walkovers as awarded results are that session's; regenerating a schedule inside the same empty Season; the Standings leader for the summary; All seasons Standings. Settled in `06-league.md`: regenerate replaces the whole schedule while the Season is Empty; Mark Not played is a reversible Manager act and a Walkover an awarded result; postponing is a date change with no state; the leader is the top of the Standings with withdrawn Entries last; All seasons Standings pool by Team.
- **Knockout (7)**: an unfinished bracket has no winner and the summary shows the teams still in; a withdrawn team's ties may become Not played; the bracket is generated in an empty Current season. Settled in `07-knockout.md`: Draw the bracket runs in an Empty season and Redraw replaces it while Empty; a Season whose Final was not Completed has no Winner and its summary shows the teams still in; a withdrawn team's open Tie becomes a bye for the opponent or a Walkover; a Tie marked Not played mid-season cascades as a bye, and the closing act needs no cascade since everything left to play becomes Not played at once.
- **Matches (8)**: a match carries its Season and never moves; the restricted result-only edit shape of a Correction, and whether a Current season edit after the deadline shares it; if Pickup gets a record-then-complete life cycle, uncompleted matches at closing become Not played; Not played and Completed as the two terminal states of a Fixture. Settled in `08-matches.md`: every Format shares the to play, Completed and Not played states, so a Pickup match to play at closing becomes Not played, listed apart from results; a Current season edit of result facts never reopens the vote and the lineup is frozen after the voting deadline, with Un-complete as the path; a Correction that unlevels a score drops its Shoot-out.
- **Voting (9)**: a ballot, own or on behalf, is accepted on a Past season match until its deadline; a Correction never reopens a vote; Minimum matches never counts a Not played match; a reopened Season changes nothing about open votes. Settled in `09-voting.md`: all adopted; Close now and Extend are allowed on a Past season match's open vote; a Rated match needs three ballots, so the Season summary's crowns read Rated matches only.
- **Stats (10)**: the MVP rule for Pickup's Season summary (best average rating over a minimum of matches, or most crowns); the summary lines and their tie rule; per-Season and All seasons player tables; the career page today pools every Season and gains a per-Season view if that session wants one; Not played matches count in nothing. Settled in `10-stats.md`: the Pickup MVP is the Qualified Player with the highest average rating, ties shared; a Past season keeps the Award threshold it closed under and the Seasons list shows it; the Player page breaks a career down by Competition and Season.
- **Notifications (11)**: no closing notice now; an opt-in "season closed" notice is open to that session. Settled in `11-notifications.md`: declined; Copy as text of the Season summary is the moment.
- **Architecture (12)**: one open Season per Competition and one winner when two admins roll at once; Season number as the identity on the wire, the label as display; Not played as a stored state, not a derived one; Reopen as one transaction that discards, reopens and restores; the played span derived from Completed matches; the summary derived and possibly cached. Settled in `12-architecture.md`: one open Season per Competition as a partial unique index, and one winner through a row lock on the Competition inside every Season act; the Season number as the wire identity and a typed path param; Not played as a stored state; Reopen last season as one act in one transaction; the played span and the Season summary derived by the domain engine on read, uncached.
- **Frontend (13)**: the confirmation screens for Start new season and End; the selector with labels and played spans; the Season summary header and its "so far" variant; the Seasons list on the settings screen; the Not played marker in a schedule; the URL carries the Season by number. Settled in `13-frontend.md`: the selector is a skewed dropdown under the title band reading "Season 3 · 2026/27 · since Mar 2026" with All seasons last and a Past season tagged; the summary is the yellow award panel with "so far" on the Current season; the confirmations are full-screen sheets listing what becomes Not played; the Seasons list sits on the settings screen with label edit and Reopen last season.
- **Data migration (15)**: Season 1 per competition with its start at the competition's creation, as today; the one production rollover carries over as two Seasons with the same closing and opening instant; no labels; no Not played matches, since every production match is a Duel born completed; Reset never ran in production, so no gaps to reconcile.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Season, Current season, Past season, Empty season, All seasons, Start new season, Season label, Not played, Correction, Reopen last season, Season summary. "Reset competition", "rollover" as a formal name, "voided" and "close season" are retired; "rollover" survives only as the informal name of Start new season.
