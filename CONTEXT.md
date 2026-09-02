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
A closed Season. Its Matches are history, viewable by selecting that Season.
_Avoid_: Previous season, archived season, old season

**Start new season**:
The admin act that closes the Current season and opens the next one in a single step. Also called a rollover.
_Avoid_: Finish season, end season, close season (there is no separate closing act), new season (as a verb)

**Reset competition**:
The existing destructive act that deletes every Match of a Competition, across all Seasons, and returns the Competition to a fresh Season 1. Distinct from Start new season.
_Avoid_: Clear competition, wipe

**Standings**:
The League table for the Current season only. Not kept per Past season.
_Avoid_: League table, ranking, ladder
