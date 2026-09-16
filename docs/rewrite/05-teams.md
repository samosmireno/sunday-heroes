# Teams and rosters

_Branch session 5, 2026-09-15. Output of the sixth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md` and `04-seasons.md` as settled; settles the open questions under area 5 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

For the Team formats, the fixed sides that play each other and the Players assigned to each. A Team is a named, coloured side that belongs to the Group and can enter any of the Group's League or Knockout competitions, Season after Season, so that "Red" has a history: the league it won, the cup it went out of, the people who have worn its colour. A roster is who plays for a Team in one Season of one competition. Roster setup is the act that puts Teams into a Season and Players onto Teams; it is separate from generating the schedule or bracket, which the League and Knockout sessions own.

## Decisions carried in from the map

- Team formats have fixed teams with rosters, a schedule or a bracket, a team table beside the player stats. Pickup has no teams.
- A Player is a Group-level identity; every roster is drawn from the Group's Player pool. Nothing registers a Player to a competition.
- Rosters become real: a team format match's players come from the two sides' rosters. Roster setup is a per-Season act, separate from generating a schedule.
- From the groups session: a Manager runs Roster setup; archived Players are not offered in it; every act that changes who someone is or what they may do goes in the activity record.
- From the competitions session: match format is a competition setting on a team format, changeable only while the Current season has no matches; a side's lineup may hold more Players than the match format, at most twice it; Roster setup is frozen on an Ended competition; team count, legs, bracket size and seeding are generation inputs per Season, not settings.
- From the seasons session: after a rollover Roster setup opens prefilled from the previous Season; an Empty season is discarded with its unplayed Fixtures and whatever Roster setup had saved; a Season holds, in a team format, its teams and rosters.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **A team is a global row.** The Team table holds a name and nothing else: no dashboard, no competition. A competition reaches its teams through a join row that also carries the standings counters, and a roster row carries the competition id itself. Seasons know nothing about teams or rosters; ADR 0001 kept both competition-scoped, so they silently carry across Seasons.
- **Team names are unique nowhere in the database.** The service checks uniqueness within the competition on rename, then looks for a team of the same name anywhere in the dashboard and, finding one, merges into it: it re-points the join row, match sides, lineup rows and roster rows for this competition only and deletes the old team if no other competition uses it. Renaming to an existing name is the only merge the app has, and nothing in the UI says it will happen.
- **Teams setup is name inputs and a Save.** One input per placeholder team, 1 to 30 characters, no add, no remove, no roster, no colour. Saving also generates the Season's Fixtures if the Current season has no matches, which is why an admin re-saves unchanged names after a rollover to get a schedule.
- **The roster exists in the schema and on no route.** Add, remove and list roster methods live in a service called only from tests. Its two rules, one team per player per competition and at most sixteen, live there too and are unreachable in production. The database's own uniqueness is per team, player and competition, so nothing stops a player being on two teams of one competition.
- **A League match never consults the roster** (issue #45). Match creation creates any nickname it is given, and completion checks only that the match has players, sides and a date.
- **Deleting a team checks nothing.** The delete cascades through the join row, match sides, lineup rows and roster rows, leaving matches with a missing side and the opponents' counters un-unwound.
- **Production holds no team.** Every live competition is a Duel whose two Team rows are named Home and Away.

## The model

### Team

A **Team** is a record of the Group: a fixed side that can enter the Group's League and Knockout competitions. It has:

- a **name**, 1 to 30 characters, unique within the Group under the nickname rule (ignoring case and surrounding or repeated whitespace, typed casing kept), renameable at any time with history following the Team;
- a **colour**, one of a fixed palette of about sixteen, shown wherever the Team appears: schedule, Standings, bracket, lineup shirts, the Team page. Two Teams may share a colour, but not while both are in the same Season (see Entry);
- its **Entries**, one per Season it has entered; and
- an active or **archived** state, exactly as a Player has.

Nothing else: no captain, no logo, no short name, no home ground. Every Team of the Group is offered to every League and Knockout in the Group, and a Team's history is the union of its Entries across competitions. Whether the four sides of the league are also the four sides of the cup is a fact about people that the app never guesses; the admin enters the same Teams into both.

A Team comes into being from the Teams page or inline in Roster setup, created by a Group admin or a Manager, the same split as an unlinked Player. Both may rename or recolour it. Archive, merge and delete are Group admin acts.

### Entry

An **Entry** is one Team's participation in one Season of one competition. It holds the Team's **roster** for that Season and is what the Season's schedule, bracket, Standings and results refer to. A Season of a team format is made of its Entries: "the teams in Season 2" are the Teams with an Entry in it, and the League and Knockout sessions' "team count" generation input is simply the number of Entries.

A Team has at most one Entry per Season. Within a Season, every Entry's colour must differ; Roster setup refuses to Save two Entries of the same colour and asks for one of them to change. The rule lives on the Season because two Teams with the same colour matter only when they meet; at Group level a colour is never reserved, so a Group that has had twenty Teams over the years never runs out.

An Entry exists from the first Save of Roster setup in that Season. Discarding an Empty season removes its Entries; nothing else does after generation, which is why adding or removing an Entry once the schedule or bracket exists is the League and Knockout sessions' act, since it touches the schedule. Settled for League in `06-league.md`: a Group admin adds a team to the Season or withdraws one from the League page; a withdrawn Entry keeps its results and roster, ranked last, and one that never played leaves the Season. Settled for Knockout in `07-knockout.md`: a Group admin withdraws a team from the Knockout page, its open Tie becoming a bye or a Walkover, or adds one into a first-Round bye slot.

### Roster

A **roster** is the Players of one Entry: who plays for this Team in this Season of this competition. Rosters are per Entry, not per Team: Red's roster in the league and Red's roster in the cup are two lists, and Red's roster in Season 1 is not touched by anything that happens in Season 2. A Team page reads history from Entries and lineups, never from a live list.

Rules:

- **Exclusive within a Season**: a Player holds at most one roster spot per Season; a withdrawn Entry's spots no longer count (settled in `06-league.md`). Across competitions the same Player may be on Red in the league and Blue in the cup at the same time, with no warning; each Entry's roster is its own list.
- **Active Players only** are offered. An archived Player already on a roster stays on it, shown as archived with a remove action, is not offered in a lineup picker, and is fully restored by unarchiving. Archiving is a picker rule, not a roster edit.
- **No size bounds.** The form warns when a roster is short of the competition's match format, because a short roster means guests every week. There is no maximum: the lineup cap of twice the match format per side already stops an absurd match, and a large roster harms nothing.
- **Changes are free, mid-season, by a Manager, and apply forward.** The roster is "who is on this Team now"; a Fixture's lineup is drawn from the roster at recording time and a completed match keeps its lineup. History lives in lineups, not in the roster. Every change is recorded in the activity record, which is what makes free changes safe to offer.

### Roster setup

**Roster setup** is one screen on an Active team format competition, run by a Manager or a Group admin, with one Save. It shows the Current season's Entries and each roster. There is no stored draft state: before the first Save of a new Season the Season has no Entries and the screen prefills from the previous Season's Entries and rosters; after Save the Entries exist, and an Empty season being discarded takes them with it.

Before the schedule or bracket is generated, Roster setup is the whole setup: pick Entries, from the Group's active Teams or Teams created inline; set each roster; Save. After generation the same screen edits rosters, and Team names and colours, but adding or removing an Entry is no longer possible here. Roster setup is frozen on an Ended competition; the Team's own name and colour are not, because they belong to the Group.

Two helpers on the screen, both filling the form for hand adjustment before Save:

- **Copy Entries**: on an Empty season, copy the Entries and rosters of another Season, either the previous Season of this competition (the prefill) or any Season of another team format competition in the Group. The copy creates Entries for the same Teams with copies of their rosters; afterwards nothing links the two Seasons. This is how the league feeds the cup.
- **Draw teams**: an option, not the default path. Pick the Players taking part and the Teams, and the app deals the Players out, either at random or balanced by average rating from the Group's history, with a Manager's ranking where there is no history. The balance formula is the stats session's; the result is a form, not a fact, until Saved. Settled in `10-stats.md`: a Player's balancing rating is their average over their last 10 Rated matches in the Group, any competition; a Player with none takes the median of those being drawn; the app minimises the difference in summed rating and shows each Team's sum.

Roster setup never generates a schedule or bracket. Generation is its own act on the League and Knockout pages, needs at least the Entries, and does not need any roster to be non-empty; it only warns.

### Guest

A **Guest** is a Player in a Fixture's lineup who is not on that side's roster. The roster is the default and the Guest is the recorded exception: any active Player of the pool may guest, including a Player on another Entry's roster in the same Season, even against their own Team, with a warning in the form. The lineup row is marked as a guest appearance. Goals, assists, the rating and the ballot count for the Guest like for anyone; a Team page shows guest appearances separately from roster appearances, and whether a guest appearance counts as "played for" in a Player's team stats is the stats session's call.

The matches session received this as a recommendation for the Fixture lineup form and adopted it in `08-matches.md`: each side's picker offers the Entry's roster with everyone pre-selected, and an "add a guest" action opens the rest of the pool, including the inline "type a nickname" path that creates a Player under the groups session's rules.

### Team life cycle and repairs

| Act                             | Manager | Group admin | Rule                                                                                                                                                                                             |
| ------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Create, rename, recolour        | yes     | yes         | From the Teams page or inline in Roster setup; rename at any time, history follows the Team; a recolour that collides within a Season the Team is in is refused                                  |
| Enter or withdraw from a Season | yes     | yes         | Through Roster setup while the Season has no schedule or bracket; afterwards a Group admin act on the League page (settled in `06-league.md`) or the Knockout page (settled in `07-knockout.md`) |
| Edit a roster                   | yes     | yes         | Any time on an Active competition; recorded                                                                                                                                                      |
| Archive, unarchive              |         | yes         | Hides the Team from the Entry picker; history intact; reversible in one click                                                                                                                    |
| Merge                           |         | yes         | Fold one Team into another. The survivor keeps its name and colour; every Entry and lineup row moves. Refused when both have an Entry in the same Season                                         |
| Delete                          |         | yes         | Only a Team with no Entry at all. A Team that has ever entered a Season is archived, never deleted                                                                                               |

Two Player repairs from the groups session meet rosters:

- **Player merge**: the absorbed Player's roster spots move to the survivor; where the survivor already holds a spot in that Season, the absorbed spot is dropped, because spots are exclusive. No new refusal.
- **Player delete**: still allowed only with no match rows and no link. A roster spot is removed with the Player and blocks nothing.

### Team page

Every Team has a page, Members only like everything else, and everything on it is derived. Header with colour and name. A section per competition the Team has entered, each listing its Entries by Season with the roster, the final position or the Knockout Result and the record. Totals across everything: played, won, drawn, lost, goals for and against, titles (League Seasons finished first, Knockout Seasons won), most appearances and top scorers for the Team, with guest appearances counted separately. The stats session owns the exact list; this session owns that the page exists and that it is keyed on the Team across competitions. Settled in `10-stats.md`: per Entry the roster, position or Result, record and Form; totals in the record columns; titles and finals; most appearances, top scorers, top assists and best average rating over roster appearances, with guest appearances in a separate list; Walkovers in the record and in nothing per Player.

### Teams page

A Group-level list: active Teams with colour, name, the competitions they have entered and their record, archived Teams below. Create, rename and recolour happen here as well as in Roster setup; archive, merge and delete only here.

### All seasons Standings

A Team is one record across Seasons, so a competition's All seasons Standings exist and pool by Team. The League session owns the table; this session settles that it can be built.

### Activity record

Team created, renamed, recoloured, archived, unarchived, merged, deleted; Entry added or removed; Player added to or removed from a roster; Copy Entries and Draw teams used. Each names the acting Account. Roster changes are frequent, but the record is an admin screen, and it is the reason free mid-season changes and Team merge are safe to offer.

## Scenarios that shaped the model

- **The league and the cup.** Four Teams play the Sunday League; in June the same four play a Knockout. The admin creates the cup, opens Roster setup, copies the league's Current season Entries, adjusts two rosters, Saves. The Team page of "Red" shows both competitions and, if it wins the cup, a title.
- **Red wins Season 1 and Season 3.** One Team, three Entries; All seasons Standings and two titles on the Team page.
- **Marko moves away in March.** A Manager removes him from Blue's roster; the seven matches he played keep him in their lineups; the activity record says when.
- **Blue is short a man.** Ana from Red plays for Blue; the form warns, the lineup row says guest, her goal counts for her and for Blue's score, and the Team page of Blue lists her under guest appearances.
- **"Reds" and "Red".** Two Managers created one side twice in two competitions. An admin merges; Entries and lineups move to the survivor, refused only if both were entered in the same Season.
- **Red in the league, Blue in the cup.** Marko may hold both roster spots at once; the app does not know whether the cup is the same teams.
- **A colour clash.** The cup's four Teams include two greens because they were created in different competitions. Roster setup refuses to Save the Season until one changes colour.
- **Season generated by mistake.** The admin ends or reopens as the seasons session says; the Entries of the discarded Empty season go with it, the Teams stay in the Group.
- **A Team that never played.** Created by mistake, no Entry: delete. A Team with one Entry in a Season that was played: archive.
- **Twenty people, four Teams, no idea how to split.** Draw teams deals them out, balanced by rating; the Manager swaps two before Save.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Team as a Group record** entering several competitions, chosen over a per-competition Team so that a Team page can aggregate across the league and the cup.
- **Entry** as the word for a Team's participation in one Season, holding its roster; the team count generation input is the number of Entries.
- **Roster per Entry**, not a live roster on the Team, so every Season's record is exact.
- **Free mid-season roster changes** by a Manager, applied forward, recorded.
- **Exclusive rosters within a Season** with **Guest** as the recorded exception at lineup level, including a Player from another roster.
- **Name and colour only**: name unique in the Group under the nickname rule, colour from a palette of about sixteen, unique among the Entries of a Season and nowhere else.
- **No roster size bounds**; a warning below the match format.
- **Roster setup as one screen with one Save and no stored draft**; Entries locked once the schedule or bracket exists; frozen on an Ended competition.
- **Copy Entries** from another Season of any team format competition in the Group.
- **Draw teams**, random or rating-balanced, as an option on Roster setup.
- **Team life cycle mirroring Players**: create, rename and recolour by Managers; archive, merge and delete by admins; delete only with no Entry.
- **Team merge** as an admin repair, refused when both have an Entry in the same Season.
- **Player merge moves roster spots**, dropping the absorbed spot where the survivor already holds one; Player delete is not blocked by a roster spot.
- **An archived Player stays on a roster**, marked, not offered in lineups.
- **One Player on different Teams in two concurrent competitions**, allowed without warning.
- **A Team page** keyed on the Team across competitions, and a **Teams page** for the Group.
- **All seasons Standings** exist, pooled by Team.
- **Activity record entries** for every Team, Entry and roster act.
- **The Fixture lineup picker recommendation** handed to the matches session: roster first, "add a guest" behind an action.

### Declined, and why

- **A Team per competition, persisting across its Seasons.** It was the recommendation; the user wants one Team page across the league and the cup, and a Group-level Team gives that without a shared-record problem, since rosters and results live on Entries.
- **A Team copied per Season.** No history, no All seasons Standings.
- **A live roster on the Team** shared by every competition. "Who was on Red in Season 1" would be recoverable only from lineups.
- **A captain.** No act needs one; Manager is the role that writes. A logo, short name and home ground for the same reason: nothing reads them.
- **A transfer window or a frozen roster.** Federation ceremony; the person who moves away in March is the real case.
- **Roster minimum and maximum**, including one that follows the match format. The lineup cap already refuses an absurd match; a short roster is warned about, not refused.
- **A stored draft state with a confirm act** for Roster setup. A flag on every query for a screen with a Save button.
- **Colour unique at Group level.** It would run out and it protects nothing outside a Season.
- **Deleting a Team that has history.** Archive is the act; matches never lose a side again.
- **A new refusal on Player merge** for two roster spots in one Season. Dropping the absorbed spot is the obvious outcome.

## Hand-offs to other sessions

- **Groups (2)**: Teams are Group records with the Player split of acts; the Teams page sits beside the Players page; Player merge and delete interact with roster spots as stated here; Team acts join the activity record.
- **Competitions (3)**: applied to that document in this session: roster bounds do not reference the match format; a warning below it is all.
- **Seasons (4)**: applied to that document in this session: a Team is one record across Seasons and a Season holds Entries, so All seasons Standings exist; "roster drafts" are the Entries and rosters of an Empty season, removed with it.
- **League (6)**: the team count generation input is the number of Entries; generation needs Entries, not rosters; adding or removing an Entry after generation, a withdrawn Team and its Not played Fixtures are that session's; All seasons Standings pooled by Team; the Standings show each Entry's colour. Settled in `06-league.md`: a Group admin adds a team to the Season, its pairings appended as new Rounds, or withdraws one, its remaining Fixtures Not played or awarded as Walkovers, ranked last with its results kept and its roster spots freed; a Team that withdraws before playing leaves the Season entirely.
- **Knockout (7)**: the bracket is drawn over the Season's Entries; a withdrawn Entry is that session's; a Knockout Season won is a title on the Team page. Settled in `07-knockout.md`: a withdrawn Entry keeps its results, frees its roster spots and has its open Tie turned into a bye or a Walkover; a late entrant enters through a first-Round bye slot and sets its roster afterwards; the Team page shows each Knockout Entry's Result, counts a Winner as a title and a Walkover in the record.
- **Matches (8)**: the lineup picker recommendation: each side offers its Entry's roster pre-selected and "add a guest" opens the pool with the inline nickname path; a guest appearance is a fact on the lineup row; the form warns when a guest is on another Entry's roster this Season; the one-to-twice-the-match-format cap counts roster players and guests together; Draw teams is worth reusing for drawing Pickup sides. Settled in `08-matches.md`: the picker recommendation is adopted as the Fixture form's shape; the guest mark is a result fact of the lineup row; Draw sides reuses Draw teams on the Pickup form.
- **Voting (9)**: a Guest is in the match and votes and is voted for like anyone. Settled in `09-voting.md`: adopted; a team format vote has the Pickup shape, one electorate across both sides and one crown per match, with no Minimum matches; the average rating Draw teams balances on reads Rated matches only.
- **Stats (10)**: whether a guest appearance counts as "played for" in a Player's team stats; the exact Team page stat list, titles, most appearances and top scorers; the rating-balance formula for Draw teams; the "team" column of the player table in a team format reads the Entry's roster. Settled in `10-stats.md`: a guest appearance counts fully for the Player and never as "played for" a Team; the Team page list is titles, finals, record and Form per Entry, most appearances, top scorers, top assists and best average rating over roster appearances, guests apart; Draw teams balances on the last 10 Rated matches Group-wide with the median for the unrated.
- **Architecture (12)**: the Team name unique index per Group under the normalised rule; Entry unique per Team and Season; the roster spot unique per Player and Season across the Season's Entries; colour uniqueness among a Season's Entries checked at Save; Team merge as one transaction re-pointing Entries and lineup rows; two Managers saving Roster setup at once, where last Save wins is acceptable but a stale form must not silently drop the other's roster change. Settled in `12-architecture.md`: the Team name as a functional unique index per Group; Entry unique per Team and Season; the roster spot unique per Player and Season; colour uniqueness among a Season's Entries checked inside the Save act; Team merge as one act in one transaction; a version column on the Season's roster set, so a stale Roster setup form is refused with a conflict and reloads rather than dropping the other Manager's change.
- **Frontend (13)**: the Roster setup screen with the Entry picker, inline Team creation, Copy Entries and Draw teams; the colour palette; the Teams page and the Team page; the archived marker on a roster row; the "add a guest" step in the lineup form. Settled in `13-frontend.md`: Roster setup is an accordion of Entries with roster chips, inline Team creation, Copy Entries and Draw teams filling the form, one Save; the palette is sixteen named colours, nine from the identity and seven added; the Teams page is a sub-tab beside Players; "add a guest" opens the rest of the pool from the picker sheet.
- **Data migration (15)**: nothing. Production holds no team format competition; the Home and Away rows collapse into Pickup sides as the map says, and no Team, Entry or roster is created.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Team, Entry, Roster, Roster setup (tightened from the map), Guest, Archived Team, Team merge, Copy Entries, Draw teams, Team page. "Teams setup", "placeholder team", "team names" and "squad" as a team's list are retired.
