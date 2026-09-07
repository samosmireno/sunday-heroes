# Voting threshold

_2026-09-07._

An admin creating a Competition can now set a **Voting threshold**: the number of
Completed matches a player must have played within a single Season of that
Competition before their ballot is accepted. Leave the field blank and the
Competition votes exactly as every Competition votes today.

## The promise

**No Competition acquires a threshold, no vote already cast is discarded, and no
rating that any vote produced is ever changed.** Every Competition that exists
today has no Voting threshold, and there is no way for one to acquire a
threshold afterwards: it is chosen when the Competition is created and never
changed.

## Setting one

The threshold sits in the Voting section of the create-competition form, beside
the voting period and reminder settings, and it is optional. The form reads back
what the number will mean for the Competition being created — how many Completed
matches have to be played before it starts applying, and, for a League, whether
that Season's Fixtures can carry a threshold that high at all.

It is counted **per Season and never pooled**: four matches in one Season and
four in the next is not eight. A player who has reached it in any Season of the
Competition has reached it for good, because a Past season's matches never
change.

## The runway

A threshold does nothing on the day the Competition is created — nobody has
played anything yet, and a gate that shut immediately would shut against
everyone. It starts applying only once **both** of these are true: the
Competition has at least twice its threshold in Completed matches, and at least
one player has reached the threshold.

Until then every participant votes as though there were no threshold, and those
matches count toward qualification like any other. Nobody is grandfathered in:
the bar when the gate arms is "played half the runway".

## Once it applies

A player who has not reached the threshold:

- cannot submit votes — including when an admin or moderator submits on their
  behalf;
- is not sent the voting invitation or the reminder;
- **stays on the ballot.** The gate decides who gives votes, never who receives
  them: they can be voted for and can be man of the match like anyone else.

They are told where they stand rather than being turned away. The vote page
shows them the ballot, read-only, over a note saying how many Completed matches
they have played this Season and how many the Competition asks for. The matches
list carries the same count on the vote button, disabled. An admin's
pending-votes list shows a standing against every player's name, so a name that
is never going to vote is visible as such instead of quietly missing.

Voting on a match closes on the last ballot the gate accepts, rather than
waiting on players who cannot vote for ballots that were never coming. A match
already part-way through its voting when the threshold starts applying is the
exception: it keeps its deadline and closes then.

## If you change your mind

Voting settings cannot be edited after a Competition is created, the threshold
among them. Reset competition clears it along with everything else: it deletes
every Match, so the Competition is back on the runway with no Eligible voters.
