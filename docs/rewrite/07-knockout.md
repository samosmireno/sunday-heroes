# Knockout bracket

_Branch session 7, 2026-09-15. Output of the eighth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md`, `04-seasons.md`, `05-teams.md` and `06-league.md` as settled; settles the open questions under area 7 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

A Knockout Season is a single-elimination bracket drawn over its Entries: every Tie sends its winner on and its loser out until the Final leaves one Winner. It is the Group's cup: the one-off in June, the four league teams settling the year in an afternoon, the eight-team tournament with a proper bracket on the wall. This session makes the bracket exact from the moment it is drawn, every Tie and every Fixture on the wall on day one, and resolves every gap a Sunday produces, a no-show, a withdrawal, a Tie nobody plays, with one rule, the bye, so a bracket never stalls and never needs a hand to move a winner along.

## Decisions carried in from the map

- Knockout is a Team format, built from nothing, sharing Teams, Entries, rosters and match recording with League.
- A draw is a result. Only a Knockout decider goes to penalties; this session amends the rule from "a one-leg Knockout match" to "the deciding match of a Tie". Extra time is not recorded.
- Completed match is the unit that counts. Every new match lands in the Current season; a Past season accepts only a Correction; a Fixture not completed when its Season closes becomes Not played.
- From the groups session: a Manager generates and runs the schedule; every act that changes who may do what goes in the activity record.
- From the competitions session: bracket size, seeding and legs are generation inputs per Season, prefilled from the previous Season, never settings; every Fixture inherits the competition's match format, changeable only while the Current season has no matches; End competition is always the admin's act and the Knockout page suggests it once the Final is Completed; the lineup rule at completion is one to twice the match format per side.
- From the seasons session: the bracket is generated in an Empty season; an unfinished bracket has no winner and the Season summary shows the teams still in; a withdrawn team's Ties may become Not played.
- From the teams session: the bracket is drawn over the Season's Entries; Entries are locked in Roster setup once the bracket exists; Copy Entries is how the league feeds the cup; a Knockout Season won is a title on the Team page.
- From the League session: Fixture with its three states, the planned date and cadence inputs, Walkover and Undo walkover, Mark Not played and Restore, and the withdraw-a-team act; a bracket has no home side and no Round in League's sense, and this session decides what replaces them.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Knockout is an enum value with two live columns and no behaviour.** The competition type enum holds it; a `bracketPosition` integer sits on every match and is written from the create request and zeroed by League generation, never read; a `knockoutVotingPeriodDays` setting is stored and read nowhere. No bracket service, no round advancement, no page, no component exists.
- **The server still accepts it.** The general create endpoint refuses only League, so a request with the Knockout type succeeds and yields a competition with Season 1 and no teams; the create form filters the option out while its help text still describes the Format, the list's Knockout tab is commented out, the competition page renders the word "Knockout" as a placeholder, and the Knockout match form schema is byte-identical to the League's.
- **Penalties are two nullable columns the UI never writes.** The form that would collect them is commented out; the create path copies the home total into the away one, so any recorded shoot-out would be level; the edit path drops them; the display hides a shoot-out where either total is zero. A per-player `penaltyScored` flag exists and is always null.
- **A shoot-out counts differently in two places.** The career win-rate helper treats a level score decided on penalties as a win or a loss; the standings and the per-competition stats SQL count it as a draw. The map's "a draw is a result" already resolves this.
- **Production holds no Knockout**, so nothing here needs migrating.

## The model

### Bracket, Tie, Round, bye

The **bracket** of a Knockout Season is its Ties arranged in Rounds, from the first Round to the Final, drawn over the Season's Entries. Any count from two is accepted, with no maximum; the bracket is sized to the next power of two and the missing places are **byes** in the first Round. Six Entries give a bracket of eight: four teams play two quarter-finals and two rest into the semi-finals. Two Entries give a Final and nothing else.

A **Tie** is one pairing in the bracket: two sides, a Round, and its Fixture, or two Fixtures where the draw chose two legs. Each side is an Entry, a bye, or the winner of an earlier Tie, shown as "Winner of QF2" until that Tie is decided. Every Tie and every Fixture exists from the draw; a Fixture with an undecided side is to play but cannot be recorded. Ties are numbered top to bottom within their Round for reference, QF1 to QF4, SF1 and SF2, F.

A **Round** in a Knockout is a stage of the bracket, named by distance from the Final for every size: Final, Semi-finals, Quarter-finals, Round of 16, Round of 32, Round of 64. With six Entries the first Round is the Quarter-finals with two matches and two bye lines; there is no invented "first round". Underneath the names Rounds are numbered from 1 for ordering, as in League. A Tie never moves to another Round.

A bye is the Entry with no opponent in a Round: it rests in League and **advances** in Knockout, straight into the next Round's slot at the draw, shown as a line in the Round, "Green advances", with no Fixture. Byes exist only in the first Round and never two in one Tie, because there are always fewer byes than first-Round Ties; the second Round is always full. The same rule serves later, whenever a side goes missing: a Tie whose other side ended Not played or withdrew is a bye for the side that remains.

### The Draw

**Draw the bracket** is the Manager act on the Knockout page of an Active competition whose Current season is Empty and has at least two Entries. Its inputs, prefilled from the previous Season where one exists:

- **seeding**: a random draw, the default, or an ordered list of the Entries, 1 to N;
- **legs**: one or two per Tie; the Final and the third-place match are always one leg;
- **third-place match**: on or off, off by default, hidden with two Entries;
- optionally the **first Round's date** and an **interval in days**, default 7.

The act creates every Tie and Fixture at once, sides filled where known. No roster needs to be non-empty; the act only warns.

**Redraw** runs the same act again with new inputs while the Season is still Empty. It discards every Tie and Fixture of the Season, including one with a lineup and scores recorded but not completed; the confirmation lists those, as League's regenerate does. Once one match is Completed, by play or by Walkover, Redraw is gone and only the acts below remain.

There is no draw per Round. The whole bracket is the product; a group that wants suspense draws at random and enjoys the first look.

### Seeds

Under an ordered draw each Entry carries its **seed**, and the bracket places seeds the standard way: 1 and 2 can meet only in the Final, 1 to 4 only from the Semi-finals, and so on; the byes go to the top seeds. A seed is a fact of the draw, shown as "(1) Red" in the bracket and in the activity record's draw entry, never changed afterwards. Under a random draw Entries are shuffled into the same places, byes fall at random, and nothing is shown.

Two helpers fill the ordered list for adjustment before the draw, the way Copy Entries fills Roster setup:

- **From a League Season's Standings**: any League Season in the Group, Current or Past; the Entries of this Season are ordered as that table ranks their Teams, Teams not in that Season at the bottom in a random order.
- **From the previous Knockout Season**: ordered by result, Winner, Runner-up, then by the Round reached; Teams level on that keep their previous seed order, or a random order where there were no seeds; Teams not in it at the bottom.

Level Teams are the admin's to sort; a form prefill needs no tiebreak.

### Side order

A Fixture keeps League's ordered pair of sides, so a result reads "Red 3-1 Blue". Under a seeded draw the higher seed is listed first in a one-leg Tie and, in a two-leg Tie, plays the second leg at home, so the lower seed's leg comes first, the conventional way. Under a random draw the order is random. A Manager may swap it while the Fixture is to play. Nothing else reads it: there are no away goals, so the aggregate is a sum and the order stays a reading convention.

### Legs, the deciding match, the shoot-out

With one leg a Tie is its match. With two legs every Tie except the Final and the third-place match has a first leg and a second leg, completed in that order, and is decided on the **aggregate**, the sum of the two scores. A first leg may be drawn like any match.

The **deciding match** of a Tie is the Fixture whose completion decides it: a one-leg Tie's match, the second leg, the third-place match. A level deciding match, level on the day or level on aggregate, goes to a **shoot-out**: two totals that differ, "4-3", with the winner derived. Completion of a level deciding match is refused without one; a shoot-out on any other match is refused. Extra time is not recorded: a Final that finished 2-2 after extra time is recorded 2-2 with a shoot-out. The shoot-out is read as "Red won 4-3 on penalties" and nothing else in the app reads it; which Players scored and missed was left to the matches session and declined in `08-matches.md`.

A shoot-out win is a win for the Team's record and a loss for the other side, and the same for every Player in the lineups, as the map's rule says. Standings do not exist here to disagree.

### Progression and the Winner

When a Tie's deciding match is completed, its winner fills the next Tie's slot in the same act and its loser is out; nothing is left for the Manager to do. The Entry that wins the Final is the Season's **Winner**, and the Entry that loses it the **Runner-up**. Before the Final is Completed, and forever in a Season whose Final never was, the Season has no Winner and its summary shows the **teams still in**: the Entries neither out nor withdrawn. A Winner is a title on the Team page.

### Changing a decided Tie

One rule covers every reversal. Any act that would change who won a Tie, whether an edit, a Correction, an un-completion, Undo walkover, Restore from Not played or the restoring of a withdrawn team, is **refused once anything is recorded on the next Tie**: a lineup or scores saved on the next Fixture came from the wrong roster if the slot re-points. While the next Tie is untouched the act is allowed and the slot re-points in the same act. An edit that keeps the winner, 3-1 to 4-1, is always allowed under the usual rules. The fix for a wrong result discovered after the next Tie was played is to undo forward with Un-complete (settled in `08-matches.md`), which clears the next Tie's slot in the same act, and then correct.

### Walkover, Not played, withdrawal, a late entrant

League's acts carry over with the bracket's meaning:

| Act                                 | Who         | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edit planned date, side order       | Manager     | While to play, undecided sides included. Not recorded: presentation facts of the plan. A Tie never moves to another Round                                                                                                                                                                                                                                                                                                                                                          |
| **Walkover** and **Undo walkover**  | Manager     | The side that turned up is awarded 3-0, no lineup, no stats, no vote, and advances. In a two-leg Tie a Walkover forfeits the whole Tie, whatever the other leg said; the other leg, if still to play, becomes Not played. Undo while nothing is recorded on the next Tie                                                                                                                                                                                                           |
| **Mark Not played** and **Restore** | Manager     | A Tie nobody will play. Nobody advances: the next Tie is a bye for its other side, who advances without a match; if both feeders end Not played the next Tie is Not played too, and an unfinished bracket has no Winner. Restore while nothing is recorded on the next Tie; the closing act produces the same state for whatever is left to play                                                                                                                                   |
| **Withdraw a team** and **Restore** | Group admin | An Entry still in the bracket: its open Tie becomes a bye for the opponent, the default, or a Walkover to the opponent, recorded 3-0, the admin's choice. One already out is marked withdrawn and nothing else changes. One that never played leaves the Season and its place is a bye, as if the draw had run without it. Results stay, the roster stays as history, its roster spots stop counting for the one-spot-per-Season rule. Restore while nothing has been played since |
| **Add a team to the Season**        | Group admin | Into a first-Round bye slot only, while nothing is recorded on the resting Entry's next Tie: the Entry is created, the bye line becomes a Fixture, the resting Entry comes back to play it, and the newcomer takes the seed its place implies. The roster is set in Roster setup afterwards. Otherwise the answer is Redraw while the Season is Empty                                                                                                                              |

No Extra Fixtures: a bracket is exact and there is no table for one to count in. A friendly between two of the cup's Teams is recorded in a League of the same Teams or a Pickup.

### Third-place match

A one-leg Fixture between the two semi-final losers, in the Final's Round, sharing the Final's planned date. It is a deciding match like any other, counting for stats, the Team record and the Entries' results, and for nothing in the bracket's Winner. Its sides resolve like winners do: a semi-final ended by Walkover has a loser, the no-show side, who takes its place; a semi-final ended Not played or by withdrawal has none, so the third-place match is a bye and the other loser takes third place without a match; both missing, it is Not played.

### Dates

A Fixture carries League's optional planned date. Under the cadence inputs every Round is one interval later than the previous; with two legs each leg is its own step, so first leg, second leg, next Round are three consecutive intervals. **Set the Round's date** dates a Round's Fixtures at once, both legs of a two-leg Round at one and two steps. A Manager edits any planned date freely while the Fixture is to play. At completion the same date is required and may be changed, as on any match; the planned date and the match date are one field (settled in `08-matches.md`).

### Results and the All seasons record

Every Entry of a Knockout Season has a derived **result**: Winner, Runner-up, Third or Fourth when a third-place match was played, otherwise the Round in which its last Tie stood, "Semi-finals", "Quarter-finals", with a withdrawn mark where that applies. This is what the Team page shows per Entry and what "titles" and "finals" count.

The **All seasons record** is what replaces League's All seasons Standings: every Team that has ever entered the competition, with Seasons entered, titles, finals, played, won, drawn, lost, goals for and against, ranked by titles, then finals, then wins, and a shared position where those are level. Drawn matches come only from first legs. Withdrawn Entries' results are included.

### The Knockout page

The bracket first, opening on the **Round in progress**, the earliest Round with a Tie still to play. Each Tie shows its two sides with colours and seeds, "Winner of QF2" where undecided, the planned or match date, the result or "to play", the aggregate and the shoot-out line, the walkover and Not played marks, and the bye lines. Below it, the Entries with their results, and the Season summary's Winner or teams still in. A per-Entry filter shows one team's path through the bracket. The End suggestion appears once the Final is Completed. Roster setup, Draw and the admin acts live here for those allowed them. Whether the bracket is columns on a large screen and a list by Round on a phone is the frontend session's call. The Season selector is the seasons session's; on a Past season the bracket reads as it ended.

### Roles

| Act                                                             | Manager | Group admin |
| --------------------------------------------------------------- | ------- | ----------- |
| Draw the bracket, Redraw                                        | yes     | yes         |
| Edit a Fixture's planned date or side order; set a Round's date | yes     | yes         |
| Walkover, undo walkover; Mark Not played, restore               | yes     | yes         |
| Add a team into a bye slot; withdraw a team, restore            |         | yes         |

### Activity record

Draw and Redraw with their inputs and seeds; a team added into a bye slot; a team withdrawn, with the outcome chosen, and restored; Walkover and Undo walkover; Mark Not played and Restore. Each names the acting Account. Date and side-order edits are not recorded, as in League.

## Scenarios that shaped the model

- **Six teams in June.** A bracket of eight: two quarter-finals, two byes, then full semi-finals. The two rested teams' lines read "advances".
- **The league's four teams play a cup.** Copy Entries from the league, then seed From a League Season's Standings: first plays fourth, second plays third, and the top two can meet only in the Final.
- **A four-team cup that wants more football.** Two legs: the semi-finals are four matches, the Final one. Each leg votes on its own.
- **A 2-2 Final.** Completion is refused until the shoot-out totals are typed; "Red won 4-3 on penalties" is a win for Red and a loss for Blue, for Teams and Players alike.
- **A 1-1 first leg.** A draw like any match; the second leg decides on aggregate, and a level aggregate goes to a shoot-out there.
- **Blue does not turn up for the second leg, having won the first 5-0.** The Walkover forfeits the Tie: Red advances, Blue's first leg stays a Completed match.
- **A quarter-final nobody will play.** Mark Not played; the semi-final is a bye and the waiting team advances. If both quarter-finals feeding a semi-final end that way, the semi-final is Not played and the Final may be too, leaving no Winner.
- **Yellow quits after the first Round.** Withdraw, default bye: its semi-final opponent advances without a match; Yellow's result reads "Semi-finals, withdrawn"; its players may join another roster.
- **A seventh team turns up before the cup starts.** Added into a bye slot: the rested team comes back to play it in the Quarter-finals.
- **The 3-1 that was 1-3.** The next Tie has a lineup recorded: refused. The Manager un-completes the next match first, corrects the result, the slot re-points, and records the next match again.
- **The Final never played.** The Season closes with the Final Not played; the summary shows the two finalists as the teams still in and no title is awarded.
- **A drawn bracket that is wrong.** Nothing is Completed: Redraw with the right inputs, after a confirmation that lists anything recorded.
- **A cup with a third-place match whose semi-final was Not played.** The other loser takes third by bye; there is no fourth.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Any count from two, byes to the next power of two**, no maximum.
- **Random draw by default, an ordered list as the option**, with the two fill helpers From a League Season's Standings and From the previous Knockout Season.
- **Legs one or two as a Draw input**, the Final and the third-place match always one leg.
- **The deciding match of a Tie** as the amended penalties rule, covering the second leg and the third-place match; a first leg may be drawn.
- **A shoot-out as two totals that differ**, winner derived, on the deciding match only; a shoot-out win is a win and a loss for Teams and Players.
- **Tie as the bracket node, every Fixture from the draw** with sides that resolve.
- **Round and Bye extended** rather than new words: Rounds named by distance from the Final, a bye advances and is shown as a line, first Round only and never two in one Tie.
- **Automatic progression** in the completion act.
- **One reversal rule**: any act that changes a Tie's winner is refused once anything is recorded on the next Tie.
- **Walkover advances and forfeits the whole Tie**; Not played cascades as a bye.
- **Withdraw a team** with bye or Walkover for its open Tie, results kept, roster spots freed, restorable while nothing has been played since; removed outright when it never played.
- **A late entrant into a first-Round bye slot** only.
- **A third-place match** as a Draw input, off by default, resolving its sides by the bye rule.
- **No Extra Fixtures** in a Knockout.
- **An Entry's result** and the **All seasons record** ranked by titles, finals, wins.
- **Side order as a reading convention**, higher seed first or second leg at home, swappable, no away goals.
- **Dates by cadence with each leg a step**, Set the Round's date, free date edits.
- **The Knockout page** as described; the per-Entry path filter; layout left to the frontend session.
- **The role split and the activity record** as in League; a Tie never moves to another Round.
- **Each leg votes on its own**; a shoot-out changes nothing about the vote.
- **The words**: Bracket, Tie, Deciding match, Shoot-out, Aggregate, Seed, Draw the bracket, Redraw, Third-place match, Winner, Runner-up, Result, Teams still in, All seasons record.

### Declined, and why

- **Fixed bracket sizes only** (2, 4, 8, 16). A cup with six teams is a real Sunday.
- **Random draw only**, or **an ordered list only**. Most groups want a draw; the group that runs a league too wants the leader kept apart from second place.
- **A two-leg Final as a toggle.** No cup people know plays one, and nobody asks for it.
- **Extra time.** A 2-2 after extra time is 2-2 with a shoot-out; minutes are not recorded anywhere.
- **"Winner: Red" as the shoot-out fact, or per-kicker facts as a requirement.** Two totals read as football; kickers are the matches session's optional addition.
- **A Fixture created only when both sides are known.** The bracket on the wall has every line drawn on day one, and the planned date and cadence need the Fixture to exist.
- **Draw each Round separately.** Breaks every-Fixture-from-day-one, complicates seeds and byes, and is a ceremony a Sunday cup rarely wants.
- **"First round" as a name** where byes leave the Quarter-finals thin.
- **Summing a Walkover into the aggregate.** It can leave a level aggregate with nobody to take penalties.
- **Extra Fixtures in a Knockout.** There is no table for them to count in.
- **A team added anywhere but a bye slot.** A bracket cannot grow; Redraw covers the Empty season.
- **A group stage before the bracket.** A later Format, as the map already says.
- **Double elimination, a plate or consolation bracket, a replay instead of penalties, a partially seeded draw, a holder mark.** None asked for by any Sunday; the ordered list covers partial seeding.

## Hand-offs to other sessions

- **Competitions (3)**: applied to that document in this session: bracket size, seeding, legs and the third-place match are Draw inputs per Season, prefilled from the previous Season; the End suggestion after the Final stands.
- **Seasons (4)**: applied to that document in this session: the bracket is drawn in an Empty season and Redraw replaces it while Empty; an unfinished bracket has no Winner and the summary shows the teams still in; a withdrawn team's open Tie becomes a bye or a Walkover; the closing act's Not played needs no cascade, since everything left to play becomes Not played at once.
- **Teams and rosters (5)**: applied to that document in this session: a withdrawn Entry in a Knockout keeps its results and frees its roster spots; a late entrant enters through a bye slot; the Team page shows each Knockout Entry's result and counts a Winner as a title; a Walkover counts in the Team's record.
- **League (6)**: applied to that document in this session: Round and Bye are extended rather than replaced; the side order is kept as a reading convention; a Walkover in a Knockout advances the awarded side and forfeits a two-leg Tie.
- **Matches (8)**: completion of a level deciding match needs a shoot-out of two differing totals and any other match refuses one; per-kicker shoot-out facts are optional and may be declined; the legs of a Tie are completed in order; a Fixture with an undecided side cannot be recorded; completion fills the next Tie's slot in the same act; an edit or un-completion that changes a Tie's winner is refused once anything is recorded on the next Tie; the completion form prefills the match date from the planned date. Settled in `08-matches.md`: per-kicker shoot-out facts are declined; Un-complete clears the next Tie's slot in the same act under the same guard; any edit or Correction keeps the Shoot-out invariant, dropping it when the score is no longer level and requiring it when it becomes level.
- **Voting (9)**: each leg is a match with its own vote; a shoot-out changes nothing; a Walkover has no vote. Settled in `09-voting.md`: adopted; a closed vote on a Tie that can no longer be un-completed stands as it is, since no act reopens a closed vote.
- **Stats (10)**: a shoot-out win is a win and the other side's loss for Teams and Players; an Entry's result and the titles and finals it yields; the All seasons record's columns and ranking; drawn matches come only from first legs; the Season summary's Winner or teams still in; a Walkover counts in the Team's record and in nothing of any Player. Settled in `10-stats.md`: all adopted; a Winner Season is a Title for every roster Player with one appearance, and finals count on the Team page.
- **Notifications (11)**: nothing now; a planned date makes a "next Tie" reminder possible later. Settled in `11-notifications.md`: stays later, as a future Notice under its own preference.
- **Architecture (12)**: the bracket stored as Ties whose slots reference an Entry, a bye or a feeding Tie; progression inside the completion transaction; the "nothing recorded on the next Tie" guard on every reversal; the Draw and Redraw as single transactions, and two Managers drawing at once must produce one bracket; seeds stored on the Entry for that Season; the result, the teams still in and the All seasons record derived, computed on read or cached and invalidated.
- **Frontend (13)**: the bracket as columns on a large screen and a list by Round on a phone; the Tie card with seeds, aggregate, shoot-out, marks and bye lines; the Draw form with its ordered list and helpers; the confirmations for Redraw and withdraw; the per-Entry path filter; the End suggestion; a "copy bracket as text" action for the group chat if it wants one.
- **Data migration (15)**: nothing. Production holds no Knockout; the enum value, `bracketPosition`, `knockoutVotingPeriodDays`, the penalty columns and `penaltyScored` are dropped with the old schema.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Bracket, Tie, Deciding match, Shoot-out, Aggregate, Seed, Draw the bracket, Redraw, Third-place match, Winner, Runner-up, Result, Teams still in, All seasons record; Round, Bye, Home side, Walkover and Withdrawn Entry extended to cover a Knockout. "Bracket position", "knockout voting period", "cup" and "tournament" as names for the Format, "penalties" as the name of a state and "extra time" are retired; "on penalties" survives as copy for a Shoot-out. The map's cross-cutting rule now reads: only the deciding match of a Knockout Tie goes to a shoot-out.
