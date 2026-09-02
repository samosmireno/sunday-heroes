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
The League table of a Season: its teams ranked by points, then goal difference, then goals for. Every Season has one, Past seasons included.
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
