# Settings apply forward by snapshot

A match carries the competition settings in force when it was created as three columns stamped at creation and never rewritten: the voting switch, the voting period and Minimum matches. The Award threshold, a Season rule, is stamped on the Season by Start new season and End competition, so a Past season resolves the value it closed under. The competition row holds the current values, and the Group's activity record holds every old and new value, which is the history.

## Considered options

A versioned settings table joined by time on every read was rejected: it is more general than the domain needs, it puts a temporal join under every read of a match, and the activity record already keeps the history. The snapshot is exactly what the competitions session says: "a match carries the settings it was created under."
