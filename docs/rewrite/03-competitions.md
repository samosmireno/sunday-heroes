# Competitions and formats

_Branch session 3, 2026-09-11. Output of the fourth `/grill-with-docs` session for the rewrite. Takes `00-map.md`, `01-identity.md` and `02-groups.md` as settled; settles the open questions under area 3 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

A Competition is a named run of matches inside a Group with one Format, its own settings, its Managers and a history of Seasons. It is the thing a Group creates when a new run of games starts: the Tuesday five-a-side, the summer league, the one-off cup. It draws every lineup and roster from the Group's Player pool, it decides whether its matches are voted on, and it is the unit a Group admin configures, ends and deletes.

## Decisions carried in from the map

- Three Formats under one Competition concept: Pickup, the Squad format; League and Knockout, the Team formats.
- Settings are editable after creation and apply forward: a change applies to matches created after it and never rewrites the past. This session owns that rule.
- Voting is a per-competition switch, chosen at creation and editable later.
- Match format is per match in Pickup and a competition setting in team formats. This session owns that rule.
- Minimum matches replaces the Voting threshold: Pickup only, counted across Seasons, editable.
- A draw is a result; penalties exist only in a one-leg Knockout match. Amended in `07-knockout.md`: in the deciding match of a Knockout Tie, which with two legs is the second leg.
- Seasons for every Format; a Past season is read-only; every new match lands in the Current season.
- From the groups session: creating a competition is not on the role table and is settled here; changing settings, rolling a Season, deleting and assigning Managers are Group admin acts; a Manager records matches, runs Roster setup and generates schedules; the Group carries a default Pickup match format; every act that changes what someone may do goes in the activity record.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Creation is split by type.** A general create endpoint refuses League, and a separate League endpoint creates the competition, Season 1, placeholder teams and the whole schedule in one transaction. The general endpoint accepts Knockout and creates an empty shell for it; only the form hides the option. The list's Knockout filter tab is commented out.
- **Every setting is write-once.** There is no competition update endpoint at all; the only updates in the app are League team names and matches. The create form warns that the type cannot be changed later, and the competition admin page has a moderators tab and a settings tab holding the season card, Reset and Delete, with no editable setting of any kind.
- **Two settings are stored and never read**: `minPlayers`, hard-coded to four by the client, and a Knockout voting period. The voting period defaults to 3 days on the form and to 7 in the code's fallback; the reminder lead defaults to 2 and must be shorter than the period.
- **Match type is a four-value enum** (five, six, seven and eleven-a-side) stored on every match and on League competitions, and it validates nothing anywhere. The only lineup rule is a client-side minimum of four players per side, unrelated to the type; the server accepts an empty lineup. The League form's copy "used to validate team sizes" is true of no code path.
- **The League team count has three lower bounds**: three in the client schema, two on the input element, two on the server with no upper bound. Team names are accepted by the League schema and ignored by the service.
- **Deletion is admin-only** and runs as three steps outside a transaction: delete teams used nowhere else, delete the competition, prune every player in the dashboard with no match rows and no account.
- **The list is ordered by creation date only**, search is a prefix match, and all five competition read endpoints carry no authentication.
- **Season 1 is created in the competition's transaction.** Start new season needs one match, completed or not, zeroes League counters in place and generates nothing for the new Season.
- **Production holds five competitions, all Duel**, so match type, round-robin flag and Knockout period are null on every live row.

## The model

### Competition

A Competition has a **name**, a **Format**, its **settings**, its **Managers** and its **Seasons**. It belongs to one Group and draws from that Group's Player pool; nothing registers a Player to a competition.

**Creation** is a Group admin act. The form asks for the name, the Format and the voting switch; a team format also asks for the match format, prefilled from the Group's default. Everything else has a default and is edited later. Creation opens Season 1 in the same act. A team format's next step is Roster setup and schedule or bracket generation, owned by the teams, League and Knockout sessions.

**Name**: 1 to 50 characters, unique within the Group ignoring case and surrounding or repeated whitespace, with the typed casing kept, the same rule as nicknames. A competition is picked from a list by its name, so two "Sunday League" entries in one Group would be a mistake rather than a choice. No description, icon, colour, slug or dates: Seasons carry the dates.

### Format

Chosen at creation and never changed. There is no edit control and no conversion path in either direction; the settings screen shows the Format as a read-only line. A Group that started a Pickup and wants a League creates a League; the pool is shared, so nothing is lost but the old matches, which belong to the old competition anyway.

| Format   | Kind         | Sides                                  | Table                           |
| -------- | ------------ | -------------------------------------- | ------------------------------- |
| Pickup   | Squad format | Picked from the pool for each match    | Player table                    |
| League   | Team format  | Fixed teams with rosters, per Season   | Standings and player stats      |
| Knockout | Team format  | Fixed teams with rosters, in a bracket | Bracket, a winner, player stats |

A Format is visibly distinguishable everywhere a competition appears; how is the frontend session's call, not a fact of the domain. Settled in `13-frontend.md`: a skewed Format tag that always carries the word, in a colour family per Format, Pickup blue, League green, Knockout orange-red.

### Match format

A **Match format** is a number of players per side on the pitch, an integer from 3 to 11, named "N-a-side" in copy so the name never drifts from the number. No named list, no free text.

- **In Pickup** it is a fact of each match, chosen when the match is added and prefilled from the competition's **usual match format**.
- **In a team format** it is a competition setting inherited by every Fixture. It may be changed only while the Current season has no matches at all, right after a rollover and before the schedule or bracket is generated, so every Fixture of a Season shares one size and the map's reason for fixing it stays intact.

**The lineup rule.** The match format is the number on the pitch, not a ceiling on the lineup. Eleven people at a five-a-side play six against five, recorded as five-a-side with one substitute; the formation places five and the sixth sits on the bench, and everyone in the lineup played. The map's "no substitutes" stands in its original sense: no substitution events, no minutes. The server enforces, at completion, that each side has at least one player and at most twice the match format; more than that on one side is a typing error, not a match. A side short of the format is allowed and only warned about in the form, because a short side is a real Sunday. The one exception is a Walkover (settled in `06-league.md`): a Fixture completed by award, 3-0 to the side that turned up, with no lineup at all.

**Usual match format.** A Pickup competition carries a usual match format, seeded from the Group's default when the competition is created and editable afterwards. The match form prefills from it. A Group with a five-a-side Tuesday competition and a seven-a-side Sunday one no longer fights a single Group default every week; the Group default only seeds new competitions, and changing it touches no existing competition.

### Settings

What this session calls a setting is something true of the competition across every Season. The number of teams, single or double round robin, bracket size and seeding are not settings: they are inputs to the schedule or bracket generation act of one Season, prefilled from the previous Season, and belong to the League and Knockout sessions. That keeps a bracket of eight one year and sixteen the next from being a settings change.

| Setting            | Pickup    | League | Knockout | Values and default                        | Editable                                     |
| ------------------ | --------- | ------ | -------- | ----------------------------------------- | -------------------------------------------- |
| Name               | yes       | yes    | yes      | 1 to 50 characters, unique in the Group   | yes                                          |
| Format             | fixed     | fixed  | fixed    | Pickup, League or Knockout                | never                                        |
| Match format       | per match | yes    | yes      | 3 to 11, prefilled from the Group default | only while the Current season has no matches |
| Usual match format | yes       |        |          | 3 to 11, seeded from the Group default    | yes                                          |
| Voting             | yes       | yes    | yes      | on by default for every Format            | yes                                          |
| Voting period      | yes       | yes    | yes      | whole days, 1 to 14, default 3            | yes                                          |
| Minimum matches    | yes       |        |          | off by default, or 1 to 20                | yes                                          |
| Award threshold    | yes       | yes    | yes      | a percentage, 50% by default              | yes, a Season rule (see `10-stats.md`)       |
| Managers           | yes       | yes    | yes      | Members, picked on creation or later      | yes                                          |

Settings that do not exist on the row: `minPlayers`, a per-Format voting period, a reminder lead time. The reminder is an Account preference, settled by the notifications session; the competition only says when voting closes.

**Voting period** counts from the completion act, not from the match date. A Sunday match recorded on Tuesday with a three-day period closes at the end of Friday in the Group's time zone. Late recording is the recorder's fault and does not shorten the players' vote. The voting session may add closing on the last ballot on top. Settled in `09-voting.md`: it does, once every voter has a ballot, own or on behalf, with Close now and Extend for a stuck vote.

**Minimum matches** is hidden entirely on team formats rather than shown disabled. A change applies to matches created after it, even while a vote is open on an earlier match.

**Award threshold** (settled in `10-stats.md`) is the share of a Season's matches a Player must have played to be Qualified for that Season's MVP, Honours and Records: of the Season's Completed matches in Pickup, of their Entry's in a team format. It is a Season rule, not a fact of a match, so "applies forward" means the Current season and later: a change takes effect on the Current season at once and a Past season keeps the value in force when it closed.

Voting is on by default for every Format. A default is a form prefill, not a commitment about shape: if the voting session makes team-format voting per team, the switch still means "voting happens here". Settled in `09-voting.md`: team-format voting keeps the Pickup shape, one electorate and one crown per match.

### Settings apply forward

The rule this session owns, stated for every other session to lean on:

> A match carries the competition settings in force when it was created: the voting switch, the voting period, the Minimum matches value and the match format. A settings change never rewrites them.

Consequences:

- Turning voting off leaves every open vote running to its deadline; matches added afterwards have no vote.
- Turning voting on affects matches added afterwards only; earlier matches never get a vote retroactively.
- A new voting period applies to matches added afterwards; an open vote keeps its deadline.
- The settings screen says "applies to matches added from now on".

Whether this is a snapshot on the match or a versioned settings record is the architecture session's choice; the domain only requires that the answer to "what rules did this match have" never changes. Settled in `12-architecture.md`: a snapshot, three columns on the match stamped at creation, with the Award threshold stamped on the Season at close (ADR 0008).

### Managers

Managers are picked on the create form and on the settings screen, from the Members list, as well as from the Members page. Assignment stays a Group admin act, and every Group admin is implicitly a Manager of every competition. A Manager's scope on a competition is the groups session's role table: record, edit and complete matches, Roster setup, generate a schedule or draw a bracket, ballots on behalf, create and rename unlinked Players, issue Player invitations. Settings, End, deletion and Manager assignment stay with admins, because a settings change applies forward and is the kind of thing a group argues about.

### Life cycle: Active and Ended

A competition is **Active** while it has a Current season, which every competition has from birth. **End competition** is the Group admin act that closes the Current season without opening the next; it is the sibling of Start new season and reuses its machinery. An **Ended** competition has no Current season, so it is read-only by the same rule a Past season already has: nothing new to check on every query, no archive flag.

- **End** requires at least one Completed match in the competition, a Walkover included; an empty competition is deleted, not ended. An empty Current season, one with no Completed match since the last rollover, is discarded on End rather than closed, together with its unplayed Fixtures and roster drafts, so no empty Season appears in history and the last played Season is the last one. Fixtures not completed at End become Not played, as at a rollover (settled in `04-seasons.md`). Voting open at that moment runs to its deadline.
- **Ended** allows reading everything, counts in every stat, and accepts four writes: **Start new season**, which reopens it as Active with the next Season number; **Reopen last season**, which reopens it as Active with its last Season, since nothing has been played after it (settled in `04-seasons.md`); a **Correction** on a match of any of its Past seasons; and deletion. Settings, Managers and Roster setup are frozen until it is reopened; a settings change on an Ended competition has nothing to apply forward to.
- **A Knockout is never ended automatically** when the final completes. Ending is always the admin's act; the Knockout page suggests it once the final is completed, which costs nothing and leaves room for a last correction.

### Deletion

A hard delete by a Group admin, after re-authentication and a confirmation screen listing what goes: the Seasons, the matches, the ballots, the Manager assignments. Players are untouched and nothing is pruned, matching the groups session. Nothing else references a competition, so nothing is tombstoned. Same style as Group and Account deletion: immediate, re-authenticated, no grace period.

### Activity record

Creation, every settings change with the old and new value, Manager assignment and removal, End, reopening and deletion are entries in the Group's activity record, naming the acting Account. This is what makes editable settings safe to offer, the same argument the groups session made for merge.

### What Members see

Every read is scoped to a Group the Account belongs to; the unauthenticated reads of today are gone with the identity session's members-only rule.

- **The list** shows Active competitions ordered by most recent completed match, with Ended competitions in a section below. No manual ordering, no favourites.
- **The competition page** shows a read-only summary of its rules to every Member: Format, match format or usual match format, voting on or off, voting period, Minimum matches in Pickup only, Award threshold, the Managers. Members today cannot see the rules they play under, and this is the place to point at when someone asks why they cannot vote yet.
- **The settings screen** is for admins and holds the editable settings, the Managers, End competition and deletion.

## Scenarios that shaped the model

- **Tuesday five-a-side and Sunday seven-a-side, one Group.** Two Pickup competitions with different usual match formats; the Group default seeded both and is never fought again.
- **Eleven turn up to the five-a-side.** Recorded as five-a-side, six against five, one substitute on the bench. The server accepts it; a side of eleven would be refused.
- **The League goes seven-a-side next year.** Roll the Season, change the match format while the new Season is empty, run Roster setup, generate the schedule.
- **A one-off cup.** A Knockout competition; after the final is completed the page suggests End, and the admin ends it. It stays readable and its stats count.
- **"Can we just record a casual match?"** A Pickup competition with voting off. There is no match outside a competition.
- **Voting turned off during an open vote.** The open vote runs to its deadline; the next match has none.
- **A competition created by mistake.** Delete it; End is refused because it has no matches.
- **A competition created as the wrong Format.** Create the right one; the pool is shared and the wrong one is deleted.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Group admins create competitions**, picking Managers on the same form.
- **Names unique within the Group**, normalised like nicknames.
- **Format immutable**, stated in the glossary and shown as a read-only line.
- **Team count, legs, bracket size and seeding are Season generation inputs**, not competition settings, prefilled from the previous Season and owned by the League and Knockout sessions.
- **Match format as an integer, 3 to 11**, named "N-a-side" by derivation.
- **The match format is the number on the pitch, not a lineup ceiling**; the server enforces one to twice the format per side at completion and the form warns on a short or uneven side.
- **Match format on a team format changeable while the Current season is empty**, so a League can change size at rollover.
- **Usual match format on a Pickup competition**, seeded from the Group default, which then only seeds new competitions.
- **Voting switch and voting period as the competition's voting settings**, 1 to 14 whole days, default 3, counted from the completion act; the reminder leaves for the notifications session as an Account preference.
- **Voting on by default for every Format.**
- **Minimum matches off by default, 1 to 20 when on**, hidden on team formats.
- **The apply-forward rule stated as "a match carries the settings it was created under"**, with the open-vote consequences spelled out.
- **End competition instead of an archive flag**: close the Current season without opening the next, Active and Ended as the two states, Start new season as the reopening act.
- **Hard delete with re-authentication and a confirmation screen**, Players untouched.
- **Activity record entries** for creation, every settings change, Managers, End, reopening and deletion.
- **The list ordered by most recent completed match**, Ended competitions in a section below.
- **A read-only rules summary on the competition page** for every Member.
- **Per-Format look left to the frontend session**; the domain says only that Formats are distinguishable.
- **A Knockout is ended by the admin, not automatically**, with a suggestion after the final.

### Declined, and why

- **Any Member may create a competition.** Creation is where Format and voting are chosen, and those are admin decisions already.
- **Exact-size lineup validation.** A short side and a substitute are both real; only an absurd side is refused.
- **An archive flag.** A soft-delete flag on every query is what the groups session declined for Groups; End reuses the Seasons rule instead.
- **Duplicate a competition as a template.** Seasons cover recurrence.
- **Start and end dates on the competition.** Seasons carry the dates.
- **A competition-level reminder setting.** Reminding is a preference of the person being reminded.
- **A match outside any competition, a "friendly".** Every stat and vote hangs off a competition; a Pickup with voting off is the friendly.
- **Further Formats now**, such as a group stage feeding a Knockout. Noted as a later Format, as the map already says.
- **Converting a competition between Formats.** Create the right one.
- **Description, icon, colour, slug**, and a custom colour per competition.
- **Automatic End of a Knockout** on the final's completion.

## Hand-offs to other sessions

- **Groups (2)**: applied to that document in this session: the Group default match format seeds new competitions and the Pickup match form reads the competition's usual match format; the role table names creating and ending a competition as admin acts; Manager assignment gains a second entry point on the competition's create form and settings screen.
- **Seasons (4)**: End competition as the sibling of Start new season, sharing its implementation and its rule for unfinished Fixtures; an empty Current season is discarded on End; Start new season on an Ended competition reopens it with the next number; Season numbering continues across an End and a reopening. Settled in `04-seasons.md`, which also adds Reopen last season: an Ended competition whose last Season closed with nothing played since may have that Season reopened instead of a new one started.
- **Teams and rosters (5)**: whether roster bounds reference the match format; Roster setup is frozen on an Ended competition. Settled in `05-teams.md`: a roster has no hard bounds and the form only warns below the match format; a Team is a Group record, so its name and colour stay editable while its competition is Ended.
- **League (6) and Knockout (7)**: team count, legs, bracket size and seeding are generation inputs per Season, prefilled from the previous Season, with today's three inconsistent team-count bounds as evidence to replace; match format changes only while the Current season has no matches; the Knockout page suggests End after the final. Settled for League in `06-league.md`: legs are single or double, with Add a cycle appending a further cycle to a running Season; at least two Entries and no maximum; a Walkover is a Completed match, so it satisfies the one-Completed-match precondition of End competition and Start new season. Settled for Knockout in `07-knockout.md`: any count of Entries from two, byes to the next power of two; seeding, legs and a third-place match are Draw inputs prefilled from the previous Season; the End suggestion after the Final stands.
- **Matches (8)**: the lineup rule enforced at completion, at least one and at most twice the match format per side; the formation places the match format's number and the rest are substitutes, whose bench placement and position are that session's call; the Pickup match form prefills from the usual match format; a match carries its settings snapshot. Settled in `08-matches.md`: the lineup rule is checked at completion and re-run on every edit; a formation from a fixed list per match format places the first rows and the rest are the bench, position being presentation only; a Pickup match's match format is an editable result fact, refused where a side would exceed twice the new size.
- **Voting (9)**: the voting period counts from the completion act and the deadline is the end of the last day in the Group's time zone; closing on the last ballot may sit on top; Minimum matches semantics as in the glossary; a substitute played and votes. Settled in `09-voting.md`: all adopted; the last ballot closes the vote once every voter, linked or not, has one; Extend may push a deadline to at most 14 days after completion, the same bound as the voting period; a Player below Minimum matches stays on the ballot and the match being voted on counts toward it.
- **Stats (10)**: substitutes count as having played; Ended competitions count in every total. Settled in `10-stats.md`: both adopted; Award threshold joins the settings table above as a Season rule, 50% by default for every Format.
- **Notifications (11)**: the reminder is an Account preference; the competition contributes only the deadline. Settled in `11-notifications.md`: the Vote reminder, off by default, one switch per Account, sent within 24 hours of the Voting deadline.
- **Architecture (12)**: snapshot versus versioned settings for the apply-forward rule; Active and Ended derived from the Seasons, never stored; the normalised unique name index per Group; the lineup cap enforced on the server. Settled in `12-architecture.md`: a snapshot, three columns on the match stamped at creation, with the Award threshold stamped on the Season at close (ADR 0008); Active and Ended derived from the Seasons; the competition name as a functional unique index per Group; the lineup cap as one of the completion checks in the pure `domain` package, run inside the Complete act.
- **Frontend (13)**: the per-Format look; the create form per Format; the rules summary; the list's two sections; the settings screen with its "applies from now on" copy. Settled in `13-frontend.md`: a colour family per Format on a skewed tag that always carries the word, Pickup blue, League green, Knockout orange-red; the create form offers the three Formats as sticker choices; the rules summary is the Rules tab of the competition page; the list shows Active competitions with Ended below a heading; the settings screen is behind a gear for admins.
- **Data migration (15)**: every Duel becomes a Pickup, Active, with its voting switch, period and threshold carried over as voting, voting period and Minimum matches; the usual match format from the most common match type of its matches, else the Group default; `minPlayers`, the reminder lead and the Knockout period are dropped. Settled in `15-migration.md`: as stated, with a null voting period becoming the default 3, Minimum matches read from the live threshold column, and 5-a-side as the only match format in the data.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Competition, Format, Squad format, Team format, Pickup, League, Knockout, Match format, Usual match format, Voting period, Minimum matches, Active competition, End competition, Ended competition. "Match type", "competition type", "reset" and "archive" are retired. "Format" alone always means the competition's; the per-side size is always "match format".
