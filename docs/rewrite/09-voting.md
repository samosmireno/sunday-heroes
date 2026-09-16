# Voting and man of the match

_Branch session 9, 2026-09-15. Output of the tenth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md`, `04-seasons.md`, `05-teams.md`, `06-league.md`, `07-knockout.md` and `08-matches.md` as settled; settles the open questions under area 9 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

After a match, the people who played it say who played best. That is the heart of the app: a ballot per player, a rating per player per match, and a man of the match, all derived from nothing but the ballots. The vote is what brings a Player to sign in, what the group chat argues about on Monday, and what the stats session turns into a rating history. This session gives the vote one shape across every Format, one arithmetic, one set of states with the acts that move it between them, a secret ballot with a visible turnout, and a floor below which a match is honestly not rated.

## Decisions carried in from the map

- A ballot is exactly three distinct other Players in the match, worth three, two and one. Man of the match is every Player on the top rating, shared and never broken.
- Ratings and the crown are derived from ballots at read time; nothing about a vote is stored except the ballots and the acts on it. A correction is never a repair.
- Voting is a per-competition switch with a voting period of 1 to 14 whole days; a match carries the settings it was created under. Turning voting off leaves open votes running.
- From the matches session: the vote opens at the Complete act, never on a match to play; the deadline is the end of the last day of the period in the Group's time zone, counted from completion; only adding or removing a Player reopens a vote, a move between sides does not, and only before the deadline, after which the lineup is frozen; Un-complete keeps ballots for re-validation and re-completion runs a fresh period; a substitute votes and is voted for; a Walkover or Not played match has no vote; the match page hosts the vote and is the share link's target.
- From the groups session: a Player votes through a Linked Account; a Manager or Group admin may enter a ballot on behalf of any Player in the match, linked or not; "entered on behalf of" names the acting Account and tombstones like the activity record; an archived Linked Player may still vote in matches it played; ballots stay when a Membership ends.
- From the competitions session: Minimum matches, Pickup only, off or 1 to 20, counts Completed matches in this competition across every Season and applies to matches created after a change; team formats have no gate because their lineups are roster-based.
- From the seasons session: a vote open when a Season closes runs to its deadline and accepts ballots, own or on behalf, until then; a Correction never reopens a vote; a reopened Season changes nothing about open votes.
- From the teams and Knockout sessions: a Guest votes and is voted for like anyone; each leg of a Tie is a match with its own vote; a Shoot-out changes nothing about the vote.
- From the notifications area of the map: a share link posted in the group chat is the primary path to a vote; the reminder is an Account preference, settled there.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **The rating is points received per ballot cast.** The stored formula divides points received by the number of vote rows in the match and multiplies by three; every ballot is three rows, so the result is points per ballot, from 0 to 3, rounded to two decimals. An absent voter changes nobody's rating; they only hold the vote open. The map's worry that an absent voter lowers everyone was unfounded.
- **One ballot rates a match and crowns someone.** A vote that closed with one ballot gives that voter's first pick a 3.00 and the crown. A vote that closed with none used to store a 0 for everyone and crown the whole squad, repaired by one migration; a second migration recomputed matches that closed on their last ballot, where the closing ballot had been left out of the stored rating.
- **Ratings and the crown are stored at close and never recomputed**, so every later change to the ballots, the lineup or the formula needed a repair. The crown flag is set and never cleared.
- **One ballot per voter, no edit**, refused at submit. Self-vote is prevented only in the form; the server checks three distinct Players but not that the voter is absent from them.
- **Closing is on the last eligible ballot or at a midnight cron**, whichever comes first; a noon cron sends reminder emails to eligible non-voters with an email, within a configured lead time. The pending-votes page lists who has not voted, for admins only.
- **A ballot on behalf is indistinguishable from the Player's own.** The vote rows carry the voter's Player and nothing about who submitted them. Every participant who has not voted, linked or not, holds the vote open.
- **The vote link carries the voter's Player id** in the query string and opened without a session until recently; the vote page is a route of its own, apart from the match.
- **Ballots are visible to admins and moderators** through the pending-votes response, which returns every vote row of the match.

## The model

### The vote and its states

Every Completed match carries exactly one **vote**, in one of three states:

- **none**: the match's settings snapshot has voting off, the match is a Walkover, or the match has fewer than four Players in its lineups, so no ballot of three other Players could exist. The match page says which.
- **open**: from the completion act until the deadline, the last ballot or Close now, whichever comes first.
- **closed**: ballots are final. A closed vote is **Rated** when it holds at least three ballots and **Not rated** otherwise.

A match to play or Not played has no vote at all. Un-complete takes the vote with the match: the ballots are kept as facts of the match and the next completion act opens a fresh vote with a fresh deadline, re-validating them as below.

The **deadline** is an instant: the end of the last day of the match's voting period, counted from the completion date in the Group's time zone, or the day Extend set. It is shown as a date, "closes Friday".

### Voters and ballots

The **voters** of a match are the Players in its lineups who pass Minimum matches: in a team format every Player in the match; in Pickup every Player in the match with at least the Minimum matches value, the match itself included since it is Completed, or everyone when the setting is off. Being a voter says nothing about being voted for: **every Player in the match is on the ballot**, a Player below Minimum matches included.

A **ballot** is one voter's three ordered **picks**, first, second and third, each a different Player in the match and none of them the voter. The picks are worth three, two and one point in the arithmetic and nowhere else: copy reads "first pick", never "3 points". A voter has at most one ballot per match and may **replace** it while the vote is open; the replacement overwrites the picks, the ballot keeps its first-submitted and last-changed instants, and nothing of the replaced picks is kept. There is no edit after close.

A Player casts their own ballot through a Linked Account, from the match page. A Manager or Group admin may enter a ballot **on behalf** of any voter, linked or not. Such a ballot carries the acting Account, "entered by Ana", tombstoned on that Account's deletion as the change record does, and counts exactly like an own ballot. Who may overwrite whom:

| Existing ballot   | The Player may                           | A Manager or Group admin may      |
| ----------------- | ---------------------------------------- | --------------------------------- |
| none              | cast their own                           | enter one on behalf               |
| entered on behalf | replace it with their own; the mark goes | replace it, by anyone's on behalf |
| the Player's own  | replace it                               | nothing                           |

The Player's own word outranks the proxy's, always. Minimum matches binds the on-behalf path as much as the Player: nobody can carry in a ballot the Player could not cast. A ballot once accepted is never revoked: if an earlier match of the Player is later deleted or un-completed, the ballot stands.

Abstaining is declined: a voter who will not vote holds the vote open to the deadline, and Close now is the Manager's answer, not a fourth kind of ballot.

### Secrecy and turnout

The ballot is secret. A ballot's picks are visible to the Player it belongs to and, when it was entered on behalf, to Managers and Group admins, who typed it; to nobody else, ever, including after close. Aggregates are public within the Group from three ballots up, and a match below that shows no aggregate at all, so counts of picks never reveal a voter.

The **turnout** is not secret. While the vote is open and after it closes, every Member sees who has voted and who has not, by name, with "entered on behalf" shown only to the Player concerned and to Managers and Group admins. This is the pressure the group chat applies by hand every week, and the app applies it in the open. Ratings, the breakdown and the crown appear only once the vote is closed, to everyone, so nobody herds and no Manager reads a running tally.

### Closing

A vote closes when the first of these happens:

- **the deadline** passes;
- **the last ballot**: every voter of the match has a ballot, own or on behalf. A voter who will never register holds the vote open until a Manager enters a ballot for them or the deadline passes, because "the vote closes when everyone has voted or the period ends" is the one sentence a Member can repeat;
- **Close now**, a Manager or Group admin act on an open vote, with whatever ballots it has, zero included, for the game everyone agrees not to rate or the one everyone has forgotten.

**Extend** is the other act on an open vote: it sets a new deadline, a calendar date after the current one and at most 14 days after the completion date, the vote closing at the end of that day in the Group's time zone. Repeatable inside that bound, so no vote outlives a fortnight from its completion. Both acts are recorded in the match's change record and both are allowed on a Past season match whose vote is still open: a vote act is not a match write.

There is no act that reopens a closed vote. Un-complete and Complete again is that path, deliberately visible and recorded twice, as the matches session settled; in a Knockout it is refused once anything is recorded on the next Tie, and then the closed vote stands.

### Reopening on a lineup change

A Player added to or removed from an open vote's match, by a lineup edit before the deadline or by re-completion after Un-complete, reopens the vote for those it affects. The deadline stays. Then:

- a ballot that still names three Players in the match, by a voter still in the match, stands;
- a ballot by a removed voter, or naming a removed Player, is **voided**: discarded from every aggregate, and the voter, if still in the match, may vote again. The voter is told on the match page that their ballot was voided because a Player left the match, and the match reappears in their open votes;
- a Player added may vote and be voted for until the same deadline;
- a Player removed and added back votes again; the voided ballot stays voided.

Ballots of a Player whose Membership ended or who was unlinked stand, open or closed. They can no longer cast or replace one themselves; a Manager may enter on behalf as for any unlinked Player.

### Ratings, the floor and the crown

All of it is derived at read time from the ballots of a closed vote, never stored:

- a Player's **rating** in a match is the points they received divided by the ballots cast in the match, from 0.00 to 3.00, two decimals: "2.40" reads as "on average the second pick";
- a closed vote with fewer than three ballots leaves the match **Not rated**: no rating for anyone, no crown, and nothing about it in any average. The match page says "Not rated, 2 of 12 ballots" and shows the turnout, nothing else. The floor is applied at read time like the rest, so a Manager who enters a third ballot on behalf before close rates the match;
- **man of the match** is every Player on the highest rating of a Rated match, a **shared crown** that nothing breaks. Each holder gets a full crown in every count: per Season, per competition, career;
- the **results breakdown** of a Rated match shows, per Player, the rating, the points received, and how many first, second and third picks they got, beside the count of ballots cast. Counts of picks reveal no voter.

In stats, a Player's average rating is the plain mean of their ratings over the Rated matches they played in; a 0.00 in a Rated match is a real rating and counts; a Not rated match, a match with no vote and a Walkover count in nothing rating-wise, and crown counts read Rated matches only. Weighting by ballots is declined as an average nobody can recompute in their head. The columns and the MVP rule stay with the stats session. Settled in `10-stats.md`: the MVP of a Pickup Season is the Qualified Player, by the competition's Award threshold, with the highest average rating, ties shared.

### Team formats

The vote has the same shape in League and Knockout as in Pickup: one electorate, everyone in the match, one ballot of three picks across both sides, one crown per match. Roster-based lineups replace Minimum matches; nothing else differs. Per-side voting with two crowns, and opponents-only picks, are declined: one ballot rule keeps ratings comparable across Formats and keeps the voting switch meaning one thing.

### The match page, the share link and open votes

The vote lives on the match page, Members only like everything else. Open: the deadline, the turnout, and for a voter the ballot or their own ballot with Replace. Closed: Rated with the ratings, the breakdown and the crown, or Not rated with the turnout. None: why.

The **share link** is the match page URL and nothing more: one link for the whole group, sign-in on the way if needed, a non-Member landing on the groups session's "not a member" screen. **Copy vote link** produces the URL with a line of text, "Vote on Red 4-3 Blue, closes Friday"; after close the same action copies the results line with the man of the match. A per-voter link is a credential pasted into a chat and is retired. Settled in `11-notifications.md`: **Copy reminder text**, open to every Member while the vote is open, produces "Still waiting on Marko, Ivan and Petar" from the turnout with the same line and link.

**Your open votes** is a per-Account list of every match, across all the Account's Groups, in which one of its Linked Players is a voter without a ballot, with the deadline, reachable from the home page and shown as a badge. It is the in-app half of the share link: the link brings you in, the list catches what the chat missed. A voided ballot puts the match back on it. Its shape is the frontend session's. Settled in `13-frontend.md`: a list on the Account home with each deadline, a count badge on the You tab and on each Group in the switcher, and the red starburst on the Group home for the open votes in that Group.

### Voting record

A Player's **voting record** is a stat: the votes the Player was a voter in against those where a ballot of theirs, own or on behalf, was in at close, "voted in 34 of 40". Shown on the Player's page and available as a column to the stats session. Derived from ballots like everything else.

### Roles

| Act                                          | Member with a Linked Player in the match | Manager                  | Group admin              |
| -------------------------------------------- | ---------------------------------------- | ------------------------ | ------------------------ |
| Cast or replace own ballot                   | yes                                      | yes                      | yes                      |
| Enter or replace a ballot on behalf          |                                          | yes                      | yes                      |
| Close now, Extend                            |                                          | yes                      | yes                      |
| See a ballot's picks                         | own only                                 | on behalf only, plus own | on behalf only, plus own |
| See the turnout, and the results once closed | every Member                             | yes                      | yes                      |

A Manager not in the match casts no ballot; on behalf is for the voters. Nothing about the vote is an Operator's business.

## Scenarios that shaped the model

- **Fourteen play, nine registered.** Nine ballots come in by Wednesday; five Players will never register. The vote runs to Friday's deadline unless the Manager enters the missing five from the group chat or presses Close now. Either way the match is Rated on what it has.
- **Marko's ballot from WhatsApp.** The Manager enters it: "entered by Ana" on Marko's ballot, seen by Marko if he ever links, and by Managers. Marko registers on Thursday and replaces it with his own; the mark goes.
- **Two ballots and a shrug.** A four-a-side where only two people voted: Not rated, 2 of 8 ballots, turnout shown, no picks visible, no crown. Nothing enters anyone's average.
- **A 2.40 and a 2.40.** Two Players top the match; both wear the crown and each counts one crown for the season.
- **The wrong Marko, found Monday.** The vote is open; the Manager swaps the Player. The three ballots that named the wrong Marko are voided and those voters see why on the match page and in their open votes; the right Marko can vote and be voted for until Friday.
- **The holiday week.** Half the squad is away; the Manager extends to the following Friday. Nobody can extend past the fourteenth day after completion.
- **The game nobody wants rated.** Abandoned at sixty minutes, result stands; Close now with the two ballots that came in: Not rated.
- **Turned off mid-vote.** The admin switches voting off on Wednesday; Sunday's vote runs to Friday; next Sunday's match has none.
- **A first leg and a Final.** Each leg of a Tie votes on its own with the same rule as any match; the shoot-out changes no rating.
- **Three-a-side, three Players.** A short-handed game with three Players in total has no vote and says so; it still counts for every stat.
- **Who voted?** Every Member sees that eleven of fourteen have; nobody but Ana sees what Ana picked.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Points per ballot cast, 0.00 to 3.00**, as today's arithmetic already is; scaling is a presentation choice the frontend session may revisit. Kept as is in `13-frontend.md`, shown as "2.10 · 18" with its count.
- **A three-ballot floor**: a closed vote with fewer than three ballots is Not rated, counting in nothing and crowning nobody, shown as "Not rated, 2 of 12 ballots".
- **Replacing a ballot while the vote is open**, last submission wins, nothing of the old picks kept.
- **A ballot on behalf marked with the acting Account**, counting like an own ballot, visible to the Player and to Managers and Group admins; the overwrite table above.
- **Closing on the last ballot on top of the deadline**, every voter counted whether linked or not, with Close now and Extend for a stuck vote, Extend bounded to 14 days after completion.
- **A full crown each on a tie.**
- **One vote shape across Formats**: one electorate, one ballot, one crown per match.
- **No vote under four Players.**
- **A secret ballot with a visible turnout**, results only after close, no running tally for anyone.
- **The results breakdown**: points, ballots cast, firsts, seconds and thirds per Player.
- **Your open votes**, a per-Account list across Groups with a badge.
- **The ballot survival rule on a lineup change** as the matches session recommended, plus telling the voter their ballot was voided.
- **Minimum matches at the edges**: binds the on-behalf path, counts the match being voted on, never revoked.
- **Ordered picks with the points implied**: "first pick" in copy, never "3 points".
- **The vote's states and words**: none, open, closed; Rated and Not rated; man of the match kept as the term and crown as the count noun.
- **Plain mean over Rated matches** as the rating average handed to stats.
- **A voting record per Player**, "voted in 34 of 40".
- **One share link per match**, the match page URL, with Copy vote link and its results variant after close.
- **The migration delta from the floor accepted**: matches that closed with one or two ballots become Not rated, each named in the migration report.
- **A Not rated match shows turnout only**, no picks, no ratings, even to Managers.
- **Ballots of a Player who leaves or is unlinked stand**; a re-added Player's voided ballot stays voided.

### Declined, and why

- **A 0 to 10 or percentage scale.** Points per ballot is what every stored rating and every player's intuition already is.
- **Any ballot rates a match**, as today, or **a half-the-voters share.** One ballot crowning a Player is noise; half the voters is unreachable where most Players are unlinked.
- **Early close counting Linked Players only**, or **no early close.** The first shuts the door on a Manager still collecting picks from the chat; the second makes a four-player game wait three days for nothing.
- **Abstain.** A real thing at the pitch, but a fourth kind of ballot with its own rules; Close now covers the stuck vote and the reluctant voter is a turnout fact.
- **Per-side voting with two crowns**, or **opponents-only picks.** Ratings would stop being comparable across Formats.
- **A shrinking ballot under four Players.** One match in a hundred is not worth a second arithmetic.
- **A half crown on a tie.** A fraction nobody can explain at the pitch.
- **Weighting a Player's average by ballots cast.** Nobody can recompute it in their head.
- **A reopen act on a closed vote.** Un-complete and Complete is the visible, recorded path.
- **A Manager replacing a Player's own ballot.** The Player's word outranks the proxy's.
- **A per-voter vote link.** A credential pasted into a chat.
- **Grandfathering today's one- and two-ballot matches.** Two definitions of Rated forever; the report names each affected match instead.
- **A running tally for Managers.** Herding, and a temptation.

## Hand-offs to other sessions

- **Groups (2)**: applied to that document in this session: the "ballot on behalf" row of the role table gains Close now and Extend; the on-behalf mark is visible to the Player and to Managers and Group admins; ballots of a Player whose Membership ends stand.
- **Competitions (3)**: applied to that document in this session: closing on the last ballot sits on top of the deadline; team-format voting keeps the Pickup shape, so the switch means one thing; the competition page's read-only rules summary reads the same.
- **Seasons (4)**: applied to that document in this session: Close now and Extend are allowed on a Past season match whose vote is open; a voided ballot never arises in a Past season because its lineup cannot change.
- **Teams (5)** and **Knockout (7)**: nothing new; a Guest and each leg vote as settled there.
- **Matches (8)**: applied to that document in this session: the ballot survival recommendation is adopted with the voided-ballot notice; Close now and Extend join the change record; the vote's three states and their reasons on the match page; the match page hosts Copy vote link.
- **Stats (10)**: the rating as points per ballot, the three-ballot floor, Rated and Not rated, the plain mean over Rated matches, a full crown each on a tie, the results breakdown as derived per-match data, the voting record as a column, and the MVP rule for the Season summary; the average rating Draw sides balances on reads Rated matches only. Settled in `10-stats.md`: all read as settled; the MVP is the Qualified rating leader of a Pickup Season.
- **Notifications (11)**: the events a notification could hang on: vote opened, ballot voided by a lineup change, deadline extended, vote closed with results; which are sent, on which channel and by whose preference is that session's. The voided-ballot event is the one this session considers important enough to always show in-app. The reminder reads the deadline and the voters without a ballot; nothing here is a notification. Settled in `11-notifications.md`: only the reminder is sent, as the Vote reminder, once per Voter per match per Voting deadline so Extend may earn a second; a Voided ballot is shown in-app and caught by the same rule, never mailed on its own; vote opened, deadline extended and vote closed send nothing; Copy reminder text reads the Turnout.
- **Architecture (12)**: the ballot as the only stored fact, with voter, enterer, first-submitted and last-changed instants, and a voided mark or deletion on voiding; ratings, the floor, the crown, the breakdown, the turnout, the voting record and Your open votes derived on read or cached and invalidated on any ballot or lineup write; the deadline stored as an instant and Extend as an act in the change record; the last-ballot close evaluated in the same transaction as the ballot write; the deadline close as scheduled work outside the request process, idempotent, with a read-time "closed" that does not wait for it; secrecy enforced at the read boundary, never by the client; a Player's Minimum matches count read at submit. Settled in `12-architecture.md`: the ballot as a row with the voter, the acting Account, both instants, three pick columns and a voided instant, one unvoided ballot per voter per match by a partial unique index; ratings, the floor, the crown, the breakdown, the Turnout, the voting record and Your open votes derived on read by the engine, uncached; the deadline as an instant on the match with Extend in the change record; the last-ballot close evaluated in the ballot's own transaction; the deadline close as a pg-boss worker job that stamps the closed instant, with "closed" read as stamped or past the deadline so no reader waits; secrecy as two named reads and server-side aggregates; the Minimum matches count read at submit.
- **Frontend (13)**: the ballot on a phone: three ordered picks, tap-in-order or three slots; the match page's vote block in each state; the turnout list; the breakdown; Your open votes and its badge; Copy vote link; the Close now and Extend confirmations; the voided-ballot notice. Settled in `13-frontend.md`: tap-in-order picks in a full-screen ballot sheet opened from the red starburst, with the green box as the cast state; the turnout as name stickers with "Enter ballot" per row for Managers; the man of the match as a sticker card with a crown; Your open votes on the Group home and the You tab's badge; Copy vote link under the one Share control.
- **Data migration (15)**: every vote row becomes a pick on a ballot keyed by voter and match, three rows per ballot, with no enterer since today records none, submitted at the rows' creation instant; stored ratings and crown flags are dropped and re-derived; the report lists every match whose derived rating or crown differs from what was stored, including every match that closed with one or two ballots and becomes Not rated; the voting deadline of an open vote carries over as its instant; the per-voter vote link, the pending-votes page and the reminder lead are retired. Settled in `15-migration.md`: as stated, with a four-case mapping of the old status and deadline onto open, closed by the deadline and closed by the last ballot; 19 matches become Not rated and 21 stored ratings differ, no crown moving; a malformed ballot, of which the dump has none, would migrate voided.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Vote, Voter, Ballot, Pick, Entered on behalf, Replace, Voting deadline, Turnout, Close now, Extend, Voided ballot, Rating, Rated match, Not rated, Man of the match, Crown, Results breakdown, Your open votes, Voting record, Share link. "Voting threshold", "Eligible voter", "Voting gate", "runway", "pending votes", "voting status", "points" in copy and the per-voter vote link are retired.
