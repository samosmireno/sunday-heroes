# Match recording

_Branch session 8, 2026-09-15. Output of the ninth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md`, `04-seasons.md`, `05-teams.md`, `06-league.md` and `07-knockout.md` as settled; settles the open questions under area 8 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

A match is the record of one game: who played on which side, the score, who scored and assisted, and the few facts a group wants to keep beside them. It is the most-used screen of the app, filled in on a phone at the pitch or on the sofa afterwards, and it is the unit everything else reads: Standings, the bracket, every stat and the vote all hang off Completed matches and nothing else. This session gives every Format one life cycle for a match, one completion act with one list of what must hold, one rule for which edits reopen the vote, and a change record so that free editing by Managers is safe to offer.

## Decisions carried in from the map

- A match records scores, scorers, assists, own goals, a shoot-out on the deciding match of a Knockout Tie, a lineup per side with a chosen formation, and a video link. Goals reconcile with the score. No cards, minutes or substitution events.
- Completed match is the unit that counts. Every new match lands in the Current season and never moves. A draw is a result.
- Ratings and man of the match are derived from ballots at read time; voting reopens only when a lineup changes and only before the deadline.
- From the groups session: a Manager records, edits and completes matches; the inline "type a nickname" path creates a Player under that session's rules; archived Players are not offered in pickers.
- From the competitions session: the lineup rule at completion is one to twice the match format per side, the rest of a lineup beyond the match format being substitutes who played; a Pickup match carries its own match format, prefilled from the competition's usual match format; a match carries the competition settings it was created under; the voting period counts from the completion act.
- From the seasons session: a Past season accepts only a Correction of result facts, by a Group admin, never of the lineup; a match not completed when its Season closes becomes Not played; Reopen last season returns those to to play.
- From the teams session: a Fixture's lineup is drawn from the two Entries' rosters, with Guest as the recorded exception; the picker offers the roster pre-selected and "add a guest" behind an action.
- From the League session: a Fixture has three states, to play, Completed and Not played; a planned date prefills the match date at completion; a Walkover is a Completed match with no lineup, never made through the match form; the home side is the side listed first; a generated Fixture is never deleted.
- From the Knockout session: completion of a level deciding match needs a shoot-out of two differing totals and any other match refuses one; the legs of a Tie are completed in order; a Fixture with an undecided side cannot be recorded; completion fills the next Tie's slot in the same act; any act that changes a Tie's winner is refused once anything is recorded on the next Tie.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **A Duel match is born completed** by a hard-coded flag in the request transform, with a Season stamped in the transaction, two literal Home and Away team rows, and voting opened at the same instant with a deadline of now plus the period. A League Fixture is created undated, 0-0 and not completed, and completed by a separate act whose only checks are at least one player row, at least one team row and a non-null date.
- **The server accepts a match with no players.** One Zod schema serves create and update: scores at least zero, a date that merely parses, an array of players with no minimum, no per-side minimum, no goals-versus-score rule, no position ceiling, and a video link that is any string. Future dates are refused only by the calendar widget. The client's rules, four per side and goals and assists each at most the side's score, live in the form alone.
- **Formation is never stored.** Each player row has an ordinal position assigned by list order and swapped by drag; the pitch view lets the viewer pick one of five hard-coded formations per match type and forgets the choice. The expanded match detail shows no positions at all.
- **Every edit reopens voting**, including a pure date, score or video edit and including a match whose vote had closed, with a fresh deadline and re-sent emails. Players are reconciled by nickname and side, so a player moved across sides is deleted and re-created, losing their rating and every vote that named them.
- **Penalties are two nullable columns the form never sends**; the create path copies the home total into the away one. **Own goals do not exist** as a concept anywhere. **The video link is never embedded**, only opened in a new tab.
- **Dates carry no time zone**: the client forces local noon and sends ISO, the server stores a full timestamp and returns a date by UTC truncation, and nothing on the server compares a match date to today.
- **Deletion is refused outside Duel** because League counters could not be unwound; a Duel match deletes with its votes by cascade.
- **No test fixture has a full lineup**: the largest is two against two.

## The model

### Match and its states

A **match** is one game of a Competition, in one Season, in the Current season when it is created, and it never moves. Every Format has the same three states:

- **to play**: created and not yet completed, with or without anything recorded on it;
- **Completed**: played and completed by the act below, or awarded as a Walkover;
- **Not played**: nobody will play it, by the closing act of its Season or, in a Team format, by a Manager's Mark Not played.

Only a Completed match counts anywhere. **Fixture** stays the Team format word for a match that exists because a schedule or bracket, an added cycle, an added Entry or a Manager put it there; a Pickup match is created by **Add match** and, until it is completed, is simply a match to play. In Pickup a match to play is the sides drawn at the pitch before kick-off, or a game pencilled in for next Tuesday; it has no vote, counts in nothing, and is completed in the same form once the score is known. Whether it is created and completed in one act or two is the recorder's choice, not a fact of the domain: a match with a score completes in one tap.

### The facts of a match

| Fact                | Kind   | Rule                                                                                                                                                                                                                                                                                     |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Season              | fixed  | The Current season at creation; never changes                                                                                                                                                                                                                                            |
| Match format        | result | Pickup only, 3 to 11, prefilled from the usual match format; a Team format match inherits the competition's. A change that would leave a side above twice the new format is refused                                                                                                      |
| Date                | result | One calendar date in the Group's time zone, no time of day. Optional and possibly in the future while to play, where it is the planned date; required and not later than today at completion, prefilled from the planned value. Matches on one day order by the order they were recorded |
| Sides               | lineup | An ordered pair, the first listed first in every result line. In Pickup each side has a colour; in a Team format each side is an Entry                                                                                                                                                   |
| Scores              | result | One integer per side, 0 to 99                                                                                                                                                                                                                                                            |
| Lineups             | lineup | Per side, the lineup rows below                                                                                                                                                                                                                                                          |
| Formation and slots | result | Per side, one of the fixed formations for the match format, and which row fills which slot; the rest on the bench                                                                                                                                                                        |
| Shoot-out           | result | Two totals 0 to 99 that differ, present if and only if the match is a level Deciding match                                                                                                                                                                                               |
| Video link          | result | One https URL of at most 2048 characters, optional                                                                                                                                                                                                                                       |
| Note                | result | Optional text of up to 500 characters: "played in the rain", "Marko's debut", "abandoned at sixty minutes, result stands"; on a Walkover or a Not played Fixture it says why, "pitch closed" (`06-league.md`)                                                                            |
| Settings snapshot   | fixed  | The voting switch, voting period and Minimum matches in force at creation, as the competitions session requires                                                                                                                                                                          |

"Result" and "lineup" name the two kinds of fact the editing rules below distinguish. No kick-off time, no venue, no referee, no weather, no photos, no comments.

### Sides

Every match has two **sides**, an ordered pair read first-then-second everywhere: "Red 4-3 Blue". The order is a reading convention and nothing reads it; in a Team format it is the League session's home side, in Pickup it is only which side is listed first.

In a Team format a side is an Entry, fixed by the schedule or bracket. In **Pickup** a side has a **colour** from the same palette Teams use, chosen per match and prefilled from the competition's previous match, because the bibs are the same every week; the two sides of one match must differ in colour, and the first match of a competition is prefilled with two distinct palette defaults. A Pickup side has no name, no team and no history: the same colour next week is a new side.

### Lineup and lineup rows

A **lineup** is the set of Players on one side of a match. It is made of **lineup rows**, one per Player, each carrying:

- the **Player**, an active Player of the Group's pool, or one typed inline as a new Nickname under the groups session's rules; an archived Player already in a lineup stays, one cannot be added;
- the **side**;
- a **slot** in the side's formation, or the **bench**;
- **goals**, **assists** and **own goals**, counts from zero;
- in a Team format, a **guest** mark when the Player is not on that Entry's roster.

A Player appears at most once in a match. A lineup holds at least one row and at most twice the match format, roster Players and guests together; a side short of the match format is warned about and accepted, because a short side is a real Sunday. Everyone in a lineup played: a bench row is a substitute who counts for stats and the vote exactly like a slot row.

There are no goal events. Counts per row are what a phone records at the pitch, nothing in any stat reads a goal-to-assist pairing, and counts can grow into events later without breaking anything.

### Goals, assists, own goals and the score

The **score** is the fact; scorers are **attributions** to it. For each side:

- its players' goals plus the opponents' own goals are **at most** its score, never more; the remainder is **unattributed** and shown as such, "2 unattributed", warned about in the form and accepted at completion, because nobody remembers who scored the fourth;
- its players' assists are at most its players' attributed goals; an own goal has no assist.

An **own goal** is a fact on the lineup row of the Player who scored it: it counts toward the opponents' score and never as a goal for the Player, and the stats session may give it a column of its own. There is no score derived from the attributions and no requirement that every goal be attributed: both refuse the match over a memory gap.

### Formation and bench

Each side picks a **formation** from a fixed list per match format, the first entry the default. Read as defenders first with the keeper implied, so the numbers sum to one less than the match format:

| Match format | Formations                                   |
| ------------ | -------------------------------------------- |
| 3-a-side     | 1-1                                          |
| 4-a-side     | 1-2, 2-1                                     |
| 5-a-side     | 1-2-1, 2-1-1, 1-1-2, 2-2                     |
| 6-a-side     | 2-2-1, 2-1-2, 1-2-2, 3-2                     |
| 7-a-side     | 2-3-1, 3-2-1, 2-1-2-1, 3-1-2                 |
| 8-a-side     | 3-3-1, 2-3-2, 3-2-2                          |
| 9-a-side     | 3-3-2, 3-2-3, 4-3-1                          |
| 10-a-side    | 4-3-2, 3-4-2, 4-4-1                          |
| 11-a-side    | 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2, 4-1-4-1 |

The first rows of a lineup fill the slots in order, the keeper first and then the lines as the formation reads them, defenders to attack, each left to right, and the rest sit on the **bench**; the recorder drags to rearrange, and the pitch view draws the match as it was recorded. The formation and each row's slot are kept so a past match renders faithfully, but **position is presentation only**: no positional stat, no goalkeeper mark, no "played as" anywhere. In five-a-side the keeper rotates every ten minutes, so a stored keeper would be a lie half the time. A clean sheet, if the stats session wants one, is a fact of a side that conceded nothing, not of a keeper. The list is fixed in the app and the frontend session may tune its entries; a Group cannot edit it. Settled in `13-frontend.md`: kept as listed; the form picks a formation per side and orders rows into its slots, with drag on a desktop and move up or down in the row sheet on a phone.

### Shoot-out

As the Knockout session settled: two totals that differ, on a level Deciding match only, refused elsewhere, "Red won 4-3 on penalties". Per-kicker facts, who scored and who missed, are declined. A Correction or edit that makes a level score unlevel must drop the shoot-out, and one that makes it level must add one, so the invariant holds after every write; in a Knockout both fall under the "nothing recorded on the next Tie" rule when they change the winner.

### Recording and completion

**Add match** is the Manager act that creates a Pickup match; a Fixture already exists. Either kind is then recorded through one form with two acts:

- **Save** stores whatever has been entered as a match to play. A draft may lack a date, a score or players; it is well-formed but not checked. This is the lineup typed before kick-off, the sides drawn at the pitch, the League schedule's confirmations listing a Fixture "with a lineup recorded but not completed".
- **Complete** makes the match Completed. It runs the checks below, stamps the completion instant, opens the vote if the match's settings say so, with the deadline counted from this act, and in a Knockout fills the next Tie's slot. A Fixture with an undecided side cannot be recorded at all, and a second leg cannot be completed before the first.

The form, per Format:

- **Team formats**: each side's picker opens with the Entry's roster pre-selected; removing someone who did not turn up is a tap; "add a guest" opens the rest of the active pool and the inline nickname path, marks the row as a guest, and warns when the guest is on another Entry's roster this Season. The match date is prefilled from the planned date.
- **Pickup**: each side's picker offers the active pool with search and the inline nickname path; no guest concept. Settled in `13-frontend.md`: the pool is loaded whole and searched in the client, under the headings "Played this Season" and "Everyone else", as is a team format's "add a guest". Two helpers fill the form: **Copy last lineup** prefills both sides from the competition's previous Completed match, since the regulars are the regulars, and **Draw sides** takes the Players who turned up and deals them across the two sides at random or balanced by average rating, the teams session's Draw teams reused, for adjustment before Save (the balance formula is settled in `10-stats.md`: the last 10 Rated matches Group-wide, the median for a Player with none, sums shown). The match format is prefilled from the usual match format and the side colours from the previous match.

In both, the form shows the formation with the first rows in slots and the rest on the bench, and a goal, assist and own-goal counter beside every name. A match with a score completes in one tap; the primary button reads Complete whenever a score is present.

### Validation at completion

What the server refuses at completion, for every Format. The form may say all of it earlier, but the form is not the rule.

1. The Season is Current; the match is not Not played; in a Knockout both sides are decided and the first leg of the Tie is Completed before the second.
2. A date, not later than today in the Group's time zone.
3. Two scores, integers 0 to 99.
4. Each side has one to twice the match format lineup rows; no Player twice in the match; no archived Player newly added.
5. In a Team format, each row's Player is on that Entry's roster or is marked as a guest.
6. Goals, own goals and assists reconcile as above: attributed at most the score, assists at most attributed goals.
7. A shoot-out of two differing totals, 0 to 99, is present if and only if the match is a level Deciding match.
8. A video link, if any, is an https URL of at most 2048 characters; a note is at most 500 characters.

The form warns without refusing on: a side short of the match format, an uneven number per side, unattributed goals, a guest on another Entry's roster this Season, and a **duplicate**, a Completed match in the competition on the same date with the same set of Players, which is how a double entry is caught before it counts.

### Editing a match

Two kinds of fact, two rules:

| Facts                                                                                                                                                       | While the Season is Current                                                                                                  | In a Past season                                  | Reopens the vote                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **Result facts**: scores, goals, assists, own goals, shoot-out, date, video link, note, formation and slots, guest marks, side colours, Pickup match format | A Manager, any time, with the completion checks re-run                                                                       | A Group admin's Correction, on the facts it names | Never                                                            |
| **Lineup facts**: which Players are in the match and on which side                                                                                          | A Manager, while the match's vote is still open or the match has no vote; **after the voting deadline the lineup is frozen** | Never                                             | When a Player is added or removed; a move between sides does not |

A Player added or removed changes who votes and who can be voted for, so the vote reopens; a move between sides changes neither, so it does not. Once the deadline has passed the lineup is frozen and the path for a late lineup error is Un-complete, below, which is deliberate and recorded. Every edit re-runs the completion checks on a Completed match, so a match never leaves an edit in a state completion would have refused.

What reopening does to existing ballots is the voting session's to settle; this session hands over its recommendation: the deadline set by the completion act stays; ballots that still name three Players in the match stand; a ballot by a removed voter or naming a removed Player is voided and that voter may vote again; a Player added may vote and be voted for until the same deadline. Settled in `09-voting.md`: adopted as recommended, with the voter told on the match page that their ballot was voided; Close now and Extend on an open vote join the change record.

### Un-complete

**Un-complete** is a Manager act on a Completed match while its Season is Current: the match returns to to play with its lineup, scores and every other fact kept as a draft. It exists for the result recorded on the wrong Fixture, the lineup error found after the vote closed, and the Knockout session's undo forward. Rules:

- in a Knockout, refused once anything is recorded on the next Tie; otherwise the slot it filled is cleared in the same act;
- a Walkover is not un-completed; it has Undo walkover;
- **ballots are kept**, not discarded, and re-validated against the lineup when the match is completed again, by the same rule as a lineup change;
- completing again is a completion act, so the voting period runs afresh from it.

Un-complete followed by Complete is therefore the visible way to reopen a vote for a late lineup fix, recorded twice in the change record, rather than a hidden reopen act. In a Past season nothing is un-completed; a Correction is all there is.

### Deletion and Not played

- **Pickup**: a Manager may delete a match, to play or Completed, while the Season is Current, after a confirmation that names the ballots that go with it. Deletion is how a double entry or a game that never happened is removed; Pickup has no Mark Not played mid-season.
- **League and Knockout**: as those sessions settled. A generated Fixture is never deleted; an Extra Fixture is deletable while to play; a Completed Fixture nobody should have played is un-completed and then marked Not played.
- **Past season**: nothing is deleted, ever.

**Not played** in Pickup arises only from the closing act: a Pickup match to play when its Season closes becomes Not played like a Fixture, stays in the Season, counts in nothing, is listed apart from results rather than among them, and is returned to to play by Reopen last season. One rule for the closing act across Formats, and Reopen keeps its one behaviour.

### Change record and the activity record

Every match carries its own **change record**: an entry per act naming the acting Account, tombstoned if that Account is later deleted, as the activity record does. Created, completed, un-completed, each edit with the fields changed and their old and new values, Walkover and its undo, Mark Not played and Restore, Correction, and, settled in `09-voting.md`, Close now and Extend on the match's vote. Managers and Group admins see the whole record on the match page, newest first and paged like the other append-only records (`12-architecture.md`, Paged reads). Every Member sees one line of it, **"Recorded by Ana"**, naming the Account that completed the match, so a match has a visible author the way a ballot on behalf names its submitter. Settled in `15-migration.md`: a migrated match's "recorded" entry names the Group's first admin at the old creation instant and carries `imported: true`, so the line reads "Imported · recorded by Ana" rather than claiming Ana pressed Complete.

The Group activity record, which is for who-may-do-what, receives only the acts that change what counts: **un-completion and deletion**. It would drown in "+1 assist" otherwise. Correction stays in it too, as the seasons session decided.

### The match page and the list

Every match has a page of its own, Members only like everything else: the result line with colours or Entries, the date, the Not played or Walkover mark, per side the lineup on the pitch in its formation with the bench beneath and each row's goals, assists and own goals, the shoot-out line, the video link, the note, "Recorded by", and whatever the voting session puts there: the vote's state, the ratings and the crown. Settled in `09-voting.md`: the vote block shows the deadline and the turnout by name while open, the ratings, results breakdown and crown once Rated, "Not rated, 2 of 12 ballots" with the turnout otherwise, and why when there is no vote; Copy vote link lives here, and, from `11-notifications.md`, Copy reminder text beside it while the vote is open. A match page is what a vote share link opens on. The competition's match list shows Completed matches newest first, matches to play above them, Not played matches apart, the Completed list paged fifty at a time (`12-architecture.md`, Paged reads); a Team format's schedule view is the League and Knockout sessions'. Whether the pitch is drawn or listed on a phone, and a "copy result as text" action for the group chat, are the frontend session's. Settled in `13-frontend.md`: the match page draws the pitch, two half-pitches stacked on a phone, and the form lists it; copy result as text is accepted under the one Share control.

### Roles

| Act                                                       | Manager | Group admin |
| --------------------------------------------------------- | ------- | ----------- |
| Add a Pickup match; Save a draft; Complete                | yes     | yes         |
| Edit result facts while the Season is Current             | yes     | yes         |
| Edit lineup facts while the vote is open or there is none | yes     | yes         |
| Un-complete                                               | yes     | yes         |
| Delete a Pickup match                                     | yes     | yes         |
| Correction on a Past season match                         |         | yes         |
| See the full change record                                | yes     | yes         |

Members read every match and see "Recorded by". A Linked Player who disputes their own goal count asks a Manager; nothing on a match is self-service.

## Scenarios that shaped the model

- **Sides drawn at the pitch.** The Manager adds a match, taps the fourteen who turned up, hits Draw sides balanced by rating, swaps two, Saves. After the game, scores and scorers, Complete. The vote opens now, not at kick-off.
- **Eleven at the five-a-side.** Six against five, recorded as five-a-side; the sixth is on the bench and played. The pitch shows five shirts and one on the side.
- **Nobody remembers the fourth goal.** 4-3 with three scorers attributed; "1 unattributed" on the page; the match completes.
- **An own goal decides it.** Marko's own goal is on his row and in Blue's score; Blue's scorers add up to two of their three.
- **Recorded on Tuesday, played on Sunday.** The date is Sunday; the voting period counts from Tuesday's completion.
- **A pure typo.** 4-2 corrected to 4-3 on Wednesday; the vote does not reopen and the Standings re-derive.
- **The wrong Marko.** Found on Monday with the vote open: swap the Player; the vote reopens for those affected until the same deadline. Found the following week with the vote closed: Un-complete, swap, Complete; the vote runs afresh and the change record shows both acts.
- **Moved to the other side.** Ana was on Red, not Blue: a lineup edit that reopens nothing, because the same people are in the match.
- **The result on the wrong Fixture.** Un-complete it, edit the Fixture's Round, Complete it; or Un-complete and record on the right one.
- **The 2-2 Final.** Complete is refused until the shoot-out totals are typed; a later Correction to 3-2 drops them.
- **A double entry.** The form warns that a match on that date with those Players exists; if it was already completed, a Manager deletes it after reading how many ballots go.
- **The pencilled-in Tuesday that never happened.** Deleted. Left alone until the Season closes, it becomes Not played and sits apart from results.
- **"Who put this in?"** The match page says "Recorded by Ana"; an admin opens the change record and sees the score edit and who made it.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **One life cycle for every Format**: to play, Completed, Not played, with a Pickup match created by Add match and completable in the same act.
- **One date, date-only in the Group's time zone**, planned before completion, required and not in the future at completion, same-day order by recording order.
- **A colour per Pickup side** from the Team palette, prefilled from the previous match.
- **Counts, not goal events**: goals, assists and own goals per lineup row.
- **The reconciliation rule**: attributed goals plus opponents' own goals at most the score, the rest unattributed and warned about; assists at most attributed goals.
- **Own goal as a per-player fact** counting for the opponents.
- **A fixed formation list per match format**, slots and a bench, position as presentation only.
- **Result facts versus lineup facts**, with adding or removing a Player as the only trigger for reopening a vote, and the lineup frozen after the deadline.
- **Un-complete** as a Manager act while Current, ballots kept and re-validated, a fresh period on re-completion, the Knockout guard.
- **Manager deletion of a Pickup match** while Current with a confirmation naming the ballots.
- **The eight-point server validation list** and the five form warnings.
- **One video link and a note** of up to 500 characters.
- **Draw sides, Copy last lineup and the duplicate warning.**
- **Not played in Pickup** from the closing act only, shown apart from results; no mid-season Mark Not played in Pickup.
- **A per-match change record** in full for Managers and admins, "Recorded by" for every Member; only un-completion and deletion join the activity record.
- **The lineup form's shape** per Format as described, layout left to the frontend session.
- **A match page** per match, the target of a vote share link.

### Declined, and why

- **Pickup born Completed.** Draw sides before kick-off needs a match that exists before it is played, and one life cycle means one completion act and one validation list.
- **A kick-off time, a venue.** Nothing reads them; three games one evening are recorded in the order played.
- **Goal events** with scorer and assister paired. Nothing reads the pairing; counts are what a phone records.
- **Strict attribution of every goal**, or **a score derived from the attributions**. Both refuse a match over a memory gap.
- **A goalkeeper mark, positional stats, free shirt placement, or no formation.** The keeper rotates; a slot and a formation draw the pitch faithfully and claim nothing more.
- **Shoot-out kickers.** Two totals read as football.
- **Several video links, photos, comments.** A link and a note are enough; a media feature is later work.
- **Move a result to another Fixture.** Un-complete and record again covers it.
- **Who's in?**, an availability poll on a match to play. Deferred, not declined: the uniform life cycle leaves room for it, and it belongs with notifications and share links.
- **Discarding ballots on Un-complete.** Re-validation keeps what is still true.
- **Group admin only for deleting a Completed Pickup match with ballots.** The Manager at the pitch is the one who spots the double entry; the confirmation and the change record make it safe.
- **A Group-editable formation list.** Presentation only; ceremony.
- **Every match edit in the Group activity record.** It would drown the record meant for who-may-do-what.
- **Mark Not played in Pickup.** Delete is the act; Not played in Pickup is only what the closing act leaves.

## Hand-offs to other sessions

- **Groups (2)**: a Manager records, edits, completes, un-completes and deletes as the role table says; the inline nickname path is the lineup picker's; un-completion and deletion join the activity record, other match edits do not.
- **Competitions (3)**: applied to that document in this session: the lineup rule is enforced at completion and re-run on every edit; the Pickup match format is a result fact of the match; the bench is the rows beyond the formation's slots.
- **Seasons (4)**: applied to that document in this session: a Pickup match to play at closing becomes Not played, listed apart from results; the Current season edit after the deadline takes the Correction shape for result facts, with the lineup frozen; Un-complete and Correction keep the shoot-out invariant.
- **Teams and rosters (5)**: applied to that document in this session: the lineup form recommendation is adopted; the guest mark is a result fact of the row; the cap counts roster Players and guests together.
- **League (6)**: applied to that document in this session: the planned date and the match date are one field; a Fixture with a lineup recorded but not completed is a Save; Un-complete is the act before Mark Not played on a Completed Fixture; a deleted Extra Fixture is the only Fixture deletion.
- **Knockout (7)**: applied to that document in this session: per-kicker shoot-out facts are declined; Un-complete clears the next Tie's slot in the same act and is refused once anything is recorded there; a Correction that unlevels a score drops the shoot-out.
- **Voting (9)**: the vote opens at the completion act, never on a match to play; a Player added or removed is the reopening trigger, a side move is not; the ballot survival recommendation above; Un-complete keeps ballots and re-completion runs a fresh period; a substitute votes and is voted for; a Not played or Walkover match has no vote; the match page hosts the vote and is the share link's target. Settled in `09-voting.md`: all adopted, with the voter told of a voided ballot; the share link is the match page URL with no voter in it; a match with fewer than four Players has no vote.
- **Stats (10)**: own goals as a column; unattributed goals in a side's total and nobody's; a bench row counts as played; a clean sheet, if wanted, as a side fact; the average rating that Draw sides balances on; Draw sides and Copy last lineup read the competition's history. Settled in `10-stats.md`: own goals are a default column; clean sheet exists as a side fact; Draw sides balances on the last 10 Rated matches Group-wide.
- **Notifications (11)**: Who's in? as a deferred feature on a match to play; nothing now. Settled in `11-notifications.md`: Who's in? stays deferred as a future Notice; Copy reminder text joins Copy vote link on the match page.
- **Architecture (12)**: match state stored with the completion instant; the date as a calendar date interpreted in the Group's time zone, today judged there; the eight completion checks in one transaction with the Knockout progression; every edit re-running them; the change record as append-only rows per match with tombstoned actors; two Managers saving one match at once, where last save wins but a stale form must not silently drop the other's rows; the duplicate check by date and Player set. Settled in `12-architecture.md`: the match state with its completion instant; the date as a `date` column judged in the Group's time zone by one time module; the eight checks as a pure `domain` function run inside the Complete act with the Knockout progression and re-run on every edit; the change record as an append-only table with actors set null on deletion; a version column on the match so a stale form is refused with a conflict; the duplicate check as a read the form calls; match ids minted by the client so a retried Complete is idempotent (ADR 0009).
- **Frontend (13)**: the match form on a phone, the most-used screen: pickers per Format, counters beside names, the pitch with slots and bench, Draw sides and Copy last lineup, the warnings, the Complete button; the match page and list; the confirmations for Un-complete and delete; "copy result as text"; the pitch drawn or listed on a phone. Settled in `13-frontend.md`: one scrolling form with a sticky Save and Complete bar, a full-screen picker sheet with the most recent Players first, a row sheet holding the counters and the move and remove acts, Draw sides and Copy last lineup above the sides; the pitch is drawn on the match page and listed in the form; the unsaved form is kept in local storage under the client-minted id; copy result as text is accepted under the one Share control.
- **Data migration (15)**: every Duel match becomes a Completed Pickup match with its date, scores, video link, its match type as the match format, its Home and Away rows as two coloured sides, each player row as a lineup row with goals, assists, no own goals, no guest mark, the ordinal position as the slot order under the default formation for its size; penalties, `penaltyScored`, round and `bracketPosition` are dropped; the change record starts with one "recorded" entry naming the competition's admin at the match's creation instant, since today records no author. Settled in `15-migration.md`: as stated, with Home as the first side in Black and Away the second in White, the date read in Europe/Belgrade, the completion instant equal to the old creation instant, and the "recorded" entry carrying `imported: true`; a migrated match that fails a completion check stays Completed and is fixed on its first edit; the dump has one such side.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Match, Side, Lineup, Lineup row, Bench, Own goal, Unattributed goal, Formation, Add match, Save, Complete, Un-complete, Result fact, Lineup fact, Match note, Change record, Draw sides, Copy last lineup; Fixture and Not played extended to cover a Pickup match to play. "Match type", "home and away" in Pickup, "position" as a stat, "born completed" and "reopen" as an act are retired; "on the bench" survives as copy for a substitute.
