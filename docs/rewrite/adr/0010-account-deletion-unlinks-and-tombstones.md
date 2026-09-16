# Account deletion unlinks Players and tombstones actors

Deleting an Account removes the Account row, its sign-in methods, sessions, security events, Deliveries and preferences, and nothing else. Every Player the Account had claimed stays in its Group as an unlinked Player with every match, stat and ballot intact, because a ballot is the Player's act on the Group's record, not the Account's. Every append-only record that names the Account as an actor (invited by, entered on behalf of, recorded by, every activity and change record entry) keeps its row with the actor column set null (`ON DELETE SET NULL`): the row itself is the marker that an Account acted, without a name. Deletion is refused while the Account is the only Group admin of any Group.

## Why

The identity session asked for this ADR because it is the one decision that is hard to reverse once data has been deleted the other way: the current app's only delete function cascades to the whole Dashboard, every match and every ballot in it. The Group's record is the Group's; a person leaving takes their identity and leaves the history.
