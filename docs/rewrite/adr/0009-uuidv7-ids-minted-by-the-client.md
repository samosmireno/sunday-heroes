# UUIDv7 ids minted by the client on creates

Every table's id is a UUIDv7, and every create mutation (Add match, Save, a ballot, a Player, a Team, a Group, a competition) takes the id from the client, which mints it. A request retried after a dropped connection carries the same id, finds the row already created, and answers as the first request did.

## Why

The most-used screen is a match form on a phone at a pitch. The duplicate warning of the matches session catches the human double entry; this catches the network one, without an idempotency-key mechanism beside the id. UUIDv7 sorts by time, is safe in URLs and exposes no count. Bigint serials were rejected because the client cannot mint them, which is the whole point.
