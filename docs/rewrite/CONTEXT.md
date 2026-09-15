# Sunday Heroes rewrite

The glossary of the rewrite: a competition manager where a Group of people run football competitions, record matches, derive standings and stats from them, and vote on each other after matches. Started by the identity session; every branch session adds the terms it resolves. The root `CONTEXT.md` stays accurate for the current app and is not edited by the rewrite.

## Language

### Identity

**Account**:
One person's proof of identity: an email, one or two Sign-in methods, a display name. It holds no role and owns nothing inside a Group; a Player attaches to it in order to vote.
_Avoid_: User, profile, login (as a noun)

**Sign-in method**:
One of the ways an Account proves itself: Password or Google. An Account has one or two and may detach one, never its last.
_Avoid_: Provider, credential, auth type

**Verified email**:
An Account's email once its owner has proven they control the address: at birth for a Google sign-up, on clicking the verification link for a password sign-up. Nothing beyond verification is possible until then.
_Avoid_: Confirmed email, activated account, registered

**Session**:
One signed-in device of an Account, opened by a sign-in and ended by signing out, by expiry, or by Sign out everywhere.
_Avoid_: Token, login session, device (as the thing itself)

**Sign out everywhere**:
The act that ends every Session of an Account other than the current one. Also happens on a password change or reset.
_Avoid_: Revoke all, log out all devices

**Re-authentication**:
A fresh password entry or Google sign-in, good for a few minutes, demanded before an Account changes its email or password, attaches or detaches a Sign-in method, signs out everywhere or deletes itself.
_Avoid_: Sudo mode, confirm password, step-up

**Security event**:
A record on an Account of something that touched its identity: a sign-in or failed sign-in, a password or email change, a method attached or detached, sessions ended, deletion, or an Operator's action. Deleted with the Account.
_Avoid_: Audit log, activity log, history

**Operator**:
A person on a configured allowlist who can look after Accounts (look one up, resend verification, mark an email verified, end sessions, see its Deliveries, clear an Undeliverable mark, delete) and can neither act as an Account nor see inside a Group. Not a role and not part of the domain.
_Avoid_: Superadmin, global admin, staff, support role

**Linked Player**:
A Player attached to a Member of its Group. The link is made by accepting a Player invitation, by picking oneself on a join link, or by an admin linking a Member; it ends when an admin unlinks, when the Membership ends, or when the Account is deleted. Nothing else about the Player changes on either side.
_Avoid_: Registered player, claimed player, verified player, user

### Groups

**Group**:
A circle of people who play together: the boundary of "who these people are". Owns a Player pool, competitions, Memberships, invitations and an activity record. Created deliberately by an Account, never at sign-up. Two competitions that share people belong in one Group; two circles that share nobody are two Groups.
_Avoid_: Dashboard, team (in this sense), club, organisation

**Player pool**:
The Players of a Group. Every competition in the Group draws its lineups and rosters from the same pool; nothing registers a Player to one competition.
_Avoid_: Squad (reserved for a format), roster (reserved for teams), member list

**Member**:
An Account in a Group: the record that "members only" checks and that every derived role hangs off. May be linked to at most one Player of the Group, or to none. Begins by creating the Group, accepting a Player invitation or using a join link; ends by leaving, removal, Account deletion or Group deletion.
_Avoid_: User, participant, registered player

**Group admin**:
A Member with the admin flag. Several per Group and no owner above them; any admin may promote or demote, never the last one. Runs the Group: settings, Members, Managers, Player and Team repairs, join links, deletion.
_Avoid_: Owner, dashboard admin, superuser

**Manager**:
A Member assigned to one competition by a Group admin; "Competition manager" in full. Records and completes matches, runs Roster setup, generates and runs schedules, draws brackets, submits ballots on behalf, creates and renames unlinked Players, creates, renames and recolours Teams, and issues Player invitations. Every Group admin is implicitly a Manager of every competition. Ends with the Membership.
_Avoid_: Moderator, organiser, coordinator

**Player**:
A person in a Group's Player pool: a durable record whose Nickname is its label. Either linked to one Member or unlinked, and either active or archived. Belongs to exactly one Group.
_Avoid_: DashboardPlayer, user, participant, account

**Nickname**:
The name a Player goes by in its Group, unique within the Group ignoring case and surrounding or repeated whitespace, with the typed casing kept for display. Renaming keeps the Player's history.
_Avoid_: Username, display name (that is the Account's), handle

**Archived Player**:
A Player hidden from lineup pickers, the Roster setup picker and invitations, with its matches, stats, ballots, any link and any roster spot intact. Reversible. Not a deleted Player: deletion exists only for a Player with no match rows and no link.
_Avoid_: Inactive, retired, removed, deleted

**Player invitation**:
A single-use invitation tied to one unlinked Player, issued by a Group admin or Manager, either a bearer link or addressed to an email that must match the accepting Account's verified email. Accepting makes the Account a Member, if it is not one, and links it to the Player. Expires after 14 days; may be resent, revoked, or voided when its Player is linked or archived.
_Avoid_: Invite link (ambiguous with a join link), claim, registration link

**Join link**:
A multi-use invitation into a Group, made and revoked by a Group admin, without expiry unless one is set. Accepting makes the Account a Member and asks who they are: an unlinked Player from the pool, or a new Nickname.
_Avoid_: Group invite, public link, share link (reserved for the vote)

**Merge**:
The Group admin act that folds one Player into another. The survivor keeps its Nickname and link; if only the absorbed Player is linked, the link moves. Refused when both are linked to different Accounts or both appear in the same match.
_Avoid_: Combine, deduplicate, alias

**Activity record**:
An append-only record per Group of the acts that change who someone is or what they may do: Members, admins, Managers, Player and Team repairs, Entries and rosters, schedules and their acts, invitations, settings. Names the acting Account, tombstoned on that Account's deletion. Visible to Group admins.
_Avoid_: Audit log, feed, history, timeline

### Competitions

**Competition**:
A named run of matches inside a Group with one Format, its own settings, its Managers and a history of Seasons. Every lineup and roster in it is drawn from the Group's Player pool. Created, configured, ended and deleted by Group admins.
_Avoid_: Tournament, event, league (as the general word)

**Format**:
The kind of Competition, chosen at creation and never changed: Pickup, League or Knockout. Pickup is the Squad format; League and Knockout are Team formats.
_Avoid_: Type, competition type, mode

**Squad format**:
A Format with one pool of players and sides drawn per match, producing a player table. Pickup is the only one.
_Avoid_: Casual format, informal, duel

**Team format**:
A Format with fixed teams and rosters per Season, a schedule or a bracket, and a team table beside the player stats. League and Knockout.
_Avoid_: Structured format, organised, proper

**Pickup**:
The Squad format: two sides picked from the Player pool for each match, every match a result on its own, one player table across them.
_Avoid_: Duel, Home and Away, friendly, casual

**League**:
The Team format in which every team plays every other on a round-robin schedule and Standings rank them.
_Avoid_: Tournament, table (as the competition), round robin (as the competition)

**Knockout**:
The Team format in which teams are drawn into a single-elimination bracket and one winner is left.
_Avoid_: Cup, tournament, playoff, bracket (as the competition)

**Match format**:
The number of players a side fields on the pitch, 3 to 11, named "N-a-side". A fact of each Pickup match, chosen when it is added; a setting of a League or Knockout inherited by every Fixture, changeable only while the Current season has no matches. A side's lineup may hold more players than the Match format, the rest being substitutes, or fewer.
_Avoid_: Match type, size, team size, format (alone: that is the Competition's)

**Usual match format**:
A Pickup Competition's setting that prefills the Match format of a new match. Seeded from the Group's default when the Competition is created; editable.
_Avoid_: Default format, competition match format

**Voting period**:
A Competition setting: the number of whole days, 1 to 14, after a match is completed during which ballots are accepted, ending at the end of the last day in the Group's time zone.
_Avoid_: Deadline (that is the resulting instant), voting window, voting days

**Minimum matches**:
A Pickup Competition setting, off or 1 to 20: the number of Completed matches in this Competition, counted across every Season, a Player must have played before their ballot is accepted. A change applies to matches created after it.
_Avoid_: Voting threshold, voting gate, eligibility, quota, runway

**Active competition**:
A Competition that has a Current season. Every Competition is born Active, and only an Active Competition accepts new matches, settings changes and Roster setup.
_Avoid_: Open, live, running, in progress

**End competition**:
The Group admin act that closes the Current season without opening the next. Refused while the Competition has no Completed match at all; an Empty season is discarded rather than closed and every match still to play becomes Not played. Voting open at that moment runs to its deadline.
_Avoid_: Archive, close, finish, retire

**Ended competition**:
A Competition with no Current season: fully readable and counted in stats, accepting only Start new season, which makes it Active again with the next number, Reopen last season, which makes it Active again with its last Season, a Correction on any of its Past seasons, and deletion.
_Avoid_: Archived, closed, finished, inactive, past competition

### Seasons

**Season**:
One run of a Competition to which every match belongs: a number from 1, an optional Season label, a start and, once closed, an end marking the admin's acts, its matches and, in a Team format, its Entries with their rosters and its schedule or bracket. Shown by the dates of its Completed matches, never by the act instants. Nothing is set per Season.
_Avoid_: Period, edition, campaign, year, term

**Current season**:
The one open Season of a Competition. Every new match lands in it; an Active competition has exactly one and an Ended competition has none.
_Avoid_: Active season, live season, open season

**Past season**:
A closed Season: the record of what was played. Accepts no new match, no deletion and no lineup change, only a Correction. Voting open when it closed runs to its deadline.
_Avoid_: Previous season, archived season, old season, closed season

**Empty season**:
A Season with no Completed match, whether or not a schedule has been generated or a roster drafted. The only kind that can be discarded, and the only kind that cannot be closed.
_Avoid_: Unplayed season, blank season, new season (as a state)

**All seasons**:
The whole of a Competition's history across every Season, viewable as one set of matches and stats.
_Avoid_: All time, overall, total, career (that is a Player's)

**Start new season**:
The Group admin act that closes the Current season and opens the next at one instant, or, on an Ended competition, opens the next Season only. Needs one Completed match in the Current season; lists the matches that become Not played; open votes run on. Informally a rollover.
_Avoid_: Rollover (in copy), close season, finish season, new season (as a verb), reset

**Season label**:
An optional name of up to 30 characters a Group admin gives a Season, unique within the Competition ignoring case and whitespace, shown after the number: "Season 3 · 2026/27".
_Avoid_: Season name, title, year

**Not played**:
The state of a match nobody will play: a Fixture marked by a Manager mid-season, or any match, a Pickup match to play included, left not completed by the closing act of its Season. Kept in the schedule, or apart from a Pickup competition's results; counts in nothing and has no vote; can never be completed or corrected. A Fixture is restored to play by a Manager while the Season is Current; otherwise only Reopen last season restores it.
_Avoid_: Voided, cancelled, abandoned, unplayed, not completed (that is a live Fixture)

**Correction**:
A Group admin's edit of the result facts of one Past season match: scores, scorers, assists, own goals, Shoot-out, date, video link. Never the lineup, the sides or the Season; never on a Not played match. Recorded with the old and new values; never reopens voting.
_Avoid_: Edit (in a Past season), fix, repair, amendment

**Reopen last season**:
The Group admin act that makes the latest Past season Current again, allowed only while nothing has been played since it closed. Discards the empty Season after it, if any, and returns the matches its closing made Not played to not completed. The only reopening a Season ever gets.
_Avoid_: Undo rollover, undo end, unlock season, restore

**Season summary**:
The derived header of a Season: leader (Standings leader, Knockout winner or teams still in, Pickup MVP), top scorer, top assists, most matches, most crowns, with ties shared, and the counts of Completed and Not played matches. Reads "so far" on the Current season. Never stored.
_Avoid_: Season awards, champion (as stored state), recap

### Teams

**Team**:
A fixed side belonging to the Group: a name unique within the Group under the Nickname rule, a colour from a fixed palette, and its Entries. May enter any League or Knockout of the Group, Season after Season. Created, renamed and recoloured by Managers and Group admins; archived, merged and deleted by Group admins, deletion only with no Entry.
_Avoid_: Club, side (that is a match's), squad, placeholder team

**Entry**:
One Team's participation in one Season of one Competition, holding its Roster. A Season of a Team format is made of its Entries, which must differ in colour; a Team has at most one per Season. Exists from the first Save of Roster setup; removed with an Empty season; locked in Roster setup once the schedule or bracket is generated, after which a Group admin adds or withdraws one from the League or Knockout page.
_Avoid_: Participation, entrant, team-in-season, registration

**Roster**:
The Players of one Entry: who plays for this Team in this Season of this Competition. A Player holds at most one Roster spot per Season, a Withdrawn Entry's spots not counting; active Players only are offered, an archived one already on it stays marked. No size bounds, a warning below the Match format. Changed freely by a Manager, applied forward; history lives in lineups.
_Avoid_: Squad, lineup (that is a match's), team list, membership

**Roster setup**:
The Manager's screen on an Active Team format Competition, with one Save and no stored draft: pick the Current season's Entries from the Group's Teams or create Teams inline, set each Roster. Prefilled from the previous Season; Entries may be added or removed only until the schedule or bracket exists; frozen on an Ended competition. Never generates a schedule.
_Avoid_: Teams setup, team names, team management

**Guest**:
A Player in a Fixture's lineup who is not on that side's Roster: any active Player of the pool, even one on another Entry's Roster, marked as a guest on the lineup row. Counts like anyone for goals, assists, rating and the vote; shown separately on the Team page.
_Avoid_: Ringer, loan, substitute (that is a lineup row beyond the Match format), fill-in

**Archived Team**:
A Team hidden from the Entry picker with its Entries, results and history intact. Reversible. The state for a Team that has ever entered a Season and is no longer wanted, since such a Team is never deleted.
_Avoid_: Deleted team, inactive, retired, disbanded

**Team merge**:
The Group admin act that folds one Team into another. The survivor keeps its name and colour; every Entry and lineup row moves. Refused when both have an Entry in the same Season.
_Avoid_: Combine, deduplicate, rename onto

**Copy Entries**:
The Roster setup helper on an Empty season that fills the form with the Entries and Rosters of another Season, of this Competition or of another Team format Competition in the Group. Creates Entries for the same Teams; nothing links the Seasons afterwards.
_Avoid_: Import teams, clone, carry over

**Draw teams**:
The Roster setup helper that deals chosen Players across chosen Teams at random or balanced by average rating, filling the form for adjustment before Save. An option, never the default path.
_Avoid_: Auto-assign, shuffle, generate teams, balance (alone)

**Team page**:
A Team's derived, Members-only page: its Entries by Competition and Season with roster, result and record; totals across everything, titles, appearances and scorers, with guest appearances separate.
_Avoid_: Club page, team profile, team stats (as the page)

### League

**Fixture**:
A match of a Team format that exists because a schedule or bracket, an added cycle, an added team or a Manager's Extra Fixture put it there. To play until it is Completed, by play or by Walkover, or Not played, like every Match; a Pickup match to play is not a Fixture.
_Avoid_: Game, scheduled match, slot, tie (that is Knockout's), upcoming match (in Pickup)

**Schedule**:
A League Season's Fixtures grouped by Round: who plays whom, in what order and, where planned, when.
_Avoid_: Calendar, fixture list, programme

**Round**:
A numbered set of Fixtures in a League Season, numbered from 1 through every cycle; as generated, each Entry appears in it at most once. A Round has no date of its own and its Fixtures may be played in any order. In a Knockout, a stage of the Bracket named by distance from the Final: Final, Semi-finals, Quarter-finals, Round of 16 and so on; a Tie never moves to another Round.
_Avoid_: Matchday, week, gameweek, stage

**Bye**:
The Entry with no opponent in a Round: it rests in a League when the count is odd, and advances in a Knockout, into the next Round's slot with no Fixture, shown as a line in the Round. In a Knockout a Bye is in the first Round only and never two in one Tie; a Tie whose other side ended Not played or withdrew is a Bye for the side that remains.
_Avoid_: Free week, rest day, dummy team, walkover (that is an awarded match)

**Home side**:
The side listed first on a Fixture: "Red 3-1 Blue". Balanced by generation, swapped in the return leg, changeable before completion, and read by nothing else. In a Knockout the higher Seed is listed first, or plays the second leg at home; random under a random draw.
_Avoid_: Home team (as an advantage), hosts, venue, away goals

**Planned date**:
The date of a match while it is to play: optional, possibly in the future, set by generation or by a Manager and changed freely. The same field becomes the match date at completion, where it is required and not later than today. A cleared one means "to be arranged".
_Avoid_: Kick-off, postponed (as a state), rescheduled (as a state), matchday

**Generate schedule**:
The Manager act on an Empty League Season with at least two Entries that creates its Rounds: single or double round robin, optionally dated from a first Round date at an interval in days.
_Avoid_: Create fixtures, draw (that is Knockout's), team setup

**Regenerate schedule**:
Generate schedule run again while the Season is still Empty, discarding every Fixture of the Season first.
_Avoid_: Reset schedule, redo, clear fixtures

**Add a cycle**:
The Manager act that appends one full round-robin cycle over the Entries not withdrawn to a Current League Season, as new Rounds, mirrored from the previous cycle. Undone by Remove last cycle while none of its Fixtures is Completed.
_Avoid_: Extend the season, add legs, third leg

**Extra Fixture**:
A Fixture a Manager adds by hand between two Entries of a Current League Season, in a Round of their choosing. Counts like any other; deletable while to play.
_Avoid_: Friendly, replay (as a kind), unscheduled match, bonus match

**Walkover**:
A Fixture Completed by award because one side did not turn up: 3-0 to the side that did, no lineup, no player stats, no vote. Counts in Standings and Team records; undoable while the Season is Current. In a Knockout the awarded side advances, and a Walkover in a two-leg Tie forfeits the whole Tie whatever the other leg said.
_Avoid_: Forfeit, default, awarded match, W/O, no-show (as the state)

**Withdrawn Entry**:
An Entry a Group admin has taken out of a running Season after it had played: results kept, its roster spots freed, restorable while nothing has been played since. In a League its remaining Fixtures become Not played or Walkovers to the opponents and it ranks last in the Standings; in a Knockout its open Tie becomes a Bye or a Walkover for the opponent and its Result is marked withdrawn. An Entry withdrawn before playing anything leaves the Season instead.
_Avoid_: Removed team, expelled, disbanded, dropped out (as the state)

**Standings**:
The table of a League Season's Entries, read from its Completed matches alone: played, won, drawn, lost, goals for and against, goal difference, points and Form, ranked by points, goal difference, goals for, head-to-head among those level, then a shared position. Withdrawn Entries last.
_Avoid_: League table, ranking, ladder, live table

**Form**:
An Entry's last five Completed matches in the Season by match date, oldest to newest, as W, D or L. Extended to Players in the Stats section: a Player's last five Completed matches in the scope, beside the average of their last five Rated matches.
_Avoid_: Streak, run, recent results (as the column name)

**Champion mark**:
The mark on the Standings leader once no other Entry can reach its points from the Fixtures still to play. Derived; disappears if Fixtures are added.
_Avoid_: Clinched, mathematically won, title secured (as stored state)

**Champion**:
The Entry at the top of a Past League Season's final Standings, ties shared. A title on the Team page.
_Avoid_: Winner (that is Knockout's), league winner, first place (as stored state)

**All seasons Standings**:
A League Competition's whole history pooled by Team across its Seasons: the Standings columns without Form, plus Seasons entered and titles, ranked by the same rule.
_Avoid_: All-time table, historical table, overall standings

### Knockout

**Bracket**:
A Knockout Season's Ties arranged in Rounds from the first Round to the Final, drawn over the Season's Entries, any count from two, sized to the next power of two with Byes in the first Round. Every Tie and Fixture exists from the Draw.
_Avoid_: Tree, tournament, cup draw (as the thing), ladder

**Tie**:
One pairing in the Bracket: two sides, each an Entry, a Bye or the winner of an earlier Tie, in one Round, with one Fixture, or two when the Draw chose two legs, the Final and the Third-place match always one. Decided by its Deciding match, by a Walkover, or left Not played. Any act that would change its winner is refused once anything is recorded on the next Tie.
_Avoid_: Matchup, pairing, fixture (that is a match), game, round (that is the stage)

**Deciding match**:
The Fixture whose completion decides a Tie: a one-leg Tie's match, the second leg, the Third-place match. Level, it must carry a Shoot-out to be completed; its winner fills the next Tie's slot in the same act. A first leg is never one and may be drawn.
_Avoid_: Decider (in copy), final leg, playoff

**Shoot-out**:
The penalty result of a level Deciding match: two totals that differ, the winner derived, recorded there and nowhere else. Read as "Red won 4-3 on penalties". A Shoot-out win is a win, and the other side's loss, for the Team's record and every Player's. Extra time is never recorded.
_Avoid_: Penalties (as the state), pens, extra time, tiebreaker

**Aggregate**:
The sum of the two legs' scores, which decides a two-leg Tie; level after the second leg, it goes to a Shoot-out there. There are no away goals.
_Avoid_: Away goals, overall score, total

**Seed**:
An Entry's place, 1 to N, in the ordered list of a seeded Draw, placed so that 1 and 2 can meet only in the Final; the top Seeds take the Byes. A fact of the Draw, shown as "(1) Red", never changed afterwards; absent under a random draw.
_Avoid_: Ranking, rating (that is a Player's), pot

**Draw the bracket**:
The Manager act on an Empty Knockout Season with at least two Entries that creates the Bracket: seeding random or ordered, with the helpers From a League Season's Standings and From the previous Knockout Season, legs one or two, Third-place match on or off, optionally a first Round date and an interval in days, each leg a step. Prefilled from the previous Season. The whole Bracket at once; there is no draw per Round.
_Avoid_: Generate bracket, create fixtures, seed (as the act), team setup

**Redraw**:
Draw the bracket run again while the Season is still Empty, discarding every Tie and Fixture of the Season first.
_Avoid_: Reset bracket, regenerate (that is League's), clear

**Third-place match**:
An optional one-leg Fixture between the two semi-final losers, in the Final's Round, chosen at the Draw. A Deciding match that counts for stats, records and Results, and for nothing in the Bracket's Winner. A missing loser makes it a Bye; two make it Not played.
_Avoid_: Bronze match, consolation, playoff for third, losers' final

**Winner**:
The Entry that won a Knockout Season's Final. A title on the Team page. A Season whose Final was never Completed has none.
_Avoid_: Champion (that is League's), cup holder, holder, first place

**Runner-up**:
The Entry that lost the Final.
_Avoid_: Second place, finalist (alone: both were), loser

**Result**:
An Entry's derived outcome in a Knockout Season: Winner, Runner-up, Third or Fourth when a Third-place match was played, otherwise the Round in which its last Tie stood, marked withdrawn where that applies.
_Avoid_: Placement, finish, position (that is Standings'), stage reached

**Teams still in**:
The Entries of a Knockout Season that are neither out nor withdrawn: the Season summary's leader line until there is a Winner, and forever in a Season whose Final was not Completed.
_Avoid_: Survivors, remaining teams, contenders, alive

**All seasons record**:
A Knockout Competition's whole history pooled by Team across its Seasons: Seasons entered, titles, finals, played, won, drawn, lost, goals for and against, ranked by titles, finals, wins, then a shared position. Withdrawn Entries' results included.
_Avoid_: All seasons Standings (that is League's), honours board, all-time table

### Matches

**Match**:
One game of a Competition, in the Season that was Current when it was created, never moving. In every Format it is to play until it is Completed, by the Complete act or by a Walkover, or Not played. Only a Completed match counts anywhere.
_Avoid_: Game, result (that is a fact of it), fixture (for a Pickup match), duel

**Side**:
One of the two parties of a match, listed first or second in every result line and read by nothing else. In a Team format an Entry; in Pickup a colour from the Team palette chosen per match, with no name and no history.
_Avoid_: Home, Away, team (in Pickup), squad

**Lineup**:
The Players on one side of a match, as Lineup rows: at least one and at most twice the Match format, roster Players and Guests together. Everyone in it played.
_Avoid_: Roster (that is an Entry's), squad, team sheet, starting eleven

**Lineup row**:
One Player's place in a match: the side, a slot in the Formation or the Bench, goals, assists, own goals and, in a Team format, whether they were a Guest. A Player has at most one per match.
_Avoid_: Match player, appearance (that is a stat), entry

**Bench**:
The Lineup rows beyond the Formation's slots: substitutes who played and count like anyone for stats and the vote. No substitution events, no minutes.
_Avoid_: Subs (in copy), reserves, extras, did not play

**Own goal**:
A goal a Player scored against their own side, counted on their Lineup row toward the opponents' score and never as a goal for them. It has no assist.
_Avoid_: OG (in copy), score adjustment, goal against (that is a side's)

**Unattributed goal**:
The part of a side's score its Players' goals and the opponents' own goals do not account for. Warned about, never refused; attributions may never exceed the score.
_Avoid_: Unknown scorer, missing goal, unassigned

**Formation**:
One of a fixed list per Match format, read defenders first with the keeper implied, that lays a side's first Lineup rows out on the pitch. Kept with each row's slot so a past match renders as it was; presentation only, no positional stat.
_Avoid_: Position (as a stat), role, shape, tactic

**Add match**:
The Manager act that creates a Pickup match to play, with the Match format and side colours prefilled from the Competition and its previous match. A Fixture needs no such act.
_Avoid_: Create match, new game, record (that is filling in the form)

**Save**:
Storing what has been entered on a match to play without checking it: a draft lineup, a score not yet final. Nothing counts and no vote opens.
_Avoid_: Draft (as a state name), submit, record

**Complete**:
The act that makes a match Completed: the completion checks pass, the completion instant is stamped, the vote opens if the match's settings say so, and in a Knockout the next Tie's slot is filled. Everything that counts reads Completed matches.
_Avoid_: Finish, close, confirm, mark as played, submit

**Un-complete**:
The Manager act that returns a Completed match of the Current season to to play with every fact kept as a draft and its ballots kept for re-validation. Refused in a Knockout once anything is recorded on the next Tie; never on a Walkover, which has Undo walkover; never in a Past season.
_Avoid_: Reopen, revert, undo completion, unlock

**Result fact**:
A fact of a match a Manager may edit any time while the Season is Current without reopening the vote: scores, goals, assists, own goals, Shoot-out, date, video link, Match note, Formation and slots, Guest marks, side colours, a Pickup match's Match format. The subset a Correction names is what a Group admin may edit in a Past season.
_Avoid_: Score edit, details, metadata

**Lineup fact**:
Which Players are in a match and on which side. Editable while the vote is open or there is none; frozen after the voting deadline. Adding or removing a Player reopens the vote; a move between sides does not.
_Avoid_: Roster change, team change, squad edit

**Match note**:
Optional text of up to 500 characters on a match, a Result fact, shown on the match page.
_Avoid_: Comment, description, report, caption

**Change record**:
The append-only record on each match of every act on it, naming the acting Account: created, completed, un-completed, each edit with old and new values, Walkover, Not played, Correction. Shown in full to Managers and Group admins; every Member sees "Recorded by".
_Avoid_: Audit log, history, activity record (that is the Group's), edit log

**Draw sides**:
The Pickup form helper that deals the Players who turned up across the two sides at random or balanced by average rating, filling the form for adjustment before Save. Draw teams, reused for a match.
_Avoid_: Shuffle, balance teams, pick teams, auto-split

**Copy last lineup**:
The Pickup form helper that prefills both sides from the Competition's previous Completed match.
_Avoid_: Same as last time, repeat lineup, clone match

### Voting

**Vote**:
What every Completed match carries, in one of three states: none (voting off in the match's settings, a Walkover, or fewer than four Players), open from the Complete act, or closed. A closed Vote is a Rated match or Not rated. Nothing about it is stored but its Ballots and the acts on it.
_Avoid_: Voting session, poll, voting status, election

**Voter**:
A Player in a match's lineups who may cast a Ballot on it: everyone in the match in a Team format; in Pickup everyone at or above Minimum matches, the match itself counted. Every Player in the match is on the ballot whether or not they are a Voter.
_Avoid_: Eligible voter, participant, electorate (in copy)

**Ballot**:
One Voter's three Picks on one match, cast by the Voter through a Linked Account or entered on behalf. At most one per Voter per match; replaceable while the Vote is open; secret. The only stored fact of a Vote.
_Avoid_: Vote (as the thing cast), votes, submission, rating (that is derived)

**Pick**:
One name on a Ballot: first, second or third, each a different Player in the match and never the Voter. Worth three, two and one point in the arithmetic only; copy says "first pick", never "3 points".
_Avoid_: Points (in copy), nomination, choice, vote for

**Entered on behalf**:
A Ballot a Manager or Group admin typed for a Voter, marked with the acting Account and counting like the Voter's own. Visible as such to that Player and to Managers and Group admins. The Player may replace it with their own; a Manager may replace only a Ballot entered on behalf, never a Player's own. Minimum matches binds it like any Ballot.
_Avoid_: Proxy vote, admin vote, submitted for, override

**Replace**:
Casting a new Ballot over one's existing one while the Vote is open; the old Picks are gone, the Ballot keeps its first-submitted and last-changed instants.
_Avoid_: Edit ballot, change vote, amend, resubmit

**Voting deadline**:
The instant a Vote closes if nothing closes it first: the end of the last day of the match's Voting period counted from the completion date in the Group's time zone, or the day Extend set. Shown as a date, "closes Friday".
_Avoid_: Voting period (that is the setting), expiry, cut-off, ends at

**Turnout**:
Who has cast a Ballot on a match and who has not, by name, visible to every Member while the Vote is open and after it closes. The one thing about a Ballot that is not secret.
_Avoid_: Pending votes, missing voters, participation, who's voted (as a name)

**Close now**:
The Manager or Group admin act that closes an open Vote with the Ballots it has, none included. Recorded in the match's Change record. Also happens by itself at the Voting deadline or when every Voter has a Ballot.
_Avoid_: End voting, finalise, force close, lock

**Extend**:
The Manager or Group admin act that moves an open Vote's Voting deadline to a later day, at most 14 days after the completion date; repeatable within that bound. Recorded in the match's Change record.
_Avoid_: Postpone voting, reopen (that is Un-complete and Complete), prolong, grace period

**Voided ballot**:
A Ballot discarded because a lineup change removed its Voter or one of its Picks from the match while the Vote was open. Counts in nothing; the Voter is told and may cast again until the same Voting deadline. Never restored.
_Avoid_: Cancelled vote, invalid ballot, deleted vote, cascaded

**Rating**:
A Player's derived score in a Rated match: the points their Picks earned divided by the Ballots cast in the match, 0.00 to 3.00. "2.40" reads as "on average the second pick". A Player's average is the plain mean over the Rated matches they played in.
_Avoid_: Score, MOTM points, grade, stored rating

**Rated match**:
A match whose closed Vote holds at least three Ballots: it has Ratings, a Results breakdown and a Man of the match, and enters every rating average and crown count.
_Avoid_: Voted match, rated (as stored state), scored

**Not rated**:
A match whose closed Vote holds fewer than three Ballots: no Rating for anyone, no crown, nothing in any average; the page shows the Turnout and "Not rated, 2 of 12 ballots" and never a Pick. Distinct from a match with no Vote.
_Avoid_: Unrated, voteless, incomplete vote, void

**Man of the match**:
Every Player on the highest Rating of a Rated match, derived and never stored. Shared, not broken: two on the same top Rating are both, and each gets a full Crown in every count.
_Avoid_: Player of the match, best player, star man, MVP (that is a Season's)

**Crown**:
The count noun for Man of the match: one per holder per Rated match, summed per Season, per Competition and per career. "Most crowns" in the Season summary.
_Avoid_: MOTM count, awards, medals, titles (that is a Team's)

**Results breakdown**:
The derived per-Player view of a Rated match's Vote: Rating, points received, and how many first, second and third Picks, beside the count of Ballots cast. Reveals no Voter.
_Avoid_: Vote tally, live tally, vote list, who voted for whom

**Your open votes**:
An Account's list, across every Group it belongs to, of the matches in which one of its Linked Players is a Voter without a Ballot, with each Voting deadline; the home page badge. A Voided ballot puts a match back on it.
_Avoid_: Pending votes, to-do, notifications (that is a channel), inbox

**Voting record**:
A Player's stat: the Votes they were a Voter in against those where a Ballot of theirs, own or entered on behalf, was in at close. "Voted in 34 of 40."
_Avoid_: Participation rate, turnout (that is a match's), attendance

**Share link**:
The match page URL as posted in the group chat: one link for the whole Group, Members only, sign-in on the way. Copy vote link adds "Vote on Red 4-3 Blue, closes Friday" and, once closed, the results line. There is no per-Voter link.
_Avoid_: Vote link (with a voter in it), invite link, public link, magic link

### Stats

**Career**:
Everything a Player did in its Group: every Completed match across every Competition and Season, Ended competitions included. Read on the Player page; nothing pools across Groups inside a Group.
_Avoid_: All time (that is a Competition's All seasons), lifetime, profile

**Your career**:
An Account's private page: one row per Group in which it has a Linked Player, with that Player's core columns, and a total line pooling them. Visible to the Account alone; a Group whose Membership ended drops out.
_Avoid_: Global stats, cross-group career, account stats

**Player page**:
A Player's derived, Members-only page: summary, Form and Rating history, a breakdown by Competition and Season, Teams played for with guest appearances apart, Streaks, Played with and Played against, Best matches, Honours and the match history.
_Avoid_: Player profile, player stats page, career page

**Players page**:
The Group-wide player table: every Competition and Season pooled, filterable by Competition and Format, sortable by any column. The Group's leaderboard; there is no other.
_Avoid_: Leaderboard (as a screen), rankings, hall of fame

**Win rate**:
The points share, (3 × W + D) / (3 × played), as a percentage, always shown with the W-D-L record beside it. A draw is worth a third of a win because that is the League's own arithmetic.
_Avoid_: Win percentage, points per match, points share (in copy), 0.3 per draw

**Award threshold**:
A Competition setting, a percentage, 50% by default for every Format: the share of the matches a Player could have played in a Season, the Season's Completed matches in Pickup or their Entry's in a Team format, with a floor of 3, below which the Player is not Qualified. Governs the Current season; a Past season keeps the value in force when it closed.
_Avoid_: Minimum matches (that is voting's), min. matches, qualification, eligibility

**Qualified**:
A Player at or above the Award threshold in a Season: ranked on rate columns and eligible for MVP, Honours and a Season's Records. Others sort below, greyed. No such mark exists on All seasons or pooled tables.
_Avoid_: Eligible, ranked, regular

**MVP**:
The Season summary's leader in Pickup: the Qualified Player with the highest average rating in the Season, ties shared, "MVP so far" on the Current season. A Season with no Qualified Player or no Rated match has none.
_Avoid_: Player of the season, best player, man of the match (that is per match)

**Rating history**:
A Player's Ratings over time: a per-match series across the Group by date with a rolling average over the last 10 Rated matches, per-Season averages in the breakdown, and Form's five-match average.
_Avoid_: Rating trend, performance chart, progression

**Streak**:
A run over a Player's Completed matches by match date then recording order, crossing Seasons, in which absence is invisible: a win streak, an unbeaten run, a scoring streak or a crown streak, each with a current and a longest value.
_Avoid_: Form (that is the last five), run (alone), hot streak

**Clean sheet**:
A fact of a side that conceded nothing, credited to every Player in that side's lineup. Never a keeper's.
_Avoid_: Shutout, goalkeeper stat

**Attendance**:
Pickup only: a Player's played matches over the Completed matches of the scope, "played 34 of 40".
_Avoid_: Participation, turnout (that is a Vote's), appearances rate

**Played with**:
Pickup only: a Player's top teammates by matches on the same side, with the record together and the win rate.
_Avoid_: Top teammates, partners, chemistry

**Played against**:
Pickup only: a Player's top opponents by matches on opposite sides, with the record against.
_Avoid_: Rivals, head-to-head (as a screen), nemesis

**Best matches**:
A Player's top five Rated matches by Rating.
_Avoid_: Top matches, highlights, best games

**Records**:
A Competition's All seasons section of derived bests, ties shared, each naming the Player or match and the date: biggest win, highest-scoring match, most goals and most assists in a match, highest Rating in a match, best Qualified average and most crowns in a Season, longest win, unbeaten and scoring streaks. Never Group-wide.
_Avoid_: Hall of fame, all-time records, achievements

**Honours**:
A Player page section read from Past seasons: MVP, top scorer, top assists and most crowns per Season, ties shared as the Season summary shares them, and Titles.
_Avoid_: Awards, trophies, badges, achievements

**Title**:
On a Player page, a Past League Season won or a Knockout Season won by an Entry the Player made at least one roster appearance for; a Guest appearance earns none. On a Team page, the same Seasons counted for the Team.
_Avoid_: Trophy, championship (as the count), medal

**Group home**:
The screen a Group opens on: Your open votes in the Group, your Player's snapshot, the Active competitions with their Season summary leader lines, and the latest results.
_Avoid_: Dashboard, overview, landing page

**Copy as text**:
The act on a table, a Season summary or Records that produces a plain-text block for the group chat.
_Avoid_: Share (that is the vote's link), copy table

**Export CSV**:
The act on a table that produces one file of its visible scope and columns.
_Avoid_: Download, report, spreadsheet

### Notifications

**Account mail**:
A message sent whenever the act that causes it happens, governed by no preference and carrying no unsubscribe: the verification link, "an Account already exists", set or reset password, the four security notices, and the addressed Player invitation. Still attempted on an Undeliverable address when the person asked for it themselves.
_Avoid_: Transactional email, system email, notification

**Notice**:
A message about what is happening in a Group, sent on a channel under an Account preference and carrying a one-click way off. Never sent to an unverified or Undeliverable address. The Vote reminder is the only one in the first release; a channel beneath it, email now and push later, is a checkbox and not a new preference.
_Avoid_: Notification (as the message), alert, engagement email, digest

**Vote reminder**:
The one Notice: an Account preference, off for a new Account and one switch across every Group, that sends one mail listing every open Vote in which one of the Account's Linked Players is a Voter without a Ballot and whose Voting deadline is within the next 24 hours, each with its Share link. At most once per Voter per match per Voting deadline, so Extend may earn a second.
_Avoid_: Voting invitation, reminder lead, reminder days, nudge

**Reminder prompt**:
The one-time question, "Remind me by email before a vote closes?", shown on the first Ballot an Account casts anywhere. Yes turns the Vote reminder on; Not now leaves it off and the prompt never returns. Account settings hold the switch afterwards.
_Avoid_: Opt-in modal, onboarding step, nag

**Copy reminder text**:
The act, open to every Member on a match with an open Vote, that produces a chat line from the Turnout and the Share link: "Still waiting on Marko, Ivan and Petar. Vote on Red 4-3 Blue, closes Wednesday". A read, never an act on the Vote.
_Avoid_: Nudge, chase, ping, send reminder

**Delivery**:
The record of one message on one channel to one recipient: the Account, or the invitation for an address with no Account, the kind, the channel, the instant, the provider's id and the outcome it reports: delivered, bounced, complained or failed. What "once per deadline" and "not delivered" are read from. Deleted with its Account or Group, otherwise kept 90 days. A send never blocks the act that caused it.
_Avoid_: Email log, outbox (that is the mechanism), sent items, message history

**Undeliverable**:
The mark on an Account's email after a hard bounce or a complaint: Notices stop and a banner asks the person to check their address, while Account mail they ask for is still attempted. Cleared by changing and verifying the email, by turning the Vote reminder back on after a complaint, or by an Operator.
_Avoid_: Bounced (as the state), suppressed, blacklisted, invalid email
