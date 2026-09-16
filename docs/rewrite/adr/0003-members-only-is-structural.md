# Members only is structural

Every read and write is scoped to a Group the Account belongs to, and this is a property of the code's shape, not a check per route. The tRPC procedure builder exports exactly six tiers (`public`, `account`, `member(groupId)`, `manager(competitionId)`, `groupAdmin(groupId)`, `operator`) and nothing else, so a procedure cannot exist without declaring its scope; each tier resolves the Membership row, the Manager assignment or the admin flag before the handler runs. Every Group-owned table carries `group_id` directly (matches, lineup rows, ballots, Entries, roster spots, change records, invitations), and every query filters on the Group from the request context, so an id from another Group is simply not found. A test enumerates every procedure in the router and asserts its tier, so a procedure on the wrong tier fails CI.

## Considered options

Postgres row-level security as a second fence was rejected: a session variable per request and a policy per table for a solo project, when the tiers, the denormalised `group_id` and the enumeration test already make "not yours" and "does not exist" the same answer. The denormalised `group_id` is the part that is hard to retrofit, which is why it is decided here.
