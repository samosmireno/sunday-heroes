# Claude Design export: audit against the brief

Audited 2026-09-17. Source: the first export, `docs/rewrite/design/export/DesignSystem/` (16 screen files and the design system page, 83 sections), since deleted and replaced by `export/DesignSystemV2/`; the per-screen findings below were read from it. Every file was rendered in headless Chromium; each section was read as a screenshot, as text and as DOM, against `brief.md`, `CONTEXT.md` and the branch docs.

Severity: **B** contradicts the spec, **M** a required thing is not drawn, **m** polish or token drift. Each line ends with a prompt to paste into Claude Design.

## What holds

- All 17 files render with no script error. Every section is drawn at 390 px and at 1440 px.
- The brief uploaded to Claude Design is identical to the working `brief.md`.
- Palette, the sixteen side colours, Ultra, Archivo Narrow Bold, system sans, the 15° and 21.5° skews on background layers only, 4 and 8 px shadows, edge tabs, 1 px strokes: all on token. One stray grey `rgb(75,85,96)` on screen 9.
- No page numbers anywhere. Show more only under completed matches, the match history and the Change record.
- Shells, role gating of the red bars and overflows, ballot secrecy, the sheet on a phone and dialog on a desktop: right almost everywhere.

## Fix the brief first

These errors trace back to the brief, so re-prompting without fixing it will reproduce them.

1. **Win rate example.** Screen 10 says "9 matches · 3W-2D-4L · 33%". That is wins over played, which `10-stats.md` declines. The points share is 41%. Every win rate on screens 6, 9, 10, 12 and 16 copied the wrong formula. Add one line to Visual language or screen 9: "Win rate is (3W + D) / (3 × played), shown as '67% · 8-2-2'."
2. **Dates.** The brief never gives the format. `13-frontend.md` sets "17 May 2026", "17 May" within the year, and declines "17.05.2026.". Every screen uses the dotted form.
3. **Shadow direction.** Decided 2026-09-17: down and left, as drawn. `13-frontend.md` and the brief now say so; nothing to change in the designs.
4. **"Never use: Home, Away"** collides with the required Home tab. Say "Home and Away as side labels".
5. **Screen 6, "14 completed · 1 not played"** beside "MVP so far". A Pickup has no Not played in its Current season (`08-matches.md`). Drop "· 1 not played" from the example.
6. **Screen 7, "a possible duplicate"**: say "a possible duplicate match". It was drawn as a duplicate Player.
7. **Screen 7, "a red sticker for a refusal"**: name one reachable refusal ("the date can't be later than today"). The designer drew an unreachable one.
8. **Screen 9, "the Group's leaderboard"**: the glossary avoids Leaderboard as a screen name; the panel was titled with it.
9. **Rules tab lines.** The brief lists "Minimum matches, Award threshold" without saying what each is, and both team-format pages then described Minimum matches as the Qualified rule. Give the wording: Minimum matches is voting's gate and Pickup only; Award threshold is the Qualified rule; the voting period is whole days from completion.
10. **Screen 10 "Must not show: a photo"** against the Google avatar in the sticker frame on screen 4. Say the avatar is allowed.
11. **Later screens** are named only, so the designer invented rules for Redraw, Regenerate, Restore, Withdraw, roster size and Draw teams. Give each later screen a paragraph like screens 1 to 10 before drawing the rest.

## Look choices, decided 2026-09-17

Shadows fall down and left, as drawn. The competition title band stays paper with the tag carrying the family, as drawn. The offset title is panel blue over a black copy set down and left; the drawn ink over blue is to be fixed. Button labels are plain, never underlined, with a + in the paper circle only on an act that adds something; the drawn underline and blank circle are to be fixed.

## Look-only prompt

The designs are for look and layout only (`13-frontend.md`), so this is the prompt to paste. It leaves copy, numbers and rules alone.

"Across every screen, change only look and layout; do not touch copy, sample data or states. (1) Draw every offset title (the nickname band, page band names) as panel blue #3a3ab0 text over a black copy set down and left, not ink text with a blue shadow. (2) Remove the underline from every button label; keep the paper circle only on a button that adds something and put a + in it; every other button has no circle. (3) Picker sheet rows must never shrink: flex: 0 0 48px with a 44 px checkbox, the list scrolling between the sheet's header and its sticky action bar (screens 7b and 14c). (4) Make every text link, chip, sortable header, row overflow button and 'Enter ballot' control a 44 px tap target. (5) Never truncate a Team name, a competition name, a roster or a status with an ellipsis: widen the cell, wrap to two lines or shrink the score cells (screens 10, 12b, 13a, 14d, 15, 16a). (6) On the phone match page keep each side's swatch glued to its name so the result line never wraps with an orphan swatch. (7) Give Navy, Black and Dark green swatches a paper 1 px stroke wherever they sit on a navy row. (8) Never set text directly on grass with a pitch line behind it: put it on a paper strip in ink (screens 10, 11, 16). (9) Keep sticker text horizontal; tilt only the background shape. (10) The starburst's shadow falls down and left like every other shadow. (11) Use one phone top bar on every screen: the Group name with a chevron as a 44 px switcher, plus the page title. (12) The sidebar Account box is avatar, display name and open-votes badge only. (13) Keep the active overflow button's three dots visible, in one active style everywhere. (14) Minimum 12 px for any label, including pitch nicknames and Format tags."

## Second export, re-checked 2026-09-18

`export/DesignSystemV2/` holds screens 1 to 20 after prompts 9 and 2: 128 sections, no script error. Everything in the fix-up landed except the leftovers below, all small. The chart on screen 10 is the bar chart the docs describe, with its title, its 0 to 3 axis, its "average" label and the 10d empty state. Screen 18 has its two missing states (18h, 18i). Old copy on screens 1 to 16 (dotted dates, "Draft", "Leaderboard", "subs") stays reference only.

Leftovers, in prompt 10 of `prompts.txt`:

- 13a, 13b, 13g, 13k desktop: on the two-leg QF cards the Team name runs into the first score box ("(5) Orang").
- 14c phone: the guest search field and "+ new nickname" are still about 22 px.
- 18d phone: the email input is hidden behind the sticky bar.
- 18a phone: the Luka Petrović row wraps to a third line.
- The Group switcher chevron in the phone top bar is a tiny glyph with no visible 44 px target; 4c and 4d drop the page title line the other Group home sections have.
- 8i desktop: the row rules are still staggered per cell.
- 10a to 10c phone: the chart legend is missing; 10 desktop: the breadcrumb sits on grass; 10d: a stray grey dashed line remains in the empty chart.
- 7b: the side colour dot in the sheet title is an empty ring.
- 1a to 1e: "Show" and "Change" are 42 px; 11b: the colour swatches are 27 px.

Re-exported to the same folder after prompt 10 and re-checked 2026-09-18: all nine leftovers are fixed, at 390 and at 1440 px, with no script error. Three judgement calls are accepted: a two-leg card on screen 13 puts the seed and name on its own line above the score boxes; the 18a phone row drops the joined date; the 7b side colour dot is filled and sits in a paper ring. The phone switcher is one 44 px button holding the Group name and its chevron on every in-Group screen (2 to 19). Nothing is left for Claude Design from prompt 10.

Decided 2026-09-17: the corner ribbon on a sticker card ("since Mar 2024", "Man of the match", "MVP so far") keeps its text at 45 degrees along the ribbon. It is the one exception to "tilt only the shape".

## The design system sheet, re-read 2026-09-18

`Design System.dc.html` in `export/DesignSystemV2/` is where the build will copy tokens and components from, and its captions and samples were never re-prompted. Where the sheet and a later screen or a doc disagree, the screen and the doc win. The sheet still says:

- §14: the red bar has an underlined label. Labels are never underlined.
- §17: the offset title is "ink with a #3a3ab0 offset". It is panel blue over a black copy, as the sheet's own header renders it.
- §20: the overflow is "··· in a 36 square", "same on a desktop". It is a 44 px target, a menu on a desktop and a bottom sheet on a phone (screen 17).
- §20: Members is in the sidebar "only for an admin". Every Member sees the Members page (18b).
- §21: a sheet is "up to 92% tall". A dialog is a full-screen sheet on a phone (prompt 9, item 3).
- §21: the sample confirmation regenerates Rounds 8 to 14 and keeps the completed ones. Regenerate exists only on an Empty season and discards every Fixture (`06-league.md`).
- §23: "a Team column in a table is the plate alone". It is the plate and the name (prompt 3).
- §11: an unqualified row is labelled "below Minimum matches" and shows "– · 2". Greying follows the Award threshold and keeps the real values (`10-stats.md`).
- §10: a match row reads "To play · Sunday 10:00". A match has a date and no time of day (`08-matches.md`).
- §08: the award panel reads "MVP so far" beside "1 not played". A Current Pickup season has no Not played match.
- §15: the toast offers "Match saved · Undo". No such act exists.
- §25: the someone-else-saved banner carries a Reload button. The form reloads on `CONFLICT` by itself and flags the cells (`13-frontend.md`).
- §09: an "Open votes" stat block. The Group home shows open votes as the starburst.
- §13: the cast box offers "Change ballot". The button reads "Replace ballot" (`CONTEXT.md`, Replace).
- Dates are dotted throughout, and two sections are numbered 18.

Decided 2026-09-18, where the export and the docs differed on the look:

- **Grass**: the textured image, as `13-frontend.md` says, not the export's default of flat green with CSS pitch lines. The export's `texturedGrass` toggle, off in every screen, is the build's on.
- **Star band**: the export's colours, red stars on `#f4e937` as the nickname band of the Group home and the Player page, yellow stars on `#07361c` as the dark variant; `13-frontend.md` now says so.
- **Activity record**: screen 19's seven chips plus **Competitions**, which covers competition, Season, schedule, bracket and match acts; the mapping is in `13-frontend.md`. Screen 19 lacks that chip.

## Per screen

Reference only. Under the look-only rule the **B** and **M** items about copy, numbers and rules are for the build to get right from the branch docs, not for Claude Design to redraw.

### 1 Sign in

- **B 1c** Password label says 8 characters; `01-identity.md` says 10. "Change the Sign up password label to 'at least 10 characters'."
- **B 1e** "Change" link on the Verify wall; the spec is the address, Resend, nothing else. "Remove 'Change'; show the address as bold text, Resend, the wait line and Sign out."
- **M** Rate-limited sign in, expired verification link, Google-unverified refusal. "Add 1f, 1g, 1h for those three states at both widths."
- **m** Verify body copy mentions Groups the Account cannot have yet; desktop logo and card are not in one centred column; the neutral "Sent 09:41" is a yellow warning sticker.

### 2 Account home

- **B 2a 2c** "Decline" on an invitation; no such act exists. "Keep only Accept."
- **M 2c** Invitations panel missing from the phone frame. "Restore it as in 2a."
- **M** Empty state with a pending invitation (2d); a Member variant of the sidebar.
- **m** Copy: "You will be Marko", no Member count; banner "We could not deliver mail to …. Check your address."; "closes Friday" in yellow (yellow is for awards); "Your open votes" title not in Ultra; phone open-vote rows lack "Vote now" and the date.

### 3 Create a Group

- **M** A refusal state (empty or over-long name) and the busy Create bar.
- **m** Phone sheet is partial, `13-frontend.md` says full-screen; 3b helper says "an admin can link you" to the only admin.

### 4 Group home

- **M 4a** Win rate block without its W-D-L label; no current-streak line. "Label 'Win rate · 15-6-9'; add the streak line under Form."
- **m** Desktop rating label wraps ("Rating · 18 ratings"; use "2.10 · 18" and "–"); 4a desktop is one column while 4c is two; match-row cell order; ribbon "since Sep 2026" with zero matches; initials "MJ" beside "MARKO"; Form row missing on the 4c phone; offset titles are black text with a blue shadow; decided 2026-09-17: blue text over a black copy set down and left.

### 5 Competitions

- **B 5b** With League selected the helper says "Each match can still differ"; in a team format every Fixture inherits it. "Label 'Match format · every Fixture uses it' for League and Knockout; 'Usual match format · each match can still differ' for Pickup."
- **B 5b** Voting helper "a vote closes Friday". "Say 'A vote closes 3 days after the match is completed.'"
- **m** Knockout line "Lose once and you are out" is wrong for two-legged Ties; desktop nests Ended inside the Active panel; Member variant of 5a not rendered.

### 6 Competition page

- **B 6d** Minimum matches described as the Qualified rule. "Minimum matches: '5 completed matches here before a Player can vote'. Award threshold: '60% of the Season's completed matches to be Qualified'. Voting period: '3 days after a match is completed'."
- **B 6b** "Qualified from 5 matches" with a 60% threshold and 14 completed; the cut is 9. "Header 'Qualified from 9 of 14 matches (60%)'; grey everyone below."
- **B 6b** Unqualified rows show "–"; the spec greys real values.
- **B 6a 6b** Summary ignores ties (Ana also has 14 goals and 9 assists); Ivan has 15 played in a 14-match Season. "A tie shows every name; no played count above 14."
- **B 6a 6f** Not played rows with invented reasons on a Current Pickup season. "Remove them; show Not played only under a Past season or All seasons, with no reason."
- **B 6f** "Not rated · 3 of 12 ballots" twelve times; three ballots is Rated. "Use 2 or fewer."
- **B 6f 6a** "50 of 118 matches" and "14 matches" are totals on a paged list; 6a claims 14 and draws 6. "Remove the counts; draw all 14 rows."
- **M** The Season selector open (Past season tagged, All seasons last); a Past season view; Manager and Member variants; on 6b the preset chips, sort highlight and linked marks; Share on the summary, table and Records.
- **m** All seasons invents a hero card with "27 crowns"; 6f scores are a 1 to 6 cycle against 0 and "Sunday 14.09.2026" is a Monday; 6e selector should read "Season 1 · no matches yet".

### 7 Match form

- **B 7d** Duplicate drawn as two Players. "Replace with a form-level yellow sticker: 'Possible duplicate: a completed match on 20 Sep has these same Players'."
- **B 7d** Greyed Complete with no score beside "needs a score". "With no score show only Save; draw the refusal with a score present, e.g. 'The date can't be later than today'."
- **B 7d** Desktop banner offers "Keep mine"; phone and desktop differ; phone cells carry no "added by Ana". "One banner at both widths, no choice, every flagged cell labelled with the other's value."
- **B 7b** Picker rows render about 28 px tall.
- **M** No own-goal count on any row (and no "OG" in copy); no Bench divider after the formation's slots.
- **m** "Draft" as a state and "New match" as the title (use "Not saved yet", "Add match", "Edit match"); phone sheets not full-screen; Blue swatch invisible on the blue sheet header.

### 8 Match page

- **M 8c** Breakdown shows the winner's numbers only. "Draw a table, one row per Player of the match: Player, Rating, Points, Firsts, Seconds, Thirds, captioned '12 ballots'."
- **B 8c** 6 + 4 + 3 picks from 12 ballots is impossible (11 at most). "Use 6 / 4 / 1, 27 points, 2.25."
- **B 8i** "Cope entered a ballot for Pule" in the Change record; ballots are not acts on the match. Extend is dated before completion. "Remove the ballot row; move Extend after completion."
- **m** On-behalf example uses a Player already shown as voted (use Paja); You badge not decremented after voting; block titled "The vote" on a phone and "Man of the match" on a desktop; ballot rows lack the side colour and the star numeral is 10 px; "BULEVAR 2-2 GRBAVICA" wraps with an orphan swatch; League match has a Pickup-blue offset; starburst shadow falls right; pitch labels 10 px; "starting" in the Change record (use slot); "Enter ballot" is a 13 px link.

### 9 Players page

- **B 9b 9d** Filtered scopes reuse the pooled numbers ("Zimska liga · 14 matches", Marko 28 played). "Give each filter its own data: played ≤ the scope's matches."
- **M 9b** No Team column in a League scope ("or 'Guest'").
- **m 9c** Search renumbers ranks and says "3 Players". "Keep scope ranks (#1, #5, #12); '3 of 15 Players'."
- **m** Panel titled "Leaderboard"; footer says "ballot points"; chips 36 px and headers 32 px; rank not in Archivo Narrow; phone Share is a dropdown, not a sheet.
- **M** Loading skeleton, a Group with no Players, a rating of "–", an archived row, the row overflow by role.

### 10 Player page

- **B 10a** Six 3.00 rows without a crown, crowns on 2.06 to 2.91. "A crown on every 3.00 row; Crowns total equals the marks."
- **B** Best matches: three rows by goals and assists. "Top five by rating, ties by recency."
- **B** Honours: MVP for a League, an honour for the Current season, "Most matches". "Only MVP (Pickup), Top scorer, Top assists, Most crowns and titles, from Past seasons."
- **B** Attendance pools League matches and counts from the Player's first match. "Pickup only, over all Completed Pickup matches of the scope: 'played 77 of 95'."
- **B** Form is newest first. "Oldest to newest, latest on the right."
- **m** Rating history chart. Decided 2026-09-17: the drawn bar chart is the design (bars by result, the average as a dashed line), and `10-stats.md`, `13-frontend.md` and `CONTEXT.md` now say so; the rolling average is declined. Left to fix: the axis starts at 1, so a Rating under 1.00 has no bar; the line is labelled "career" in a one-competition scope; the title should read "Rating history".
- **M** Three of four streak kinds (unbeaten, scoring, crown), each "now · best"; the 10b loading row (the tweak was left at idle); "Teams played for"; assisted-in and own-goal lines; an archived header.
- **m** Phone side strip is dark green text on grass; pinned cell truncates "Sunda…"; hero card not tilted 4°; tags 10 px; "2.27 · 74 rated".

### 11 Roster setup

- **B** "A roster needs 7: five and two subs". No size bound exists; the warning fires below the match format; "subs" is avoided. "Warn only 'Zeleni has 4 Players, short of 5-a-side'."
- **B** "Season 3 · starts 27.09.2026."; a Season has no start. "'no matches yet'."
- **B 11b** Archived Stari lavovi offered in the picker.
- **B 11c** Draw teams "by Season rating, snake", shows averages, says "Shuffle". "Average over each Player's last 10 Rated matches in the Group, unrated take the median, show each Team's sum, 'deal at random'."
- **M** Choosing the Players and Teams to draw; the Copy Entries sheet; the add-Players picker; Rename, Recolour, Remove on an Entry; the locked, Ended and conflict states; the two fill helpers on Draw the bracket.
- **m 11e** Generate schedule drawn over Roster setup (it lives on the League page); date not clearable; interval should be days, default 7.

### 12 League page

- **B 12c 12e** Regenerate offered with 14 Completed; it exists only on an Empty season and discards everything. "Redraw 12e on an Empty season; remove Generate and Regenerate once a match is Completed; no 'Managers get a note'."
- **B 12c** Remove last cycle enabled over Completed Fixtures; sublines "outside the Rounds", "joins from the next Round", "a third leg".
- **B 12b–e** Round headers carry dates; a Round has none.
- **B 12d** A Not played Fixture offers Change date, Move, Swap, Walkover and a generic Undo. "Only Restore."
- **B 12f** Rating count above played ("2.44 · 12" with 6 played); Zeleni Players credited with the Walkover; "Qualified from 4 matches" (it is a share of the Player's own Entry's matches, at least 3); "–" for unqualified rows.
- **B 12g** Minimum matches line on a League; "for the MVP award" (Pickup only); "Until Friday 20:00"; legs shown as a rule.
- **B 12h 12i** Impossible arithmetic: 18 + 6 from 20 Fixtures; played sums to 64 matches against "52 completed"; wins ≠ losses; goals for ≠ against; 3 titles from 2 closed Seasons.
- **M** The Champion mark on 12a (Bulls cannot be caught); overflow for a to-play, Walkover, Extra and Completed Fixture with the Walkover side chooser; Withdraw, Add a team, Extra Fixture, Set the Round's date sheets; a Roster setup entry; Member and Manager variants; a withdrawn Entry on a Current season; chips, search, Share and a named Team column on 12f; Records on All seasons.
- **m** Round 7 says "2 played" with one Not played and one Walkover; truncated status and Team names; the man-of-the-match crown reused for Champion; "Most titles" header invented; 12j and 12k "since Nov 2026" on an Empty season.

### 13 Knockout page

- **B 13c 13b** Redraw mid-Season "from the Semi-finals on". It exists only while no match is Completed; there is no draw per Round.
- **B 13b** Restore offered with three Rounds played since; Maroon is both a Walkover loser and "Withdrawn"; Withdraw subtitled as a Walkover only (it is the admin's choice, bye by default).
- **B R16-6** Not played, "pitch flooded", 2-1, and Sky advances. "Make it truly Not played: no score, nobody advances, QF4 shows '(3) Green advances'."
- **B 13a 13f** Legs vary by Round; it is one input per draw, only the Final and Third-place match always single.
- **B 13g 13h** "End the season?"; the act is End competition.
- **B 13f 13e** The same Rules errors as screens 6 and 12.
- **B 13h** "Semi-finalist", "out in QF", "Third place". "Winner, Runner-up, Third, Fourth, Quarter-finals, Round of 16, 'Round of 16, withdrawn'."
- **M** A phone section with the first Round open (bye lines, Walkover, Not played) and the Final with "Winner of SF1"; the per-Tie overflow; the path filter set to one Team; a Past season; Roster setup beside Draw the bracket on 13i.
- **m** "(4) Yel…" truncated on a desktop; Played above the Team's matches; Purple's record omits its Walkover; "rested" is League's word; ⋯ buttons 32 px; "Winner" printed twice.

### 14 Fixture form

- **B desktop** "Home Team" and "Away Team". "One 'Teams' label over the two plates, as the phone already has."
- **B 14c** Picker rows collapse to 24 px; phone sheet is partial.
- **M** A second leg level on aggregate with the first-leg line and the Shoot-out block; refusals for an undecided side and for a second leg before the first; the row sheet for a guest.
- **m** The Final is 15.11 and 2-2 here, 08.11 and 2-1 on screen 13; the guest is on the opponent's roster; "no-show · dropped" status text; "Lineup" and "Save Plavi lineup" where the brief says "+ add" and "Done"; Team name squeezed out of the phone header on 14d.

### 15 Teams

- **B 15c** Delete enabled on a Team with Entries. "Grey it: 'has Entries; archive instead'."
- **M** Archived-row overflow with Unarchive; the Merge sheet and its refusal; duplicate-name and colour-clash refusals.
- **m** Admin sidebar lacks Activity record, Group settings and the red bar; phone rows show the Format as a sliver with no word.

### 16 Team page

- **B 16a** "68% win rate" should be 72%; "2 titles · 1 final" should be 2 finals.
- **m** Panel titled "Honours" (a Player-page term; "Titles and finals"); "Semi-final" for "Semi-finals"; title collides with "3 Players"; rosters ellipsised; "1 Entries"; withdrawn marker in refusal red.

## Not drawn at all

From the brief's later screens: Members and invitations; join-link "who are you"; invitation accept; not a member; Competition settings with Seasons; Start new season and End confirmations; Activity record; Group settings; Account settings; Your career; Operator; mail templates. The Group switcher sheet appears on screens 3 and 4 only in passing; the open Account menu is not drawn.

## Decisions the docs do not make

- The shell on the Account home: which Group it shows, and what it shows for a person in no Group. Decided 2026-09-18: the Group it came from, else the one this device last opened, else Sunday Heroes with only the You tab (`13-frontend.md`, Outside a Group).
- Whether the Verify wall carries Sign out, and whether an invitee can dismiss an invitation. Decided 2026-09-18: the wall carries Sign out and no Change (`01-identity.md`); dismissing an invitation stays open.
- Whether the phone form hides the tab bar, and whether short sheets may be partial-height (`13-frontend.md` says full-screen). Decided 2026-09-18, as drawn: a form, a picker or a confirmation is a full-screen sheet; a menu, an overflow or Share, is a bottom sheet.
- "Change ballot" in the brief against the glossary's Replace; "Points" as a column against "points" retired from copy; "Share" against the glossary's avoid note. Decided 2026-09-18: the button reads "Replace ballot"; the breakdown keeps its Points column, the one place points show (`09-voting.md`); the glossary's Copy as text entry now avoids "Share" as the name of the control it sits under.
- Whether the Rated state also shows the turnout; where Copy reminder text lives (vote block or Share). Decided 2026-09-18: Rated shows the turnout as one line, "12 of 14 voted", opening the names; Copy reminder text is a button under the turnout and an item of Share (`13-frontend.md`).
- Which slot the first lineup row fills on the pitch. Decided 2026-09-18: the keeper, then back to front, each line left to right, as today's pitch draws it (`08-matches.md`).
- What the yellow panel shows on All seasons; whether a one-Season competition shows a selector; whether Rules show the draw inputs. Decided 2026-09-18, as drawn: the selector shows with one Season.
- Whether an unavailable act in an overflow is hidden or greyed with a reason. Decided 2026-09-18, as drawn: hidden when the role cannot use it, greyed with its reason when the state forbids it (`13-frontend.md`, Overflow menu). Whether the original second leg counts as a removable cycle; whether a Not played or a Walkover carries a free-text reason. Decided 2026-09-18: the reason is the match's note, offered by the Walkover and Mark Not played confirmations and shown beside the mark (`06-league.md`).
- Whether ranks and counts follow the search or the scope. Decided 2026-09-17: the Player page's competition filter rescopes the whole page, as drawn (`10-stats.md`). Decided 2026-09-18: on the Players table a search keeps scope ranks, "3 of 15 Players"; the competition, Format and percentage filters define the scope and re-rank (`10-stats.md`).
- Unqualified rows: greyed values (`10-stats.md`) against "–". Closed 2026-09-18: greyed values, since the doc wins; "–" is only for a Player with no Rated match.
- Footballs: `13-frontend.md` says yellow, `balls.png` is orange-red. Decided 2026-09-18: orange-red `#f93a07`, as the asset draws them.
