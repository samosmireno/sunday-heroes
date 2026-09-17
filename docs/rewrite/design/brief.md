# Sunday Heroes: design brief

Sunday Heroes is a members-only web app where a Group of friends runs football competitions, records matches and votes for the man of the match. Draw the screens below, phone first, in the retro sticker-album identity of the four attached mockups. The mockups fix the look; their structure is out of date.

## Visual language

- Paint every page on grass: flat green `#42af36`, pitch lines in `#f7f7f3` at partial opacity.
- Paper `#f7f7f3` for light panel bodies, ink `#000000` for text on them. Text on the light green is always ink.
- Greens: sidebar and dark panels `#07361c`, panel green `#0c542c`. Blues: panel blue `#3a3ab0`, navy rows `#091e40`, `#0d2e63`, `#28477a`, active row `#171775`. Reds: brand red `#ed1c24` for the active nav item and primary buttons, orange-red `#f93a07`, coral tags `#f55656`. Yellows: `#f4e937` for stars, `#faf15d` for the award panel with edge `#cec311`. Nav text `#d7e6cc`; muted `#bcc5ce`.
- Every competition has a Format: Pickup, League or Knockout. Show it as a skewed tag carrying the word, in its family: Pickup blue `#3a3ab0`, League green `#0c542c`, Knockout orange-red `#f93a07`. Yellow means an award.
- Team and side colours come from sixteen named colours: Red `#ed1c24`, Orange `#f93a07`, Yellow `#f4e937`, Green `#42af36`, Dark green `#0c542c`, Blue `#3a3ab0`, Navy `#091e40`, Black `#161616`, White `#f7f7f3`, Sky `#4fb3e8`, Purple `#7b3fb5`, Pink `#f06aa8`, Teal `#1a9e8f`, Maroon `#7a1f2b`, Brown `#7a4a1f`, Grey `#8c8f94`. In Pickup a side's colour is its name: a result reads "Red 4-3 Blue".
- Fonts: **Ultra** for slab panel titles (for Blackoak Std). **Archivo Narrow Bold** for numerals, band names, table names, ranks, nav items and match rows (for Arial Narrow and Galano Grotesque). The system sans for body, labels, buttons, column headers.
- Sizes, phone and desktop: body 16; slab title 20 and 28; band name 28 and 48; stat numeral 36 and 56; table cell 15; tag 12 uppercase; column header 13.
- Skews: stat blocks and the starburst 21.5° from vertical; every row and cell 15°. Never skew text.
- Every panel has a black offset shadow, 4 px on a phone and 8 px on a desktop, a left edge tab 8 and 12 px wide, and a 1 px ink stroke on every shape.
- Spacing: 16 px gutters and 12 px between panels on a phone, 24 px on a desktop, content max width 1400 px. One theme, no dark mode.

## Attached assets

The mockups are for the look only. `logo.svg`, the logo. `sticker-card.png`: keep frame, ribbon and name plate; photo and birth date go. `star-band.png`, `star-band.svg`, `star.svg`. `starburst-not-voted.png`, `starburst.svg`: the red starburst, now the "Vote now" callout; `starburst-voted.png`: the green box, now the "Ballot cast" state. `stat-blocks-row.png`: keep the shape, change the numbers. `button-add.png`: the red primary bar. `balls.png`: footballs for sign-in and empty states. `grass-tile.png`, `grass-noise.png`, `background-full.png`: the grass.

## Phone first

Draw every screen at 390 px wide, then at 1440 px. Below 1024 px the phone shell; from 1024 px the desktop shell. Panels stack in one column below 768 px, two above. Tap targets 44 px. Sheets with a sticky action bar replace dialogs on a phone.

## The shared frame

**Phone shell**: a top bar with the Group name and a chevron (the Group switcher) and the page title; a bottom tab bar **Home · Competitions · Players · You**. Players has Players | Teams sub-tabs. You is the Account home and carries a badge with the number of open votes.

**Desktop shell**: the mockup's 285 px dark green sidebar: logo; the Group name with a chevron; nav Home, Competitions, Players, Teams, Members, plus Activity record and Group settings for admins; a red **New competition** bar for admins; the green box with avatar and display name, opening Your open votes, Your career, Account settings, Sign out.

**The Group switcher** opens a sheet: the person's Groups with an open-votes badge and their nickname in each; pending invitations; Create a Group; "This Group" with Members, Activity record, Group settings.

**Roles**: a Member reads and votes; a Manager also records matches; a Group admin also creates competitions and changes settings. Every list has an empty sentence and, for a role that can act, the act. Loading is a skeleton in the panel's own shape. Warnings are yellow inline stickers with ink text; refusals are red.

**Paging**: one control, **Show more**, a paper bar button under a list with a skeleton row while the next page loads, gone on the last page. It appears only under lists that grow without bound: a competition's completed matches, a Player's match history, the Activity record, a match's Change record, past invitations. Every other list shows every row: the Players table in any scope, Standings, Records, the Season summary, Schedule and Bracket, Teams, Members, Competitions, the Player pool. No page numbers, no totals, no infinite scroll.

Never use: Dashboard, Home, Away, Pending Votes, Registered, Unregistered, Duel, fouls, Fun facts, Top Players, View all, Add new Competition.

## Screens, in drawing order

### 1. Sign in

The landing for anyone signed out. Logo on grass, the footballs, a Google button first, then email and password, forgot password, sign up. Siblings: Sign up (email, password, display name; ends on "check your email") and Verify email (the address and Resend). Errors never reveal whether an account exists. No marketing content.

### 2. Account home

Where a person with several Groups starts; also the You tab. Groups as rows with name, the person's nickname there or "no Player", an open-votes badge; pending invitations with Accept; Your open votes across Groups, each "closes Friday"; Your career; Account settings; Sign out. Empty: "Create a Group" and "Ask a friend for an invitation". A banner when mail to the person bounced. No stats.

### 3. Create a Group

Name; time zone, prefilled; default match format, prefilled "5-a-side"; an "I play too" switch, on, with a nickname prefilled from the display name; Create.

### 4. Group home

Top to bottom: **your Player**: the sticker card (nickname on the plate; the Google avatar in the frame, or for a Player nobody has linked a greyed silhouette with initials, the "missing sticker"; the ribbon reads "since Mar 2024"), the nickname band in the offset title style, the red starburst "Vote now" when the person has open votes here, four stat blocks Played · Win rate · Rating ("2.10 · 18") · Crowns, Form as five W/D/L stickers. Then **Active competitions**: rows with the Format tag, a leader line ("MVP so far: Ana, 2.31", "Leader: Red") and "12 matches this season". Then **latest results**: the last five matches as match rows, a crown and the man of the match where rated. States: a Member with no Player sees their display name, the missing sticker with "ask an admin to link you", no blocks; no competitions, an admin sees "Create your first competition", a Member "No competitions yet". Must not show: counting cards, Top Players, Fun facts, View all.

### 5. Competitions and New competition

Active competitions ordered by most recent result, each a row with name, Format tag and last result date; ended competitions below a heading; New competition for admins: name; Format as three sticker choices, each with a one-line description; voting on; match format prefilled; Managers picked from Members; Create.

### 6. Competition page, Pickup

A title band in the Format's family with name and tag; the Season selector as a skewed dropdown ("Season 3 · 2026/27 · since Mar 2026", All seasons last); the yellow **Season summary** panel: "MVP so far", top scorer, top assists, most matches, most crowns, "14 completed · 1 not played"; the MVP's sticker card; tabs **Matches · Players · Records · Rules**. Matches: to play above, completed newest first, not played apart, as match rows; the completed list ends in Show more, which in practice only All seasons reaches. Players: the table of screen 9 for this Season, every row, Qualified Players ranked and the rest greyed on rating and win rate. Records, on All seasons only: the yellow panel with biggest win, highest-scoring match, most goals in a match, each with a name and date. Rules: read-only lines for Format, usual match format, voting, voting period, Minimum matches, Award threshold, Managers. Managers see the red **Add match** bar; admins a gear. Empty: "Add the first match". Must not show: HOME and AWAY, the mockup's empty "Match results" and "Stats" shells.

### 7. Match form

Filled in at the pitch. One scrolling form with a sticky bottom bar: **Save**, and **Complete** in red once a score is present. Date; match format ("5-a-side"); two side colours, prefilled Red and Blue; two side columns headed by swatch and colour name, each Player a row with small goal, assist and own-goal counts once set, and "+ add"; above the columns **Draw sides** and **Copy last lineup**; two big numeral score cells with an attribution line beneath each ("2 unattributed" as a yellow sticker); a formation picker per side ("1-2-1"); video link and note. Also draw the **picker sheet** ("+ add": the Group's whole pool under two headings, **Played this Season** and **Everyone else**, each most recent first, so a pool of 63 reads as about twenty names with the rest below; search over both; "+ new nickname"; multi-select; Done; no paging) and the **row sheet** (tap a name: steppers for goals, assists, own goals; move to the other side; move up or down; remove). States: yellow stickers for a short side, an uneven side, a possible duplicate; a red sticker for a refusal; a banner when someone else saved meanwhile, with the changed cells flagged. Must not show: a wizard, drag handles on a phone, HOME and AWAY.

### 8. Match page and the vote

The page a shared link opens. The result line "Red 4-3 Blue" with swatches, the Format tag, the date; per side a half-pitch drawn with shirts in the side colour in the formation, nickname and small goal and assist marks on each, the bench beneath; video link; note; "Recorded by Ana"; a **Share** button; for Managers an overflow menu (Edit, Un-complete, Delete, Close now, Extend, Change record). The **vote block** at the top in four states: _none_, "voting is off for this match"; _open_, "closes Friday", the turnout as name stickers (voted in colour, not voted greyed), the starburst "Vote now" for a viewer who has not voted, the green box "Ballot cast · See your ballot" plus "Change ballot" for one who has, "Copy reminder text", and for a Manager "Enter ballot" beside each name still waiting; _rated_, the man of the match as a sticker card with a crown and a breakdown table of rating, points, firsts, seconds, thirds beside "12 ballots"; _not rated_, "Not rated, 2 of 12 ballots" and the turnout only. Also draw the **ballot sheet**: every Player of the match in both colours, tapped in order for first, second and third with a numbered star, the viewer's own row greyed, "Cast ballot" enabled at three; the on-behalf variant titled with the Player's name; and the one-time prompt after casting, "Remind me by email before a vote closes?" with Yes and Not now. Must not show: anyone's picks, a running tally, Pending Votes.

### 9. Players page

The Group's leaderboard, the mockup's table with the name cell pinned as the skewed parallelogram and the numerals scrolling sideways; columns Player, played, W, D, L, win rate, goals, assists, own goals, rating with its count, crowns; preset chips above: Overview, Scoring, Voting, All; filters by competition and Format; search; a linked mark for Players with an account; "+ New Player" for Managers; Share (copy as text, export CSV, always the whole scope). Every Player is a row; the table is never paged. Must not show: a Status column, Unregistered, "Played with" and "Managed" toggles.

### 10. Player page

One Player's career in the Group. Header with nickname, linked or not, first and last match dates; the hero sticker card; six stat blocks Played · W-D-L · Goals · Assists · Rating · Crowns; Form and a rating chart over time; a breakdown table by competition with Season sub-rows; streaks, clean sheets, attendance, "scored in 12 of 30", "voted in 34 of 40"; **Played with** and **Played against** as the mockup's Top teammates cards ("9 matches · 3W-2D-4L · 33%"); best matches; Honours in the yellow panel ("MVP, Season 2"); the match history last on the page, newest first with result, goals, assists, rating, a crown mark, fifty at a time under Show more. Must not show: a birth date, a photo, "Performance history", page numbers.

## Later screens, by name

Members and invitations, with past invitations under Show more; join-link "who are you"; invitation accept; not a member. Teams; Roster setup; League page (Standings, Schedule); Fixture form; Knockout page (bracket as a list by Round on a phone); Team page. Competition settings with Seasons; Start new season and End confirmations; Activity record, under Show more; Group settings; Account settings; Your career; Operator; mail templates.
