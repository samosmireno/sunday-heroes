# League schedule and standings

_Branch session 6, 2026-09-15. Output of the seventh `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md`, `04-seasons.md` and `05-teams.md` as settled; settles the open questions under area 6 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

A League Season is a round-robin schedule of Fixtures over its Entries and the table those Fixtures produce once played. The schedule answers "who plays whom, in what order, and when"; the Standings answer "who is winning". Both are the Manager's tools for running a Sunday league that does not run like a federation: matches get rearranged, a team quits in March, a fifth team turns up in week three, and the group wants to keep playing after the last round. This session makes every one of those an ordinary act, and makes the Standings a pure reading of Completed matches so that no act ever has to unwind a counter.

## Decisions carried in from the map

- Standings are always derived from Completed matches, never counted. Schedule generation is its own act. This session owns both.
- Completed match is the unit that counts. A draw is a result; three, one, zero is the scheme today.
- Every new match lands in the Current season; a Past season accepts only a Correction. A Fixture not completed when its Season closes becomes Not played and stays in the schedule.
- From the groups session: a Manager generates a schedule; every act that changes what someone may do goes in the activity record.
- From the competitions session: team count and legs are generation inputs per Season, prefilled from the previous Season, not competition settings; every Fixture inherits the competition's match format, which changes only while the Current season has no matches; the lineup rule at completion is one to twice the match format per side.
- From the seasons session: generation runs only in an Empty season; the Season summary's leader is the top of the Standings, ties shared; Not played may be reused for a mid-season act and a walkover may be an awarded result rather than a Not played match.
- From the teams session: a Season of a Team format is made of its Entries; the team count generation input is the number of Entries; generation needs Entries, not rosters, and only warns about an empty roster; Entries are locked in Roster setup once the schedule exists, and adding or withdrawing one afterwards is this session's act; All seasons Standings pool by Team and the Standings show each Entry's colour.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Generation is the circle method after a random shuffle**, with a synthetic bye for an odd count whose pairings are skipped, a home side chosen by a per-team balance with a random tiebreak, and a double round robin made by mirroring the whole list. A Fixture is created with no date, 0-0, not completed, a one-based round, and voting closed.
- **Generation happens in two places, with no regenerate.** At League creation, for Season 1, and at the end of a Teams setup save, which generates nothing if the Current season already has a match. Re-saving unchanged names is the documented way to get fixtures after a rollover. No path deletes or regenerates Fixtures; adding a team through its endpoint generates nothing.
- **Nothing can schedule a match forward.** The Fixture's date is null until it is edited, the edit form is the only place to set it, and its calendar refuses future dates.
- **The team count has three bounds**: three to sixteen in the client schema, two to sixteen on the input element, at least two with no maximum on the server. The League create request accepts team names the service never reads.
- **The Current season's table is a set of counters** on the competition-team join row: points, wins, draws, losses, goals for and against. They are written by match completion inside its transaction, by a delta applied on the edit of a completed match in a separate transaction opened before the match update's own, with a read-then-write increment, and zeroed at rollover and reset. A Past season's and the All seasons table are derived in code from Completed matches under the teams' current names (ADR 0003), which records that the derived figures are the correct ones when the two differ.
- **A League match created through the general create endpoint is born completed and never touches the counters**, so it counts in the derived tables and not in the live one.
- **The sort is points, goal difference, goals for, then team name**, one comparator for both paths. Penalties never enter the Standings, so a level score is a draw there, while the player win-rate code treats a penalty result as a win or loss.
- **A League match cannot be deleted**, by an explicit refusal, because nothing could unwind the counters. Completion needs at least one player, at least one team row and a date, and never checks the roster (issue #45).
- **Round is a stored integer on every match**, one-based from generation; every Duel match is round 1. The League page has a Standings tab with Pos, Team, P, W, D, L, GF, GA, GD and Pts, and a Fixtures tab with round tabs carried in the URL. There is no per-team filter, no bye line and no form column. "Matchday" appears nowhere in code.
- **Production holds no League**, so nothing here needs migrating.

## The model

### Fixture

A **Fixture** is a match of a Team format that exists before it is played, however it came to exist: schedule generation, an added cycle, an added Entry, a Manager's extra Fixture, or the Knockout bracket. It belongs to one Season, inherits the competition's match format, and has one of three states:

- **to play**: created and not yet completed, with or without a lineup and scores recorded;
- **Completed**: played, with a lineup, completed by the act the matches session defines, or awarded as a **Walkover**;
- **Not played**: nobody will play it, marked by a Manager mid-season or by the closing act.

Only a Completed Fixture counts anywhere. The old glossary's "created in advance when a Season's schedule is generated" was too narrow once a Fixture can be added by hand and once a Knockout has them too.

### Schedule, Round, bye, home side

The **schedule** of a League Season is its Fixtures grouped by **Round**. A Round is a numbered set of Fixtures, numbered from 1 across the whole Season: a four-team double round robin has Rounds 1 to 6, and a cycle added later continues from 7. As generated, every Entry appears at most once per Round; that is a property of generation, not a rule the app enforces afterwards, because an extra Fixture or a moved one may break it and refusing that would refuse exactly the rearrangements a Sunday league makes.

There is no matchday. A matchday is a date, and dates are facts of Fixtures, not of the schedule: the Fixtures of one Round may be played on different days and a Round has no date of its own. A Fixture may be completed in any order; the Round is where it is listed, never a gate.

With an odd number of Entries one Entry rests each Round. The **bye** is shown in the Round as a line, "Green rests", derived from who is missing; nothing is stored for it.

Every Fixture has an ordered pair of sides, a **home side** listed first and an away side, so a result reads "Red 3-1 Blue" and the return leg reads "Blue vs Red". Generation balances home appearances across the Entries and mirrors them in the return leg; a Manager may swap the order before completion. Nothing else in the app reads it: no home table, no home advantage, no kit rule.

### Generate, regenerate, add a cycle

**Generate schedule** is a Manager act on the League page of an Active competition whose Current season is Empty and has at least two Entries. Its inputs, prefilled from the previous Season where one exists:

- **legs**: single or double round robin, the double one mirroring every pairing with home and away swapped;
- optionally the **first Round's date** and an **interval in days**, default 7, so every Fixture of Round k is dated the first date plus k-1 intervals.

The circle method produces the Rounds; the bye falls where the count is odd. No roster needs to be non-empty; the act only warns. There is no upper bound on Entries.

**Regenerate** runs the same act again with new inputs while the Season is still Empty. It discards every Fixture of the Season, including one that has a lineup and scores recorded but was not completed; the confirmation lists those, the way the rollover screen lists what becomes Not played. Once one match is Completed, including by walkover, regenerate is gone and only the acts below remain.

**Add a cycle** is a Manager act on a Current League Season, available at any time, even before the existing schedule is finished. It appends one full round-robin cycle over every Entry not withdrawn, as new Rounds continuing the numbering, with home and away mirrored from the previous cycle, so cycle 3 reads like cycle 1. It takes the same optional date inputs. **Remove last cycle** deletes the cycle's Fixtures while none of them is Completed. This is the answer to the four-team group that finishes its double round robin in April and wants to keep going without picking a number of legs in January.

### Dates

A Fixture carries an optional **planned date**, set on generation by cadence or by hand, and changed freely by a Manager while the Fixture is to play. Rescheduling and postponing are the same act, a date change; a cleared date means "to be arranged" and no postponed state exists. **Set the Round's date** dates every to-play Fixture of one Round at once. The planned date and the match date are one field (settled in `08-matches.md`): at completion it is required, may not be later than today, and may be changed there; afterwards it is the match date and "planned" has no further role. The schedule orders a Round's Fixtures by date, undated last.

### Acts on a Fixture

| Act                                  | Who     | Rule                                                                                                                                                                                                             |
| ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edit planned date, Round, home order | Manager | While to play. Not recorded in the activity record: presentation facts of the plan                                                                                                                               |
| Add an **extra Fixture**             | Manager | Between two Entries of the Season, in a Round the Manager picks, default the Round in progress, home order chosen. Counts in the Standings like any other; the played column shows the imbalance                 |
| Delete a Fixture                     | Manager | Only an extra Fixture, and only while to play. A generated Fixture is never deleted; the schedule is the record of the plan                                                                                      |
| **Mark Not played** and **Restore**  | Manager | A Fixture nobody will play. Reversible while the Season is Current; identical afterwards to what the closing act produces                                                                                        |
| **Walkover** and **Undo walkover**   | Manager | The side that turned up is awarded 3-0. Undo returns the Fixture to to play while the Season is Current; in a Past season it stays a walkover, since a Correction never touches a lineup and a walkover has none |

**Walkover** in full: a table fact, not a football fact. The Fixture becomes Completed with the score fixed at 3-0 to the awarded side, no override. Its match date is its planned date if it has one, else the day of the act. It has no lineup, no player stats and no vote. It is a Completed match for every purpose that has no player in it: the Standings, form, the Team's record and Team page, All seasons Standings, the champion mark, and the closing precondition of at least one Completed match. A group that prefers not to punish a no-show marks the Fixture Not played instead.

Deletion and un-completion of a Completed match, for every format, are settled in `08-matches.md`: Un-complete returns a Completed match to to play with everything kept as a draft and its ballots kept for re-validation, refused in a Knockout once anything is recorded on the next Tie; a Completed Fixture nobody should have played is un-completed and then marked Not played; a generated Fixture is never deleted.

### Entries after generation

Two Group admin acts on the League page, the same level as anything that changes who is in a Season.

**Add a team to the Season**: creates the Entry and its Fixtures in one act, one pairing per leg against every Entry not withdrawn, appended as new Rounds after the last. Existing Rounds are untouched even where an odd count left byes; a Manager who wants the newcomer to fill a bye pulls the Fixture into that Round by hand. The roster is set in Roster setup afterwards. The Standings' played column shows that the team started late.

**Withdraw a team**: played results stay. For the Fixtures still to play the admin chooses one outcome for the whole set: all become Not played, the default, or all become Walkovers awarded to the opponents, for a group that runs it strictly. The Entry becomes a **withdrawn Entry**: ranked last in the Standings regardless of points, marked, with every column kept; two withdrawn Entries rank among themselves by the normal rule. Its roster spots stop counting for the one-spot-per-Season rule, so its Players may join another Entry's roster in the same Season, and the roster stays on the Entry as history. An added cycle skips it. **Restore** reverses the act while nothing has been played since, returning its Fixtures to to play and undoing its walkovers.

An Entry that withdraws with no Completed Fixture leaves the Season entirely, its Fixtures deleted, as if generation had run without it, the Rounds keeping a bye where it was. A team that never played is not part of the Season's record.

### Standings

The **Standings** of a Season rank its Entries from its Completed matches, and nothing else; there is no counter, no stored table, and no act ever unwinds anything. Columns: played, won, drawn, lost, goals for, goals against, goal difference, points, and **form**, the Entry's last five Completed matches in this Season by match date, oldest left, newest right, as W, D or L marks, walkovers included, fewer than five shown as fewer. Each row carries the Entry's colour.

**Points**: three for a win, one for a draw, zero for a loss. Fixed, not an input.

**Ranking**: points, then goal difference, then goals for, then **head-to-head**: among the Entries still level, a mini-table of only their matches against each other ranked by points, goal difference and goals for, walkovers included. Whoever is still level shares the position, shown as "2=" and listed by name. Name is never a tiebreak; a shared position is honest.

**Champion mark**: a derived mark on the leader once no other Entry can reach its points from the Fixtures still to play, counting three points per to-play Fixture and excluding Not played ones. It can disappear if a cycle or an extra Fixture is added afterwards, which is correct. There is no "eliminated" mark.

**Champion**: when a League Season closes, the top of its final Standings is its champion, ties shared, even if Fixtures ended Not played; the table is what was played. A Season with no Completed match cannot close, so every Past League Season has a champion. This is what the Season summary's leader becomes once the Season closes, and what the Team page counts as a title.

**All seasons Standings**: the competition's whole history pooled by Team across every Season, the same columns plus Seasons entered and titles, ranked by the same rule, withdrawn Entries' results included, form omitted.

### The League page

Standings first, then the schedule grouped by Round, opening on the **Round in progress**, the earliest Round with a Fixture still to play. Each Fixture shows the two Entries with colours in home order, its planned date or match date, the result or "to play", the walkover and Not played marks, and the bye line where there is one. A per-Entry filter shows one team's Fixtures. The Season selector is the seasons session's; on a Past season the schedule reads as it ended. The Roster setup entry point, generate, add a cycle and the admin acts live here for those allowed them. A "copy Standings as text" action for the group chat is left to the frontend session. Settled in `13-frontend.md`: accepted, under the one Share control; Standings and the schedule are two tabs of the competition page.

### Roles

| Act                                                            | Manager | Group admin |
| -------------------------------------------------------------- | ------- | ----------- |
| Generate, regenerate, add a cycle, remove last cycle           | yes     | yes         |
| Edit a Fixture's date, Round or home order; set a Round's date | yes     | yes         |
| Add or delete an extra Fixture                                 | yes     | yes         |
| Mark Not played, restore; walkover, undo walkover              | yes     | yes         |
| Add a team to the Season; withdraw a team, restore             |         | yes         |

### Activity record

Generate and regenerate with their inputs; add and remove a cycle; an extra Fixture added or deleted; Mark Not played and Restore; Walkover and Undo walkover; a team added to the Season; a team withdrawn, with the outcome chosen, and restored. Each names the acting Account. Date, Round and home-order edits are not recorded: noise in a record meant for who-may-do-what.

## Scenarios that shaped the model

- **Five teams, one rests.** Rounds 1 to 5 each show four teams playing and "Green rests". Nothing is stored for the rest.
- **The double round robin ends in April.** The Manager adds a cycle; Rounds 7 to 12 appear, mirrored from the second cycle, dated weekly from the next Sunday. The Standings keep counting.
- **A cycle added by mistake.** Remove last cycle, since none of its Fixtures is Completed.
- **Red and Blue swap weekends with Green and Yellow.** Two date edits, or two Round moves. Nothing is recorded, nothing is refused.
- **Blue does not turn up.** The Manager awards a walkover: Red 3-0 Blue, no lineup, no vote. The group decides that was harsh; undo, then Mark Not played.
- **The rained-off match nobody will replay.** Mark Not played. In June it is exactly what the closing act would have made it.
- **A fifth team joins in week three.** The admin adds it; its eight pairings, two legs each, land in new Rounds after the last. The Manager pulls two into the bye slots by hand. Its played column lags for a while.
- **Yellow quits in March with six played.** Withdraw, Not played for the rest; Yellow sits last with its six results kept; its players guest or move to other rosters. Had the group run it strictly, the rest would have been walkovers.
- **A team withdrew before playing.** It leaves the Season; the schedule shows a bye where it was.
- **Level on everything.** Red and Blue share second on points, goal difference and goals for; their two meetings decide it. If those are level too, "2=" for both.
- **The title decided in March.** The champion mark appears on Red the moment nobody can catch it. Someone adds a cycle; the mark goes until it is earned again.
- **The Season closes with three Not played.** Red is champion on what was played; the Team page gains a title.
- **The 4-2 that was 4-3.** A Correction, as the seasons session says; the Past season's Standings re-derive on their own.
- **Two teams only.** A legitimate League: a series, with a table.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Single or double round robin plus Add a cycle**, over any number of legs at generation.
- **Two Entries minimum**, no maximum.
- **Regenerate while the Season is Empty**, discarding everything with a confirmation that lists recorded-but-not-completed Fixtures.
- **A nominal home side**, balanced, mirrored, swappable, with no other meaning.
- **The bye shown as a line** in the Round.
- **Round as the grouping, no matchday**, numbered through the Season, once-per-Round a property of generation only.
- **An optional planned date** on a Fixture, freely edited, with no postponed state.
- **Dates by cadence** on generate and add a cycle, and **Set the Round's date**.
- **Extra Fixtures** in a chosen Round, counting fully; deletable only while to play; generated Fixtures never deleted.
- **Mark Not played** mid-season, reversible while Current.
- **Walkover** as a 3-0 Completed match with no lineup, stats or vote, undoable while Current, counting for the closing precondition.
- **Withdraw a team** with Not played or walkovers for the remainder, ranked last, results kept, roster spots freed, restorable while nothing has been played since; removed outright when it never played.
- **Add a team to the Season** after generation, pairings appended as new Rounds.
- **Three, one, zero**, fixed.
- **Points, goal difference, goals for, head-to-head mini-table, shared position**; name dropped as a tiebreak.
- **Columns plus form** of the last five.
- **A champion mark**, no eliminated mark.
- **The Season's champion** as the final top, ties shared, a title on the Team page.
- **All seasons Standings** pooled by Team with Seasons entered and titles.
- **The role split**: Managers run the schedule, Group admins change who is in the Season; date, Round and order edits unrecorded.
- **The League page** as described; a per-Entry filter; copy-as-text left to the frontend session.
- **Fixture redefined** for every Team format with three states, so the Knockout session inherits it.
- **A Manager may edit a Fixture's date, Round and home order** before completion.
- **Extra Fixtures and cycles skip withdrawn Entries.**

### Declined, and why

- **Any number of legs as a generation input.** A magic number in January; Add a cycle answers the real case in April.
- **Unordered sides.** A result line reads home first everywhere, and the return leg needs the swap to look like one.
- **Home and away with meaning**, such as a home table. Nothing on a Sunday reads it.
- **A matchday concept, or a date on a Round.** Dates are facts of Fixtures.
- **A postponed state.** A date change is the act.
- **Extra Fixtures that do not count**, in an "Extra" section. A match that should not count is a Pickup with voting off.
- **Deleting a generated Fixture.** Not played says what became of the slot; deletion hides it.
- **A walkover with a lineup for the side that turned up**, or an editable walkover score. Nobody played; it is a table fact.
- **Refusing a team added after generation.** The fifth team in week three is real.
- **Filling byes automatically** when a team is added. It needs a definition of "started"; a Round move by hand does the same.
- **Points as a generation input.** One rule everybody knows.
- **Head-to-head before goal difference**, and **name as the last tiebreak**.
- **Position arrows, home and away splits, expected points, an eliminated mark.**
- **Enforcing once-per-Round after generation.** It would refuse the rearrangements the acts exist for.

## Hand-offs to other sessions

- **Competitions (3)**: applied to that document in this session: legs are single or double with Add a cycle for more; the closing precondition's "at least one Completed match" is satisfied by a walkover.
- **Seasons (4)**: applied to that document in this session: Not played is reused mid-season as a reversible Manager act; a walkover is an awarded Completed result, kept as such in a Past season; regenerate is the act that fixes a mistaken schedule inside an Empty season; the Standings leader for the summary is the top of the table with withdrawn Entries last; All seasons Standings exist.
- **Teams and rosters (5)**: applied to that document in this session: adding or withdrawing an Entry after generation is defined here; a withdrawn Entry's roster spots do not count for exclusivity; the Team page counts a walkover in the record and a withdrawn Season as an Entry.
- **Knockout (7)**: inherits Fixture with its three states, the planned date and cadence inputs, Walkover and Undo walkover, Mark Not played and Restore, and the withdraw-a-team act; a bracket has no home side and no Round, and that session decides what replaces them; a Knockout Season won is a title. Settled in `07-knockout.md`: Round and Bye are extended rather than replaced, a Knockout Round named by distance from the Final and a bye advancing; the side order is kept as a reading convention with the higher seed first; a Walkover advances the awarded side and forfeits a two-leg Tie; no Extra Fixtures in a Knockout.
- **Matches (8)**: the completion form prefills the match date from the planned date; a Walkover is a Completed match with no lineup, the one exception to the lineup rule at completion, and is never created through the match form; the home side is the side listed first on a Fixture; deletion and un-completion of a Completed match, for every format. Settled in `08-matches.md`: the planned date and the match date are one date field; a Fixture "with a lineup recorded but not completed" is a Save; Un-complete returns a Completed match to to play with everything kept as a draft and its ballots kept, and is the step before Mark Not played on a Completed Fixture; a generated Fixture is never deleted and a Pickup match is deletable by a Manager while the Season is Current.
- **Voting (9)**: a walkover has no vote and nothing to reopen. Settled in `09-voting.md`: adopted; a Walkover's vote state is none, shown as such on the match page, and it counts in nothing rating-wise.
- **Stats (10)**: a walkover counts in a Team's record and in nothing of any Player; form as defined here; the champion and shared titles; a withdrawn Entry's results count everywhere; top scorer and the like read lineups, which a walkover has none of. Settled in `10-stats.md`: all adopted; Form is extended to Players; a Champion Season is a Title for every roster Player with one appearance.
- **Notifications (11)**: a planned date makes a "next Fixture" reminder possible later; nothing now. Settled in `11-notifications.md`: stays later, as a future Notice under its own preference.
- **Architecture (12)**: the Standings, head-to-head, form, champion mark and All seasons Standings derived from Completed matches, computed on read or cached and invalidated; the Fixture state stored, with Walkover and its awarded side as facts; Round as an integer ordering and the home side as an ordered pair; add a cycle, add a team and withdraw as single transactions; two Managers generating or adding a cycle at once must produce one schedule. Settled in `12-architecture.md`: Standings, head-to-head, Form, the champion mark and All seasons Standings as pure engine functions on read, no cache; the Fixture state stored with the Walkover and its awarded side; Round as an integer and the sides as an ordered pair; Add a cycle, Add a team and Withdraw as single acts under the Competition row lock, so two Managers generating at once produce one schedule.
- **Frontend (13)**: the League page with Standings, Round groups opening on the Round in progress, the bye line, the marks, the per-Entry filter, the champion mark and the "2=" display; the generate form with its inputs; the confirmations for regenerate, remove last cycle and withdraw; copy Standings as text. Settled in `13-frontend.md`: Standings and Schedule are two tabs of the competition page; the Schedule lists Round groups opening on the Round in progress with the bye line and marks; the Manager's acts sit in an overflow menu; copy Standings as text is accepted under the one Share control.
- **Data migration (15)**: nothing. Production holds no League; the round stored on every Duel match is dropped with the Duel. Settled in `15-migration.md`: as stated.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Fixture (redefined), Schedule, Round, Bye, Home side, Planned date, Generate schedule, Regenerate schedule, Add a cycle, Extra Fixture, Walkover, Withdrawn Entry, Standings (tightened from the current app's), Form, Champion mark, Champion, All seasons Standings. "Matchday", "postponed", "voided fixture" and "league table" are retired; "rescheduled" survives only as the everyday word for a date change.
