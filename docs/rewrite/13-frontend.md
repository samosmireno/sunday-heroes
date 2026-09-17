# Frontend and design

_Branch session 13, 2026-09-16. Output of the fourteenth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md` through `11-notifications.md` and `12-architecture.md` as settled; takes the designer's rebrand, extracted in `design/mockup-extract.md`, as the visual language; settles the open questions under area 13 of the map and records the proposals put to the user, accepted and declined. `design/brief.md` is the self-contained brief for drawing the screens. Nothing here is code._

## Purpose

The screens people use, on a phone first and on a large screen properly. The domain sessions defined every fact, act and derived number; this session decides what each one looks like, where it lives, how a thumb reaches it and what the app says when there is nothing to show. It has two inputs the map did not: a settled visual language, delivered by a designer as a PSD and extracted to values and assets, and a settled architecture, which fixes the router, the data layer and the contract the screens read. The output is a screen inventory drawn from the branch documents, a design language that names every recurring element with its tokens and its phone form, the match form and the vote as the two screens that matter most, and the order in which the remaining screens are drawn.

## Decisions carried in

- Mobile-first web app with a large-screen layout, English only, members only (map).
- From `12-architecture.md`: a Vite React SPA on TanStack Router with the Group and the Season number as typed path params; TanStack Query through tRPC; `domain`'s value rules and completion checks for form warnings; the `version` sent with every save and a reload on `CONFLICT`; the refusal `reason` enum as the key of the copy table; the build-id reload; same origin, which makes a PWA and its install prompt trivial later; UUIDv7 ids minted by the client on every create; the seed script as the fixture for screenshots.
- From `02-groups.md`: the Group name at the top of every in-Group screen is the switcher; the Account's home lists Groups and pending invitations; a Group opens on the Group home; every in-Group link carries the Group.
- From `10-stats.md`: the Group home is Your open votes, your Player, Active competitions with their leader lines, and the latest results; the four counting cards are gone; the Players page is the Group's leaderboard and there is no other; one player table in every scope.
- From `09-voting.md`: the vote lives on the match page, which is the share link's target; the ballot is three ordered picks; the turnout is visible and the ballot secret; the two starburst states of the mockup map onto a Voter without a ballot and a ballot cast.
- From `08-matches.md`: one form with Save and Complete for every Format; the pickers per Format; counters beside names; the pitch drawn from a formation with a bench.
- From `11-notifications.md`: no inbox; the Reminder prompt on the first ballot; the delivery-problem banner; "not delivered" with Resend; the PWA install prompt is this session's.
- Retired vocabulary the mockup still uses, from the sessions that retired it: Dashboard, Home and Away in Pickup, Pending Votes, Registered and Unregistered, Duel, Add new Competition as the act's name, fouls.

## What the rebrand gives, as evidence

Facts from `design/mockup-extract.md` and from this session's own look at the PSD. The visual language is decided; the mockup's structure is evidence only, because it was drawn against today's app before the branch sessions.

- **A retro sticker-album identity**: grass with pitch lines, a dark green sidebar, parallelogram stat blocks and table cells, star bands, a Panini-style player sticker card, a slab-serif panel title, a red starburst callout, black offset shadows on every panel.
- **Four screens at 1920 px and nothing narrower**: a home page with a welcome band, four counting cards, a Competitions panel, a Top Players panel, Latest Matches and a "Fun facts" placeholder; a Players table with a Status column reading "Unregistered" and "Played with" and "Managed" toggles; a Player page with six stat blocks, Top teammates and Performance history; a competition page that is an empty shell.
- **Every shape is a solid-colour vector with a 1 px black stroke and no layer effects**; the offset shadows are duplicate black shapes. Checked in this session with psd-tools: the logo's boxes and stars, the star band and the starburst export to SVG pixel-faithfully. The logo's S and H are live Blackoak text and are the one thing a path export cannot carry.
- **Three commercial fonts are not in the file**: Blackoak Std (Adobe Fonts) on panel titles and the logo letters, Galano Grotesque Alt on match rows only, Druk on one hidden wordmark.
- **The hidden layers** hold the second starburst state, a green box reading "Thank you for voting / See your vote", and a row of yellow footballs used as decoration.

## What today does, as evidence

- A flat React Router v6 tree with an auth-only guard and one real role gate; a sidebar that becomes a sheet behind a hamburger on a phone; gold, green and blue per format applied by class switching; Courier headings; no theme system, no i18n, no PWA, no offline behaviour.
- Shadcn/UI over Radix, TanStack Table, dnd-kit for the lineup order, a pitch view that draws one of five hard-coded formations and forgets the choice, sonner toasts, a landing page for a product with no public face.
- A per-voter vote link, a pending-votes page and a home page counting dated matches as completed: all retired by the voting and stats sessions.

## The model

### The design language

Every recurring element, its tokens and its phone form. Tokens are CSS variables; the values come from the extract and are not re-derived here.

**Colour roles.** Sidebar and dark panel green `#07361c`; panel green `#0c542c`; light green `#42af36` (also the flat grass layer); mid green `#359560`; panel blue `#3a3ab0`; navy `#091e40` with `#0d2e63` and `#28477a` for row stripes and `#071349` for panel edges, `#171775` for an active row; orange-red `#f93a07`; brand red `#ed1c24` with `#e72b2b`, `#c22900` for skew shadows and coral `#f55656` for tags; yellow `#f4e937` with `#faf15d` for the award panel and `#cec311` for its edge; off-white paper `#f7f7f3`; nav text `#d7e6cc`; muted `#bcc5ce` and `#c7bebe`; ink `#000000`, `#161616`, `#212020`. Body text is ink on paper; text on the light green is ink, never paper, for contrast.

**Format families.** A Format is distinguishable everywhere by its family on the Format tag and the competition page's title band: Pickup blue `#3a3ab0`, League green `#0c542c`, Knockout orange-red `#f93a07`. The tag always carries the word, so colour never stands alone. Yellow is the award family: stars, crowns, the Season summary, Records, Honours.

**The side palette.** Sixteen named colours for Teams and Pickup sides; the name is the side's label in Pickup, "Red 4-3 Blue". Red `#ed1c24`, Orange `#f93a07`, Yellow `#f4e937`, Green `#42af36`, Dark green `#0c542c`, Blue `#3a3ab0`, Navy `#091e40`, Black `#161616`, White `#f7f7f3`, Sky `#4fb3e8`, Purple `#7b3fb5`, Pink `#f06aa8`, Teal `#1a9e8f`, Maroon `#7a1f2b`, Brown `#7a4a1f`, Grey `#8c8f94`. A first Pickup match is prefilled Red and Blue. Text on a swatch is ink or paper by contrast.

**Fonts.** Two self-hosted open fonts and the system stack: **Ultra** for slab panel titles, the Blackoak substitute; **Archivo Narrow** in bold for numerals, band names, table names, ranks, nav items and match rows, replacing both Arial Narrow and Galano; the system sans stack (Arial, Roboto, San Francisco) for body copy, labels, buttons and column headers. Druk is dropped with the hidden wordmark; the logo is outlined vectors and needs no font. Adobe Fonts was declined: the brand must not depend on a subscription.

**Type scale.** Body 16 px. Slab panel title 20 px on a phone, 28 px on a desktop. Band name 28 and 48. Stat-block numeral 36 and 56. Table cell 15. Tag 12 uppercase. Column header 13. Nav item 22 on a desktop.

**Skews.** Two tokens: `--skew-strong: 21.5deg` for stat blocks and the starburst's tilt; `--skew: 15deg` for every row and cell. Parallelograms are `clip-path` polygons so text never skews.

**Shadows and edges.** The black offset shadow is 4 px on a phone, 8 px on a desktop, down and right. A panel's edge tab is 8 and 12 px wide, black on paper and paper on dark. Every shape keeps a 1 px ink stroke.

**Spacing and breakpoints.** 16 px side gutters and 12 px between panels on a phone; 24 px on a desktop; content max width 1400 px. Two layouts: below 1024 px the phone shell, from 1024 px the sidebar shell. Panels stack in one column below 768 px and two above.

The elements:

| Element                | Desktop                                                                                                                            | Phone                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grass**              | The flat green under the noise tile, pitch lines in paper at partial opacity, one fixed cover background, centre circle top-right  | The same image, cover-fitted, so a curve of pitch line always shows; nothing is dropped                                                                               |
| **Sidebar**            | 285 px, `#07361c`, 1 px light edge: logo, Group switcher, nav, red New competition bar for admins, green Account box at the bottom | Replaced by the top bar and the bottom tab bar of the shell                                                                                                           |
| **Panel**              | Slab or condensed title bar with the edge tab, a paper or dark body, the offset shadow                                             | Full width, 20 px title, 8 px tab, 4 px shadow                                                                                                                        |
| **Star band**          | 43 px, yellow stars on panel green, or red stars on light yellow on Player and competition pages                                   | 24 px, 12 px stars, fewer of them                                                                                                                                     |
| **Stat block**         | 250 × 68, numeral cell and label cell split at `--skew-strong`                                                                     | Two per row, 56 px tall, same cut                                                                                                                                     |
| **Match row**          | 770 × 75 skewed cells: tag and date, side, score, score, side, status; paper score cells on the active row                         | A card: line one the Format tag, the competition name where the list spans competitions, the date; line two swatch and label, score cells, label and swatch; a status |
| **Table**              | Name cell a `--skew` parallelogram, rank a square, numerals on navy stripes, sortable headers                                      | Name cell pinned, numerals scroll sideways, column presets as chips above, the sort column highlighted                                                                |
| **Sticker card**       | 315 × 433 hero, tilted 4°, paper card behind as a shadow, a diagonal ribbon, a name plate                                          | 200 px wide as a hero on the Player page; 96 px in a row; upright in a row                                                                                            |
| **Starburst**          | 238 × 211 red over a black offset, rotated text: the vote callout                                                                  | 100 px, two words, "Vote now"                                                                                                                                         |
| **Green cast box**     | The hidden asset: "Ballot cast / See your ballot"                                                                                  | The same, full width of its column                                                                                                                                    |
| **Format tag**         | A `--skew` tag in the Format's family with the word                                                                                | Same, 12 px                                                                                                                                                           |
| **Red bar button**     | 253 × 46 `#ed1c24`, paper label, the primary act                                                                                   | Full width, 48 px; in a sticky bottom bar on forms                                                                                                                    |
| **Season selector**    | A skewed dropdown "Season 3 · 2026/27 · since Mar 2026", All seasons last, a Past season tagged                                    | Full width under the title band                                                                                                                                       |
| **Pitch**              | A half-pitch per side with shirts in the side's colour in the formation, nickname and goal and assist marks, bench beneath         | The two half-pitches stacked; the form lists instead of drawing                                                                                                       |
| **Crown**              | A yellow crown glyph beside a man of the match; the count noun in tables                                                           | Same                                                                                                                                                                  |
| **Linked mark**        | A small mark in the name cell for a Linked Player; nothing for an unlinked one                                                     | Same                                                                                                                                                                  |
| **Warning sticker**    | A yellow inline sticker with ink text for a form warning; a red one for a refusal                                                  | Same, full width                                                                                                                                                      |
| **Sheet**              | A dialog                                                                                                                           | A full-screen sheet with a sticky action bar: the picker, the row sheet, the ballot, confirmations, the Group switcher                                                |
| **Overflow menu**      | Three dots in a page header holding the Manager's and admin's acts                                                                 | Same                                                                                                                                                                  |
| **Skeleton**           | The panel's own shape in muted paper while its read loads                                                                          | Same                                                                                                                                                                  |
| **Show more**          | A paper bar button under a paged list, a skeleton row while the next page loads, gone on the last page                             | Same, full width                                                                                                                                                      |
| **Toast**              | Bottom-right, paper on ink                                                                                                         | Above the tab bar                                                                                                                                                     |
| **Yellow footballs**   | The hidden decoration row: on the sign-in screen and empty states                                                                  | Same                                                                                                                                                                  |
| **Offset title**       | The band name in panel blue over a black offset copy, as "Welcome, Cope!"                                                          | Same at 28 px                                                                                                                                                         |
| **Yellow award panel** | The "Fun facts" panel's style: slab title on `#faf15d` with the `#cec311` edge                                                     | Same; the Season summary, Records and Honours                                                                                                                         |

### The shell

**Phone**: a top bar with the Group name and a chevron, the Group switcher, plus the page's title; a bottom tab bar of four tabs, **Home · Competitions · Players · You**. Players holds Players | Teams as sub-tabs. You is the Account home and carries the open-votes badge across Groups. Members, the Activity record and Group settings live in the Group switcher's sheet under "This Group".

**Desktop**: the mockup's sidebar. Logo; the Group switcher as the Group name with a chevron; the nav: Home, Competitions, Players, Teams, Members, and for admins Activity record and Group settings; the red **New competition** bar for admins; the green box at the bottom as the **Account menu**: avatar and display name, opening Your open votes with the badge, Your career, Account settings, Sign out.

**The Group switcher's sheet**, on both: the Account's Groups with each Group's open-votes badge and the viewer's nickname there, pending invitations, "Create a Group", and "This Group" with Members, Activity record and Group settings for those allowed.

**Landing**: a signed-out visitor at any URL sees the sign-in screen and returns to the URL afterwards. After sign-in, one Group opens on its Group home, several open the Account home, none opens the Account home with "Create a Group" and any pending invitations.

### Screen inventory

Phone first; the desktop is the same content in the sidebar shell with panels in two columns. Every in-Group screen is Members only, and a non-Member landing on one sees the "not a member" screen. Content is drawn from the branch documents named; nothing here adds a fact.

**Account**

- **Sign in.** The landing. Logo on grass, the yellow footballs, Google first, then email and password, forgot password, sign up. Neutral errors; a rate-limit message with the wait. (`01-identity.md`)
- **Sign up.** Email, password (10 to 128), display name; answers "check your email" always.
- **Verify email.** The wall for an unverified Account: the address, Resend, nothing else. An expired link says so with Resend.
- **Forgot, reset and set password.** The same form; the mail said "set a password" for a Google-only Account.
- **Account home** (the You tab). Groups as rows: name, the viewer's nickname there or "no Player", the open-votes badge; pending invitations with Accept; Your open votes across Groups with each deadline; Your career; Account settings; Sign out; the delivery-problem banner while Undeliverable. Empty: "Create a Group" and "Ask a friend for an invitation". (`02`, `09`, `10`, `11`)
- **Create a Group.** Name, time zone prefilled from the browser, default match format prefilled 5-a-side, "I play too" on with the nickname prefilled from the display name.
- **Your career.** One row per Group with the core columns, a total line; "–" where no Rated match.
- **Account settings.** Display name; email with the verification step; Sign-in methods with attach Google, set or change password, detach; sessions with device and last seen, end one, Sign out everywhere; the Vote reminder switch; "Add to home screen"; delete Account behind re-authentication and the confirmation listing what is kept and what goes, refused while sole admin with the Groups named.
- **Re-authentication.** A sheet asking for the password or a Google sign-in, good for ten minutes.
- **Player invitation accept.** The Group name and "you will be Marko"; sign in on the way; the three collision messages of the groups session.
- **Join link accept.** "Who are you?": pick an unlinked Player from the pool with search, or a new nickname prefilled from the display name.
- **Not a member.** The Group name is not shown; "this link belongs to a Group you are not in".
- **From the old app.** Settled in `15-migration.md`: every path the old app used (`/competition/:id`, `/match/:id`, `/vote`, `/invite/:token`) lands here after the Cut-over: "this link is from the old Sunday Heroes", with one button to the Group home, or to sign in.
- **Operator.** A section for allowlisted Accounts: look up by email; sign-in methods, sessions, security events and Deliveries, those two under Show more; resend verification, mark verified, end sessions, clear Undeliverable, delete. Never anything inside a Group.

**Group**

- **Group home.** Top row, the mockup's, as **your Player**: the sticker card, the band with the nickname, the starburst as Your open votes in this Group when any, the stat blocks Played · Win rate with W-D-L in the label · Rating "2.10 · 18" · Crowns, Form as five W/D/L stickers, the current streak as a line. A Member with no Player: the band with the display name, the missing-sticker card with "ask an admin to link you", no blocks. Then **Active competitions**, each a row with the Format tag, the Season summary's leader line ("MVP so far: Ana, 2.31", "Leader: Red", "Still in: Red, Blue") and the Completed count this Season; then **latest results**, the last five Completed matches across competitions as match rows with the crown once Rated. No Top Players panel, no "View all", no Group-wide matches list. Empty: an admin sees "Create your first competition", a Member "No competitions yet". (`10-stats.md`)
- **Competitions.** Active competitions ordered by most recent Completed match, each with the Format tag and its last result date; Ended below under a heading; New competition for admins. (`03`)
- **New competition.** Name; Format as three sticker choices with a line each; voting on by default; for a team format the match format prefilled from the Group default, for Pickup the usual match format; Managers picked from Members; everything else defaults and is edited later.
- **Players.** The Group-wide table: default columns Player, played, W, D, L, win rate, goals, assists, own goals, average rating with its count, crowns; presets Overview, Scoring, Voting, All; a team column in a team-format scope; filters by competition and Format; the optional "played at least N%" filter; search; the linked mark in the name cell; archived Players stay where they earned a row. A row's overflow, by role: rename, invite, archive, merge, link or unlink, delete. "+ New Player" for Managers and admins. Copy as text and Export CSV. Every row is shown, 63 Players as 63 rows, never cut or paged. (`02`, `10`)
- **Teams.** Active Teams with colour, name, competitions entered and record; archived below; create, rename, recolour for Managers; archive, merge, delete for admins. (`05`)
- **Members.** Admins: display name, email, nickname, role, join date; promote, demote, remove, assign Managers per competition, link and unlink. Members: display names and nicknames. Beneath: pending invitations with state, "not delivered" and Resend, revoke; join links with create and revoke; **Past invitations**, the accepted, expired and revoked, newest first under Show more. (`02`, `11`)
- **Activity record.** Admins: the entries newest first with actor, filter by kind, under Show more; a tombstoned actor reads "a deleted Account".
- **Group settings.** Name, time zone, default match format; delete Group behind re-authentication and its confirmation.

**Competition**

- **Competition page.** Title band in the Format's family with the name and tag; the Season selector; the yellow **Season summary** panel with the leader or MVP or Winner or teams still in, top scorer, top assists, most matches, most crowns, Completed and Not played counts, "so far" on the Current season; on Pickup the sticker card of the MVP so far, on a team format the leader as a Team colour plate. Tabs per Format: Pickup **Matches · Players · Records · Rules**; League **Standings · Schedule · Players · Rules**; Knockout **Bracket · Teams · Players · Rules**. Records only on All seasons. The Manager's primary act at the top: Add match; Roster setup, then Generate schedule or Draw the bracket, while the Season is empty. A gear to the settings screen for admins. Empty: "Add the first match", or for a team format the Roster setup step. (`03`, `04`, `10`)
- **Matches tab.** Matches to play above, Completed newest first, Not played apart. Match rows. The Completed list is paged under Show more, which in practice only All seasons reaches.
- **Standings tab.** Colours, played, W, D, L, GF, GA, GD, Pts, Form; "2=" for a shared position; the champion mark; withdrawn Entries last and marked; All seasons Standings with Seasons entered and titles on All seasons. Copy as text. (`06`)
- **Schedule tab.** Round groups opening on the Round in progress; each Fixture with colours in home order, the date, the result or "to play", Walkover and Not played marks; the bye line "Green rests"; a per-Entry filter. Manager acts in the overflow: Generate, Regenerate, Add a cycle, Remove last cycle, Extra Fixture, Set the Round's date; per Fixture: date, Round, home order, Mark Not played, Restore, Walkover, Undo. Admin: Add a team, Withdraw with the Not played or Walkover choice, Restore. Confirmations list what is discarded. (`06`)
- **Bracket tab.** A list by Round on a phone, columns on a desktop, opening on the Round in progress; each Tie a card with seeds "(1) Red", colours, "Winner of QF2", the date, the result or "to play", the aggregate and "Red won 4-3 on penalties", marks, the bye line "Green advances"; the third-place match in the Final's Round; the per-Entry path filter; the End suggestion once the Final is Completed. Draw and Redraw with the ordered list and its two helpers. (`07`)
- **Teams tab (Knockout).** The Entries with their Result and the Winner or teams still in.
- **Players tab.** The same table in the Season scope with the Qualified mark and the rest greyed on rate columns; All seasons without it.
- **Records tab.** The ten Records on All seasons, in the yellow panel, ties shared, each naming the Player or match and the date. Copy as text.
- **Rules tab.** Read-only: Format, match format or usual match format, voting on or off, voting period, Minimum matches, Award threshold, Managers.
- **Competition settings.** Admins: the editable settings with "applies to matches added from now on"; Managers; the Seasons list with number, label, played span, counts and Award threshold, label edit, Reopen last season on the latest Past season when allowed; Start new season; End competition; Delete behind re-authentication.
- **Start new season and End confirmations.** The Season being closed with its summary; the outstanding Fixtures or Pickup matches to play, by name, that become Not played; the open votes that run on; the label field and the Award threshold line, on Start only; for a team format the next steps. (`04`)
- **Roster setup.** The Current season's Entries as an accordion of colour and name, each with its roster as chips from the pool, archived ones marked with remove; "+ add Team" from the Group's Teams or created inline; Copy Entries and Draw teams filling the form; a short-roster warning; one Save; the colour-clash refusal. (`05`)
- **Generate schedule and Draw the bracket.** Small forms: legs; first Round date and interval; for a Draw seeding random or an ordered list with the two helpers, legs, the third-place match.

**Match and vote**

- **Match form.** One scrolling form with a sticky bottom bar, described below.
- **Match page.** The result line with swatches and labels, the Format tag, the date, Not played and Walkover marks; per side the drawn pitch with the bench; each row's goals, assists and own goals; "2 unattributed" where it applies; the shoot-out line; the video link, opening in a new tab; the note; "Recorded by Ana". The **vote block** in its state. **Share** with Copy vote link, Copy reminder text while open, Copy result as text. The overflow for Managers and admins: Edit, Un-complete, Delete or Mark Not played, Close now, Extend, Change record, Correction on a Past season. (`08`, `09`)
- **Vote block states.** _None_: why, "voting is off for this match", "a Walkover has no vote", "fewer than four Players". _Open_: "closes Friday", the turnout as name stickers, voted in colour and not voted greyed, "entered on behalf" to those allowed, "Enter ballot" per non-voter for Managers; for a Voter without a ballot the starburst; for one with a ballot the green cast box with "See your ballot" and Change ballot; a voided-ballot notice, "your ballot was voided because a Player left the match". _Closed, Rated_: the man of the match as a sticker card with the crown, shared crowns side by side; the results breakdown as a table of rating, points, firsts, seconds, thirds beside the ballots cast. _Closed, Not rated_: "Not rated, 2 of 12 ballots" and the turnout, nothing else.
- **Ballot sheet.** Full screen: the match's Players in both sides' colours, tap in order for first, second and third marked by a numbered star, tap again to unmark, the viewer's own row greyed, "Cast ballot" enabled at three. On behalf: the Player's name in the title and "entered by you" afterwards. Replace: the same sheet prefilled. After the Account's first ballot anywhere, the Reminder prompt: "Remind me by email before a vote closes?" Yes and Not now.
- **Change record.** Managers and admins: every act on the match with actor, old and new values, newest first under Show more. A migrated match's first entry reads "Imported · recorded by Ana" (`15-migration.md`).
- **Confirmations.** Un-complete; Delete naming the ballots that go; Close now; Extend with a date picker bounded to 14 days from completion; Correction as the match form restricted to result facts.

**People**

- **Player page.** Header with the nickname, the linked or unlinked state, the archived mark, first and last match dates; the hero sticker card; the star band; the summary strip Played · W-D-L · Goals · Assists · Rating · Crowns; Form and the rating history chart with a competition filter; the breakdown table by competition with Season sub-rows; Teams played for with guest appearances apart; streaks, clean sheets, attendance, own goals, consistency, the voting record; Played with and Played against in Pickup, in the mockup's Top teammates card shape; best matches; Honours in the yellow panel; the match history newest first with result, goals, assists, rating or "Not rated" or "no vote", a crown mark, a competition filter, fifty at a time under Show more as the last thing on the page. (`10`)
- **Team page.** Header with colour and name; per competition each Entry by Season with roster, position or Result, record and Form; totals; titles and finals; most appearances, top scorers, top assists, best average rating over roster appearances; guest appearances apart. (`05`, `10`)

**Mail.** React Email templates in the identity: the logo, a paper body, one red bar button with the bare URL beneath, the plain-text part beside; the footer of a Notice carries the one-click unsubscribe, an Account mail carries none. (`11`, `12`)

### The match form on a phone

The most-used screen, one scrolling form for Add match, a Fixture, an edit and a Correction, with a sticky bottom bar: **Save**, and **Complete** as the red primary whenever a score is present.

1. **Top**: the date, prefilled from the planned date, required at Complete, never later than today; in Pickup the match format prefilled from the usual one and the two side colours prefilled from the previous match, refused equal.
2. **Sides**: two columns headed by the swatch and label, or the Entry. Each Player a row: nickname, and small goal, assist and own-goal counts once set. "+ add" opens the **picker sheet**: the active pool, loaded whole and searched in the client, under two headings, **Played this Season** and **Everyone else**, each with the most recently played first, so a pool of 63 reads as a list of twenty with the rest below; search runs over both; "+ new nickname" creating a Player under the groups session's rules; in a team format the Entry's roster pre-selected with removal a tap and "add a guest" opening the rest of the pool. Above the columns in Pickup: **Draw sides**, which asks for the Players who turned up and deals them at random or balanced by rating, showing each side's sum, and **Copy last lineup**. Tapping a row opens the **row sheet**: steppers for goals, assists and own goals; move to the other side; move up or down in the formation; guest, in a team format; remove. Drag-to-reorder exists on a desktop only.
3. **Score**: two big numeral cells, the attribution line beneath each side, "2 unattributed" as a yellow warning, assists over goals as a red refusal.
4. **Formation**: a picker per side from the fixed list for the match format, the first rows filling the slots in order and the rest on the bench, with a collapsible pitch preview.
5. **Extras**: the shoot-out's two totals, shown only when the match is a level deciding match; the video link; the note.

Warnings appear inline as yellow stickers and never block: a short or uneven side, unattributed goals, a guest on another Entry's roster, a duplicate match on that date with those Players. Refusals arrive as red stickers keyed by the reason enum. The unsaved form is kept in local storage under the client-minted match id until a Save or Complete succeeds, so a dropped connection at the pitch loses nothing. A `CONFLICT` reloads the server's version, keeps the viewer's edits on fields the other saver did not touch, takes the server's value on fields both changed and flags them with the other's value, under the banner "Marko saved this match while you were editing; check the flagged fields".

### The vote as a shared moment

The share link is the match page. A Member who follows it from the chat lands on the match page with the vote block at the top; a Voter without a ballot sees the starburst and is one tap from the ballot sheet; three taps and Cast, and the green box says the ballot is in. The turnout under it is the pressure the chat applies, now visible to everyone by name; Copy reminder text writes the "still waiting on" line. After close, the man of the match is a sticker card with a crown, the results line goes back to the chat through Share, and the breakdown answers the argument. Your open votes on the home and the You badge catch what the chat missed. Nothing about a ballot is ever visible to anyone but its owner and, when entered on behalf, the Managers who typed it.

**Share** is one control everywhere the docs give a copy act: it uses the phone's share sheet when the browser offers it, with the same text, and copies to the clipboard otherwise. The copy acts the docs left to this session, copy result, copy Standings and copy bracket as text, are all accepted under it.

### Behaviour

- **Loading**: a skeleton in the panel's own shape; loaders request a page's data before it renders, so most navigations show none.
- **Paged lists**: the split is `12-architecture.md`'s. A derived table, the player table, Standings, Records, shows every row and sorts, filters and presets in the client; Copy as text and Export CSV carry the whole scope whatever is on screen. The lists that grow without bound, the Activity record, a change record, Past invitations, the Operator's security events and Deliveries, the Completed matches of the Matches tab and the Player page's match history, load fifty rows and end in **Show more**, through `useInfiniteQuery` on the shared QueryClient, so leaving a list and returning keeps what was loaded. No infinite scroll, no page numbers, no totals. A filter on a paged list is part of the read and changing it starts from the top; the filters stay in the URL, the number of pages loaded does not.
- **Empty**: every list has a sentence and, for a role that can act, the act: "Add the first match", "Create your first competition", "Nobody has voted yet".
- **Errors**: `NOT_FOUND` renders the not-found page inside the shell; `FORBIDDEN` the "not a member" screen or a "Managers only" sticker; `PRECONDITION_FAILED` the reason's copy inline; `CONFLICT` the reload above; anything else an error boundary with Retry and the request id.
- **Build id**: a changed build id on a navigation reloads once, silently.
- **Dates and numbers**: "17 May 2026", "17 May" within the year, weekdays for deadlines, "closes tomorrow"; the rating with its count as "2.10 · 18" in blocks and "2.10 over 18" in prose; win rate as "67% · 8-2-2"; a missing value as "–".
- **Installable**: a manifest and a service worker for the app shell only, no offline data; "Add to home screen" in the Account settings; no push.
- **Accessibility**: text is never skewed; contrast at AA for text, which is why the light green carries ink; every tap target 44 px; the tab bar and sheets reachable by keyboard on a desktop.
- **Theme**: one. No dark mode.

### Components and code

Tailwind v4 with the palette, fonts, type scale, skews and shadows as CSS variables; shadcn/ui components copied in and restyled to the identity over Radix primitives; Lucide icons; TanStack Table for the sortable table with its presets and pinned column; dnd-kit for reordering on a desktop only; the rating history chart as a hand-drawn SVG line with the rolling average, no chart library; parallelograms as `clip-path` polygons; the two fonts self-hosted as woff2 with `font-display: swap`; the vector assets inlined as SVG components; the grass as one background image. Forms on React Hook Form with `domain`'s value rules as the warning source and the `version` on every save. File-based routes carry the Group and the Season number as typed params; loaders use `ensureQueryData` on the one QueryClient. Client component tests stay minimal, for the ballot's tap order, the table presets and the form's warning logic; the Playwright flows of the architecture session cover the screens.

### Assets

In `design/assets/`: the PNGs of the extract, and from this session the SVGs `star.svg`, `star-band.svg`, `starburst.svg` (the red shape and its black offset) and `logo-shapes.svg` (the two boxes, three stars and the wordmark plate), exported by `design/tools/psd-to-svg.py` from a throwaway venv with psd-tools. The logo itself is `logo.svg`: a trace of the PNG with the background removed and its fills mapped to the palette tokens, accepted as final, so nothing is owed by the designer. The parallelograms and bands are CSS.

### Screens still to be drawn, in order

Drawn next in Claude Design from `design/brief.md` and the four mockups, in vertical-slice order. The brief covers slice one in full and names the rest.

1. Sign in, with sign up and verify email as its siblings
2. Account home
3. Create a Group
4. Group home
5. Competitions list and New competition
6. Competition page, Pickup, with its tabs and the Season summary
7. Match form, with the picker sheet and the row sheet
8. Match page with the vote block in every state and the ballot sheet
9. Players page
10. Player page

Slice two: Members and invitations, the join-link "who are you" step, invitation accept, not a member. Slice three: Teams, Roster setup, League page with Standings and Schedule, the Fixture form, Knockout page, Team page. Slice four: competition settings with the Seasons list, the Start new season and End confirmations, Activity record, Group settings, Account settings, Your career, Records and Honours, the Operator section, the mail templates.

## Scenarios that shaped the model

- **Sunday, 19:40, at the pitch.** The Manager opens Competitions, taps Add match, taps the fourteen who turned up in the picker with the regulars at the top, presses Draw sides balanced, swaps two in the row sheet, Saves. The connection drops; the form is still there when the app reopens. After the game: two numerals, three scorers from row sheets, Complete. The starburst appears on everyone's home.
- **The share link in the chat.** Marko taps it on Monday, signs in with Google, lands on the match page, taps the starburst, taps Ana, Ivan, Petar, Cast. The green box thanks him; the Reminder prompt asks once; he says Not now and never sees it again.
- **A Member with no Player.** Luka joined by a join link and picked no one. His home shows his display name, a missing sticker and "ask an admin to link you"; the admin links him from Members and his home fills in.
- **Two Groups.** Petar's You tab lists Tuesday and Sunday with a badge on each; the switcher in the top bar swaps them; a link pasted from one chat into the other opens "not a member".
- **Eleven columns on a 390 px screen.** The Players page pins the name and scrolls the rest; the Scoring preset shows played, goals, assists and own goals; sorting by rating highlights that column.
- **A pool of 63.** Last season's Group had 63 Players. The Players page shows all 63 rows with the name pinned, and each finds their own by scrolling or search; the picker at the pitch opens on the twenty who played this Season with the other forty-odd under "Everyone else", one typed letter away, and works with the connection gone because the pool was loaded once.
- **Three years of Sundays.** A Player page's match history shows the last fifty matches and Show more brings the fifty before; the Activity record filtered to merges starts again from the top.
- **A cup of six on a phone.** The bracket lists the Quarter-finals with two Tie cards and two "advances" lines, then the Semi-finals; the desktop draws the columns.
- **Two Managers, one match.** The second save is refused; the form reloads, keeps the uncontested edits, flags the score cell with the other's value.
- **The deploy on Monday.** The app open since Sunday reloads once on the next tap; nothing is lost because the draft is on the server or in local storage.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **A four-tab bottom bar**, Home · Competitions · Players · You, with Players | Teams as sub-tabs and the Group pages in the switcher's sheet; the mockup's sidebar from 1024 px; two layouts, no tablet rail.
- **The Group switcher as a sheet** listing Groups with badges, pending invitations, Create a Group and "This Group".
- **Two self-hosted open fonts**, Ultra and Archivo Narrow, plus the system stack; Galano and Druk dropped; Adobe Fonts declined.
- **Two skew tokens**, 21.5° and 15°.
- **A colour family per Format**: Pickup blue, League green, Knockout orange-red; yellow for awards.
- **One theme**, no dark mode; the grass and pitch lines at every width.
- **Tailwind v4 with shadcn/ui restyled** over Radix, TanStack Table, Lucide, a hand-drawn SVG chart, `clip-path` parallelograms.
- **The sticker card as a Player thing** with the nickname on the plate, the Linked Account's avatar, the **missing sticker** for an unlinked Player, and "since Mar 2024" on the ribbon; the declined extras stay declined.
- **The starburst as the vote callout** and the hidden green box as the cast state.
- **The stat blocks as your Player's snapshot** on the home and the six-block strip on the Player page; the counting cards gone.
- **The yellow panel as the Season summary**, Records and Honours; "Fun facts" gone.
- **The phone match row** as a two-line card with swatches and colour names; HOME and AWAY gone from Pickup.
- **The table on a phone**: pinned name cell, sideways numerals, column presets, the linked mark in the name cell; the Status column gone.
- **The competition page's tabs per Format**, the Season selector as a skewed dropdown, the MVP sticker card on Pickup only.
- **The match form** as one scrolling form with a sticky bar, a picker sheet, a row sheet, Draw sides and Copy last lineup above the sides; drag on a desktop only.
- **The pitch drawn on the match page and listed in the form.**
- **The ballot as a full-screen sheet with tap-in-order picks**, opened from the starburst, with on-behalf and Replace modes and the Reminder prompt after it.
- **One Share control** using the phone's share sheet with copy as the fallback, covering every copy act the docs left open.
- **The bracket as a list by Round on a phone** and columns on a desktop.
- **An offline draft** of the match form in local storage under the client-minted id.
- **The CONFLICT reload** that keeps uncontested edits and flags the rest.
- **Installable from day one**, shell only, no push.
- **The drawing order** in vertical slices, the brief covering slice one.
- **The home's top row as your Player**; no Top Players panel, no "View all", no Group-wide matches page.
- **Sign in as the landing**; no marketing page.
- **The phone type scale and panel tokens** as listed, not a fixed ratio of the desktop.
- **The Manager's acts in one overflow menu** and "Enter ballot" per turnout row.
- **Dates as "17 May 2026"**, ratings as "2.10 · 18", win rate as "67% · 8-2-2", "–" for a missing value.
- **A sixteen-colour side palette**, nine from the identity and seven added, Red and Blue as the first Pickup defaults.
- **The extracted SVGs committed** with the extraction tool; the traced `logo.svg`, cleaned, accepted as the final logo rather than requesting outlines from the designer.
- **Show more as the one paging control** (added 2026-09-17), on the lists `12-architecture.md` pages and nowhere else; the Players table always whole; the picker's pool whole under "Played this Season" and "Everyone else"; Past invitations apart from the pending.

### Declined, and why

- **Infinite scroll.** It fights the tab bar and makes anything beneath a list unreachable. **Numbered pages**, which need a total and an offset the server does not give.
- **A cut on the Players table**, the first 25 with Show more. A leaderboard is scrolled to find yourself, and a Player should not press a button to see their own row.
- **A paged or server-searched picker.** 63 Players are a few kilobytes, and the picker must work when the connection drops.
- **A sheet-sidebar behind a hamburger** on a phone, as today. Hides the whole app behind one tap.
- **A five-tab bar with Teams.** Four is the thumb's limit; Teams sits beside Players.
- **A tablet icon rail.** A third layout for a device nobody records matches on.
- **Licensing Blackoak through Adobe Fonts**, or all three commercial fonts. The brand should not depend on a subscription; Ultra reads as the same slab.
- **Three skew angles as measured.** Two of them were one hand's inconsistency.
- **The old gold, green and blue per format**, or **a Format word with no colour**. The palette has its own families and the tag carries the word anyway.
- **Dark mode.** A second identity for a one-theme design.
- **A headless library styled from scratch**, or **a styled library as is**. The first is work already done in shadcn; the second cannot look like this.
- **A per-Player photo upload**, reopening what the groups and identity sessions declined. The missing sticker is the answer.
- **The sticker card as an Account thing.** The Player is the identity in a Group.
- **A wizard for the match form**, or **inline steppers on every row**. A wizard fights editing; inline steppers are twelve mis-taps per side.
- **The pitch drawn in the form**, or **listed on the match page.** Thumbs work on lists; eyes look at pitches.
- **Three drop-down slots**, or **the ballot inline on the page**, for the ballot.
- **Share as image** of the man-of-the-match card. The most on-brand idea in the session and a canvas renderer to maintain; later.
- **A Top Players panel on the home**, and **a Group-wide matches page**. The Players page is the leaderboard and every match list belongs to a competition.
- **A marketing landing page.** Members only has no public face.
- **A fixed 0.6 scale for the phone.** Forty-pixel slab titles on a 390 px screen.
- **Buttons for every Manager act** in the match header.
- **Local date format** "17.05.2026." from the mockup. English only.
- **Requesting every element from the designer as SVG**, or **redrawing them**. The vectors were already exact and in hand.

## Hand-offs to other sessions

- **Identity (1)**: nothing new; the Account settings, re-authentication sheet and Operator section are drawn as that document specifies.
- **Groups (2)**: applied here: the switcher's sheet, the Account home, the "who are you" step, the Members page with invitations and join links, the Activity record screen.
- **Competitions (3)**: applied here: the Format families, the create form with three sticker choices, the Rules tab, the list's two sections, the settings screen's "applies from now on" copy.
- **Seasons (4)**: applied here: the confirmation screens, the selector with labels and played spans, the summary as the yellow panel with "so far", the Seasons list on the settings screen, the Not played marker, the Season number in the URL.
- **Teams (5)**: applied here: Roster setup as an accordion with inline Team creation, Copy Entries and Draw teams; the sixteen-colour palette; the Teams page and the Team page; the archived marker; "add a guest".
- **League (6)**: applied here: the Standings and Schedule tabs, the bye line, the marks, the per-Entry filter, the champion mark and "2="; the generate form; the confirmations; copy Standings as text under Share.
- **Knockout (7)**: applied here: the bracket as a list by Round on a phone and columns on a desktop; the Tie card; the Draw form with its ordered list and helpers; the confirmations; the path filter; the End suggestion; copy bracket as text under Share.
- **Matches (8)**: applied here: the match form on a phone with its pickers, row sheet, counters, formation and bench; the match page and list; the confirmations; copy result as text under Share; the pitch drawn on the page and listed in the form; the offline draft.
- **Voting (9)**: applied here: the ballot sheet with tap-in-order picks; the vote block's states; the turnout as name stickers; the breakdown table; Your open votes on the home and the You badge; Share with Copy vote link; the Close now and Extend confirmations; the voided-ballot notice; the man of the match as a sticker card.
- **Stats (10)**: applied here: the one table with presets, the Qualified mark and greyed rows, the optional percentage filter; the Player page and its SVG chart; the Team page; Records and Honours in the yellow panel; the Group home; Copy as text and Export CSV under Share; "2.10 · 18" and "–".
- **Notifications (11)**: applied here: the Reminder prompt after the first ballot; the Vote reminder switch in Account settings; the delivery-problem banner; "not delivered" with Resend; Copy reminder text beside Copy vote link; the manifest and install hint with no push; the mail templates' look.
- **Architecture (12)**: nothing changes there; this session adopts Tailwind v4, shadcn/ui over Radix, TanStack Table, dnd-kit on desktop, React Hook Form and two self-hosted fonts as the `web` package's dependencies, and the manifest and shell service worker as files it serves. The CONFLICT handling described here is the client half of that session's version column. Added 2026-09-17: Show more is the client half of that document's Paged reads.
- **Operations (14)**: the fonts and the grass image are static files of the built SPA, cached long with hashed names; the manifest and service worker must be served from the same origin; the seed script must yield every vote state and a missing sticker for screenshots; Lighthouse on the built app as a check if the pipeline wants one. Settled in `14-operations.md`: Lighthouse by hand on staging, not in CI; a strict CSP with no inline scripts, so any inline style a component forces is allowed by hash; the build id is the commit SHA; a Read-only banner and the `maintenance` reason's copy are this session's to draw.
- **Data migration (15)**: nothing; every migrated Player is a missing sticker until linked, and the migrated links give the avatars. Settled in `15-migration.md`: every old path lands on one "from the old app" page pointing at the Group home; a migrated match's change record reads "Imported · recorded by Ana".

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md` under a Frontend heading: Account home, Group switcher, Sticker card, Missing sticker, Format tag, Vote callout, Ballot sheet, Side palette, Column preset, Share. Retired from the mockup's copy: "Dashboard", "Welcome" as a page, "Fun facts", "Top Players" as a panel, "Pending Votes", "Registered" and "Unregistered", "Played with" and "Managed" as toggles, "View details", "View all", "Add new Competition" as the act's name, "Home" and "Away" in Pickup, "fouls", "Matches" as a Group-wide page. The words "row sheet", "picker sheet", "overflow menu" and "skeleton" are implementation vocabulary and stay out of the glossary.
