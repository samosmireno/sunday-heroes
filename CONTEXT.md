# Sunday Heroes

A platform where a dashboard admin runs football competitions (League, Duel, Knockout) for a group of players: matches are recorded, standings and player stats are derived from them, and players vote on each other after matches.

## Language

### Competition lifecycle

**Season**:
A numbered span of a Competition's life to which every Match belongs. Seasons are numbered from 1 and have a start date and, once closed, an end date. Both dates mark the admin's acts (creating the Competition, Start new season), not the dates of the Matches played in it.
_Avoid_: Period, edition, campaign, year

**Current season**:
The one open Season of a Competition. New Matches always land in it.
_Avoid_: Active season, live season

**Past season**:
A closed Season. Its Matches are history: viewable by selecting that Season, never changed. Voting that was open when the Season closed runs on to its deadline.
_Avoid_: Previous season, archived season, old season

**All seasons**:
The whole of a Competition's history across every Season, viewable as one set of Matches, stats and Standings.
_Avoid_: All time, overall, total

**Start new season**:
The admin act that closes the Current season and opens the next one in a single step. Also called a rollover.
_Avoid_: Finish season, end season, close season (there is no separate closing act), new season (as a verb)

**Reset competition**:
The existing destructive act that deletes every Match of a Competition, across all Seasons, and returns the Competition to a fresh Season 1. A League keeps its teams and goes back through Teams setup. Distinct from Start new season.
_Avoid_: Clear competition, wipe

**Standings**:
The League table of a Season: its teams ranked by points, then goal difference, then goals for, then team name. Every Season has one, Past seasons included.
_Avoid_: League table, ranking, ladder

**Teams setup**:
The admin step, taken once per Season, that names a League's teams and generates that Season's Fixtures, unless they were already created with the Competition.
_Avoid_: Team names page, league setup

### Matches

**Fixture**:
A League Match created in advance when a Season's schedule is generated, to be played later.
_Avoid_: Game, scheduled match

**Completed match**:
A Match the admin has marked as completed. Only Completed matches count toward Standings and player stats; a Fixture that is not yet a Completed match is "not completed", whether or not a result has been entered.
_Avoid_: Played match, finished match, unplayed (as a state)

### Voting

**Voting threshold**:
The number of Completed matches a player must have played within a single Season of a Competition before they may vote in it. Chosen once, when the Competition is created, and never changed afterwards; a Competition may have none, in which case everyone who played a match votes on it. Counted per Season and never pooled: four matches in one Season and four in the next is not eight.
_Avoid_: Minimum matches, vote threshold, eligibility threshold, quota

**Eligible voter**:
A player who has reached a Competition's Voting threshold in some Season of it. Permanent once earned, because a Past season's matches never change. Once the Voting gate is armed only an Eligible voter's ballot is accepted, but every participant stays on the ballot: a player who cannot vote can still receive votes and be man of the match.
_Avoid_: Qualified player, verified voter, regular, member

**Voting gate**:
The state of a Competition in which only Eligible voters may vote. It arms once the Competition has at least twice its Voting threshold in Completed matches and at least one Eligible voter exists — both, not either. Before it arms, during the runway, every participant votes as though there were no threshold, and those matches count toward qualification like any other, so nobody is grandfathered in.
_Avoid_: Voting lock, restriction, gating (as a state)

### Player stats

**Win rate**:
A player's wins plus 0.3 per draw, as a percentage of the matches counted: one Competition's matches in its stats table, every match in the career record, and the matches played together for a Top Teammate. A level score settled on penalties is a win or a loss, not a draw. Computed on the server, through one helper, whenever a response is built; never stored.
_Avoid_: Win percentage
