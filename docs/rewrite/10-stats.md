# Player stats and views

_Branch session 10, 2026-09-15. Output of the eleventh `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md`, `02-groups.md`, `03-competitions.md`, `04-seasons.md`, `05-teams.md`, `06-league.md`, `07-knockout.md`, `08-matches.md` and `09-voting.md` as settled; settles the open questions under area 10 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

Let players see what they have done. Every number in this session is a read over Completed matches and closed votes: nothing is stored, nothing is counted as it happens, and a Correction or a Player merge changes history because the history is recomputed. This session settles what a career is and where it stops, one arithmetic for win rate and one for who is qualified for an award, the columns of the player table and where that table appears, the Player page with its rating history, form, streaks and honours, the Team page's list, the Group's home screen, and the small acts that carry a table into the group chat.

## Decisions carried in from the map

- All current player stats survive and gain a rating history over time. Everything is Group-scoped, never public.
- A draw counts as a draw everywhere; a Shoot-out win is a win and the other side's loss for the Team's record and every Player's.
- Completed match is the unit that counts; a Not played match counts in nothing.
- An Account may claim one Player per Group; the Player is the Group-level identity.
- From the voting session: the rating is points per ballot cast, 0.00 to 3.00; a closed vote below three ballots leaves the match Not rated; a Player's average rating is the plain mean over the Rated matches they played in; a full crown each on a tie; the results breakdown is derived per-match data; the voting record is a stat; the average rating that Draw sides and Draw teams balance on reads Rated matches only.
- From the matches session: a bench row played; own goals are a per-Player fact counting for the opponents; an unattributed goal is in a side's total and nobody's; a clean sheet, if wanted, is a fact of a side that conceded nothing, never of a keeper; there is no positional stat.
- From the League and Knockout sessions: a Walkover counts in a Team's record and in nothing of any Player; Form is an Entry's last five Completed matches; a withdrawn Entry's results count everywhere; the Champion, the Winner, the Runner-up, an Entry's Result, the All seasons Standings and the All seasons record are those sessions'; drawn matches in a Knockout come only from first legs.
- From the teams session: a Team page exists, keyed on the Team across competitions, with guest appearances apart; the "team" column of a team-format player table reads the Entry's roster.
- From the seasons session: the Season summary is derived and reads "so far" on the Current season, with a Pickup MVP defined here; per-Season and All seasons player tables follow the selector.
- From the competitions session: substitutes count as having played; Ended competitions count in every total; the competition page shows a read-only rules summary.
- From the groups session: the pool is per Group, so a per-Group career is the natural unit; a merge changes history retroactively by design; the Players page has the stats.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Win rate is wins plus 0.3 per draw over matches, as a percentage**, in one helper with a bare constant and no note on where 0.3 came from. The glossary says a level score settled on penalties is a win or a loss; every career query treats it as a draw. Nothing anchors the number.
- **The per-competition table counts uncompleted matches in Pickup** and only Completed ones in League; the career page's top matches read uncompleted matches too. The home page's "Completed matches" card counts matches that have a date.
- **Average rating has two denominators.** The per-competition table divides by the matches in which somebody's stored rating is above zero; the career page averages every stored rating, zeros from voteless matches included, so the two disagree for the same Player.
- **The career page unions every Player an Account has claimed across every dashboard**, keyed on the Account, while the per-competition table keys on the nickname string; the two cannot agree once a Player is renamed.
- **The career page shows** totals, W-D-L, win rate, goal and assist consistency as the share of matches with at least one, recent form as the last five results, top matches as one match each for goals, assists and rating with ties broken by recency, top competitions as one competition each for the same three, top five teammates by matches on the same side with the record together, and a per-competition breakdown.
- **The League table shows the Team from the Player's first match** in the selection, so a Player who changed teams is filed under the old one; a Top performers strip above it names one scorer, one assister and one rated Player, ties to the earlier row.
- **A "min. matches" filter exists on the Pickup table only**: the viewer picks 20 to 100 percent of the selection's matches, ceiling and inclusive since fix f13d98f, client-side, blank by default.
- **The home page has four counting cards**: competitions, distinct players, pending votes, and dated matches called completed.
- **No leaderboard, badge or streak exists.**

## The model

### Career and scope

A Player's **career** is everything that Player did in its Group: every Completed match across every competition and Season, Ended competitions included. It is read on the **Player page**. Nothing pools across Groups inside a Group, because a Member of one Group can never see another's matches.

**Your career** is the one across-Groups view, private to the Account: one row per Group in which the Account has a Linked Player, the nickname there and the core columns below, and a total line pooling the rows, its average rating the plain mean over every Rated match across Groups. A Group whose Membership ended drops out, since the link ended with it. Nobody in any Group sees it; it is the Account's own page, reached from the Account's home.

Scopes, from narrowest to widest, every one the same table:

| Scope                               | Where                                    | Award threshold applies |
| ----------------------------------- | ---------------------------------------- | ----------------------- |
| One competition, one Season         | competition page, the selector's default | yes                     |
| One competition, All seasons        | competition page, the selector's option  | no                      |
| The Group, every competition pooled | the Players page, filterable by Format   | no                      |
| One Player, every competition       | the Player page's summary and breakdown  | no                      |
| One Account, every Group            | Your career                              | no                      |

### The arithmetic

**Played** is the count of the Player's lineup rows in Completed matches. A Walkover has no lineup and a Not played match counts in nothing, so neither is visible to any Player's number; a bench row is played.

**W, D, L** read the two scores, with a Shoot-out deciding a level Deciding match. A level score anywhere else is a draw.

**Win rate** is the points share: `(3 × W + D) / (3 × played)`, shown as a percentage with the W-D-L record beside it wherever it appears. A draw is worth a third of a win because that is the League's own arithmetic, and nothing else. It replaces the 0.3 of today, which was an approximation of this with no source.

**Average rating** is the plain mean of the Player's ratings over the Rated matches they played in, two decimals, always shown with the count it rests on: "2.10 over 18". A 0.00 in a Rated match counts; a Not rated match, a match with no vote and a Walkover count in nothing rating-wise. A Player with no Rated match shows "–".

**Crowns** count Rated matches only, one per holder per match, a full crown each on a tie.

**Clean sheet**: a fact of a side that conceded nothing; every Player in that side's lineup has one for that match. A side is credited with the goals its own Players scored plus the opponents' own goals and the unattributed remainder, which is to say its score; a clean sheet is a score of zero against, and nothing about a keeper.

**Attendance**, Pickup only: the Player's played matches over the Completed matches of the scope, "played 34 of 40". In a team format it is a roster question and the Team page may take it up later.

**Own goals** are summed from lineup rows and never count as goals. **Goals per match**, **assists per match** and **contributions**, goals plus assists, are derived from the columns beside them. **Goal consistency** and **assist consistency** are the share of the Player's played matches with at least one goal, or one assist: "scored in 12 of 30".

### The player table

One table, in every scope, with these **default columns**: Player, played, W, D, L, win rate, goals, assists, own goals, average rating with its count, crowns. Behind a "more columns" toggle: goals per match, assists per match, contributions, clean sheets, attendance (Pickup only), Form (below), voting record. In a team format a **team** column joins the defaults: the Team whose roster holds the Player in that Season, or "Guest" for a Player who only guested; every appearance, roster or guest, counts fully in the Player's own row, and a Player is one row, never split by Team.

Every column sorts. The table is the same component on the competition page, where it follows the Season selector, and on the **Players page**, which is the Group-wide table pooled across every competition and Season with a filter by competition and by Format. There is no separate leaderboard screen: the Players page is the Group's leaderboard. A viewer may switch on a filter, "played at least N% of the scope's matches", off by default, which is today's filter kept as a courtesy in the scopes where no Award threshold applies.

Archived Players stay in every table they earned a row in.

### Award threshold and Qualified

Sorting a Season by win rate or average rating puts a Player with two matches at 3.00 on top, and a Season's MVP cannot be that Player. The **Award threshold** is a competition setting, shown in the read-only rules summary, that says who is **Qualified** for a Season's awards: a Player who has played at least a share of the matches they could have played in that Season.

- **Value**: a percentage, default 50% for every Format, editable by a Group admin.
- **Denominator in Pickup**: the Season's Completed matches.
- **Denominator in a team format**: the Completed matches of the Player's own Entry in that Season, since that is every match a roster Player could have played. A Player who only guested is measured against the Entry they guested for most.
- **Floor**: 3 matches, or the largest count any Player in the Season has when that is below 3, so a small cup still qualifies someone.
- **Rounding**: ceiling, inclusive, so 50% of 7 is 4 and a Player on exactly the threshold is Qualified.

It is a Season rule, not a fact of a match. It decides the Season's MVP, the Season summary lines that rest on a rate, the Honours read from a Past season and the Records that name a Season's best average; the Season's player table marks Qualified Players and sorts the rest below on rate columns, greyed. A change governs the Current season and every "so far" line at once; **a Past season keeps the value in force when it closed**, so nothing derived from it shifts later. The Seasons list on the settings screen shows each Season's value, and the Start new season confirmation is where an admin reviews it for the Season about to open.

All seasons and pooled scopes have no awards, so they have no Qualified mark: any column sorts as is, and the viewer's own filter is all there is.

### The Pickup MVP

The Season summary's leader line in Pickup is the **MVP**: the Qualified Player with the highest average rating in the Season, ties shared, reading "MVP so far" on the Current season. Most crowns is its own summary line, so the MVP is the rating leader and not a second crown count. A Season with no Qualified Player, or no Rated match, has no MVP and the line says so.

### Form, rating history and streaks

**Form**, the League session's term extended to Players: the Player's last five Completed matches in the scope, by match date then recording order, oldest to newest, as W, D or L; beside it the average of their last five ratings over Rated matches. A hidden column and a Player page line.

**Rating history** is the map's one new stat, in three shapes on the Player page: a per-match series across every competition of the Group by date, each Rated match a point with a rolling average over the last 10 Rated matches drawn through it, filterable to one competition; per-Season averages in the breakdown table; and Form's five-match average.

A **streak** is a run over the Player's Completed matches ordered by match date then recording order, crossing Seasons because a Season boundary is an admin act rather than a football fact. On a competition page it runs within that competition; on the Player page across every competition of the Group. A Not played match, a Walkover and a match the Player did not play are invisible to it, so absence never breaks a streak. Four kinds, each with a current and a longest value: **win streak**, **unbeaten run** (no loss), **scoring streak** (a goal in every match) and **crown streak** (a crown in every Rated match, Not rated matches skipped). "Current" is the run ending at the Player's latest match.

### Played with and played against

Pickup only, on the Player page, since sides change every match: **played with**, the top teammates by matches on the same side with the record together and the win rate; **played against**, the top opponents by matches on opposite sides with the record against. In a team format "played with" is the roster and "against" is the Standings, and the Team page answers both. No pairwise picker of two Players; it would be the same data on a screen nobody asked for.

### Records and honours

**Records** is a section on the competition page's All seasons view, per competition and never Group-wide because "biggest win" across a five-a-side Pickup and an eleven-a-side cup is not one record. Each names the Player or match and the date, ties shared: biggest win by margin, highest-scoring match, most goals by a Player in a match, most assists in a match, highest rating in a match, best Qualified average rating in a Season, most crowns in a Season, longest win streak, longest unbeaten run, longest scoring streak.

**Honours** is a section on the Player page, read from the Season summaries of Past seasons: MVP, top scorer, top assists and most crowns per Season, ties shared exactly as the summary shares them; and **titles**, a Past League Season won or a Knockout Season won by an Entry the Player made at least one roster appearance for. One roster appearance is the bar: a Player who played once for the champions was on the champions, a Guest was not, which is what the guest mark is for. Nothing is stored; a Correction that changes a Past season's top scorer changes the honour.

### The Player page

The page a nickname opens anywhere in the Group, Members only, everything derived, top to bottom:

- header: nickname, linked or unlinked, the archived mark, first and last match dates;
- a summary strip of the default columns across the career;
- Form and the rating history chart, filterable to one competition;
- a breakdown table with a row per competition and a sub-row per Season, All seasons rolling each up;
- Teams played for, from roster appearances, with guest appearances apart: "also guested for Blue, 2 matches";
- streaks, clean sheets, attendance, own goals, goal and assist consistency, the voting record;
- played with and played against, in Pickup;
- **best matches**, the Player's top five by rating;
- Honours;
- the match history: every Completed match newest first with the result, goals, assists, the rating or "Not rated" or "no vote", and a crown mark, filterable by competition.

Today's "top competitions" is replaced by the breakdown table; today's "top matches" by the best matches list and the Records section.

### The Team page

As the teams session placed it, with the list settled here: header with colour and name; a section per competition entered, each Entry by Season with its roster, the final position or the Knockout Result, the record (played, won, drawn, lost, goals for and against) and Form; totals across everything in the same record columns; **titles** (League Seasons as Champion, Knockout Seasons as Winner) and **finals** (Winner or Runner-up); most appearances, top scorers, top assists and best average rating for the Team over roster appearances, with guest appearances in a separate list. Walkovers count in the record and in nothing per Player. "Played for" on a Player page and "appearances" on a Team page mean roster appearances; a guest appearance is listed apart on both.

### The balance for Draw sides and Draw teams

Both helpers balance by average rating, and this is the formula: a Player's balancing rating is their average over their **last 10 Rated matches in the Group, any competition**, so a fresh competition can still balance; a Player with no Rated match takes the median of the Players being drawn; the helper deals sides to minimise the difference in summed rating and shows each side's sum to the Manager before Save.

### The Group home

The screen a Group opens on, replacing today's four counting cards:

- **Your open votes** in this Group, with deadlines;
- **your Player**: played, Form, average rating, current streak; or "link your Player" when the Member has none;
- **Active competitions**, each with its Season summary's leader line so far;
- **latest results**: the last five Completed matches across competitions, with the crown once Rated.

The Account's home above it lists Groups, pending invitations, the open-votes badge across Groups and Your career, as the groups and voting sessions placed them; the frontend session owns the look. Settled in `13-frontend.md`: the Group home's top row is your Player as a sticker card, a nickname band, the vote callout and four stat blocks; the Account home is the You tab on a phone and the Account menu on a desktop.

### Copy and export

Two acts on every table, the Season summary and the Records section: **Copy as text** produces a plain-text block for the group chat, the same habit the vote share link serves; **Export CSV** produces one file of the visible scope and columns. Both are reads.

### Roles

Every Member reads every table, page and section here; nothing is hidden by role. A Group admin sets the Award threshold. Nothing is written by anyone: the one write in this session is a competition setting.

## Scenarios that shaped the model

- **Two matches at 3.00.** Marko played twice this Season, both Rated, both crowns. He tops nothing: below the threshold he sorts under the Qualified Players, greyed, and the MVP line names Ana on 2.31 over 19.
- **The eight-team League.** Twenty-eight matches, seven per Entry; 50% of an Entry's seven is four, so a roster Player with four appearances is Qualified and a Guest with two is not.
- **The four-team cup.** The Winner played two matches; nobody has three, so the floor drops to two and the Final's players are Qualified.
- **A draw every week.** Ten matches, ten draws: a 33% win rate and a 0-10-0 record beside it, so nobody wonders where the draws went.
- **Threshold changed in March.** The admin moves it to 40%; this Season's Qualified marks and "MVP so far" change at once; last Season's MVP does not.
- **A streak across the rollover.** Won the last three of Season 2 and the first two of Season 3: a five-match win streak, and a Record if it is the longest.
- **The one-off guest for Blue.** Ana's two guest matches count in her own row and her career; on her page they read "also guested for Blue, 2 matches" and on Blue's page they sit under guest appearances, not among Blue's appearances.
- **Champions with one appearance.** Luka played once for Red, on Red's roster, in the Season Red won: a title in his Honours. His brother, a Guest that day, has none.
- **A Correction two seasons on.** A Group admin fixes a scorer on a Past season match; the Season's top scorer line, the Player's Honours and the competition's Records all re-derive, because none of them was stored.
- **Two Groups, one Account.** Marko in the Tuesday Group and Marko K in the Sunday Group: two Player pages, two careers, and one private Your career with two rows and a total.
- **The busiest man's attendance.** "Played 38 of 40" on the Pickup table, the number the Manager wanted when deciding who is a regular.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Career per Group**, the Player page as the career, plus a private **Your career** across the Account's Groups with per-Group rows and a total line.
- **Win rate as the points share**, `(3W + D) / (3 × played)`, named Win rate, shown as a percentage with W-D-L beside it.
- **The default column set** with own goals in it and the rest behind a toggle; played as lineup rows in Completed matches.
- **One team column** in team formats reading the roster, "Guest" for a Player who only guested, one row per Player; played for on the Player page from roster appearances, guest appearances apart.
- **Clean sheets** as a side fact for every Format, a Player page stat and a hidden column.
- **The Players page as the Group-wide table** and the Group's leaderboard; no separate leaderboard screen.
- **Award threshold**: a competition setting, 50% by default for every Format, of the Season's matches in Pickup and of the Entry's matches in a team format, floor of 3, Season-scoped, Past seasons keeping the value they closed under; no Qualified mark on All seasons or pooled scopes, where the viewer's optional filter remains.
- **The Pickup MVP** as the Qualified rating leader, ties shared, "so far" on the Current season.
- **Rating history in three shapes**: per-match series with a rolling average, per-Season averages, and Form extended to Players.
- **Streaks as derived stats, no badges**: win, unbeaten, scoring and crown streaks, current and longest, crossing Seasons.
- **Played with and played against**, Pickup only.
- **Attendance**, Pickup only.
- **The Team page list** as stated, with titles and finals.
- **The balance formula**: last 10 Rated matches Group-wide, median for the unrated, minimised difference of sums.
- **The Player page composition**, with the breakdown table replacing top competitions and best matches replacing top matches.
- **Consistency rates kept** as Player page lines, per-match rates as hidden columns.
- **Records**, per competition on the All seasons view, the ten listed.
- **Honours** on the Player page, with a title through one roster appearance.
- **The Group home**: open votes, your Player, Active competitions with their leader lines, latest results; the counting cards go.
- **Copy as text and Export CSV** on every table, the Season summary and Records.
- **Contributions** as a hidden column.

### Declined, and why

- **A career across Groups as the career**, or **pooled stats across Groups visible in a Group.** Members only forbids the second and the first pools circles that never played each other; Your career is the private compromise.
- **Wins over played** as win rate, **half a win per draw**, or **keeping 0.3.** The user chose the League's own arithmetic; 0.3 was an approximation of it with no source.
- **"Points per match" or "Points share"** as the name. The map kept Win rate and a percentage is what today's users read.
- **One row per Player per Team** for guest appearances. A player table lists people; the Team page splits appearances.
- **A fixed minimum of matches** as the qualification, or **none**. A fixed count has to be re-set every Season; no rule crowns a two-match Player. **A share of the busiest Player's matches** was the interim proposal and was replaced by the Award threshold on the Season's, or the Entry's, matches.
- **A Group-level default Award threshold.** A fourth Group setting is ceremony until someone asks; every competition starts at 50%.
- **MVP by crowns.** Crowns reward attendance as much as play and already have their own summary line.
- **Badges** awarded at Season close. Stored awards contradict "nothing stored", and the Season summary of every Past season is the honours board.
- **A pairwise Player picker**, **played with and against in team formats**, and **side-by-side Player comparison.** The Team page and the Standings answer them; the rest is the same data on a screen nobody asked for.
- **Attendance in team formats.** A roster question for the Team page, later.
- **Group-wide Records.** "Biggest win" across Formats and match formats is not one record.
- **Streaks within a Season only.** A rollover is not a football fact.
- **Dropping consistency rates**, or **promoting them to columns.** A hat-trick once and a goal every week are different players, but nobody sorts by it.
- **The League Top performers strip.** The Season summary names the same people.
- **Crown share**, crowns over played. Both numbers are on the row.
- **A date-range filter** on tables. Seasons are the time boundary.
- **A balance over the competition's own history only**, or **the all-time average.** A new competition could not balance; three-year-old form is not form.

## Hand-offs to other sessions

- **Groups (2)**: applied to that document in this session: the Account's home carries Your career and a Group opens on the Group home; the Players page is the Group-wide table with the default columns, pooled across competitions, filterable by Format; no stats on the Members list, as that session said; a merge or a rename re-derives every number here.
- **Competitions (3)**: applied to that document in this session: Award threshold joins the settings table, every Format, 50% by default, editable by a Group admin, in the rules summary; it is a Season rule rather than a fact of a match, so "applies forward" means the Current season and later.
- **Seasons (4)**: applied to that document in this session: the Pickup MVP is the Qualified rating leader; a Past season keeps the Award threshold it closed under and the Seasons list shows it; the Start new season confirmation shows the value for the Season about to open.
- **Teams (5)**: applied to that document in this session: the Team page list; "played for" and "appearances" mean roster appearances; the balance formula for Draw teams.
- **League (6)** and **Knockout (7)**: nothing new; their records, Form, Champion, Winner, Result and pooled tables stand as they are and feed titles and finals.
- **Matches (8)**: applied to that document in this session: clean sheet exists as a side fact; own goals are a default column; the balance formula for Draw sides.
- **Voting (9)**: applied to that document in this session: the MVP rule is noted where that session left it; the rating, the floor, the plain mean, the crown, the breakdown and the voting record are read here exactly as settled there.
- **Notifications (11)**: nothing here notifies; a "Season summary at close" message, if that session wants one, reads the summary and the Honours as derived. Settled in `11-notifications.md`: declined; Copy as text is the message.
- **Architecture (12)**: every table, page, summary, Record and Honour derived on read from Completed matches and closed votes, or cached and invalidated on any match, lineup, ballot, roster, Season or settings write; the Award threshold stored on the competition with its history so a Past season resolves the value in force at its close; Qualified evaluated per Season with the Pickup and Entry denominators; streaks and Records as ordered reads by match date then recording order; Your career as an Account-scoped read across Memberships enforced at the boundary; CSV and text serialisation of a table's visible scope; the last-10 balance read at Draw time. Settled in `12-architecture.md`: every table, page, summary, Record and Honour as pure engine functions on read, no cache in the first release (ADR 0002); the Award threshold stamped on the Season at close; Qualified evaluated by the engine with both denominators; streaks and Records as ordered reads by match date then recording order; Your career as an `account` tier read across Memberships; Export CSV as a plain HTTP route and Copy as text as a client serialisation of the same rows; the last-10 balance as a read at Draw time.
- **Frontend (13)**: the one table component with its scopes, the column toggle, the Qualified mark and greyed rows, the optional percentage filter; the Player page and its chart; the Team page; Records and Honours; the Group home; Copy as text and Export CSV; how "2.10 over 18" and "–" read on a phone. Settled in `13-frontend.md`: the table pins the name cell and scrolls the numerals with column presets on a phone; the Player page's strip is six stat blocks and the chart a hand-drawn SVG line; Records and Honours are the yellow award panel; the Group home's top row is the mockup's, re-purposed as your Player; "2.10 · 18" in blocks and "2.10 over 18" in prose; Copy as text and Export CSV under the one Share control.
- **Data migration (15)**: nothing stored here migrates; every stat re-derives from migrated matches, lineups and ballots; the stored win rate constant, stored ratings, stored crown flags and the union-by-Account career are retired; every migrated competition receives the default Award threshold of 50%, and migrated Past seasons resolve to it.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Career, Your career, Player page, Players page, Win rate, Award threshold, Qualified, MVP, Form (extended to Players), Rating history, Streak, Clean sheet, Attendance, Played with, Played against, Best matches, Records, Honours, Title, Group home, Copy as text, Export CSV. "Win percentage", "leaderboard" as a screen, "top performers", "top competitions", "hall of fame", "badge" and "achievement" are retired; "MVP" is the Pickup Season leader and nothing else.
