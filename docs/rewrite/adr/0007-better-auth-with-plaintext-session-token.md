# better-auth, with the session token in plaintext at rest

Identity is better-auth on the Drizzle adapter, the app's migrations owning its tables. It provides Google by subject id with linking to a verified password Account, mandatory email verification, neutral responses, database sessions with a session list and sign out everywhere, Origin checks, database-backed rate limits and additional fields on the Account. Four requirements of `01-identity.md` are custom code on top of it: the one-year hard cap on a session, the ten-minute re-authentication window with a `reauthenticate` procedure that stamps the session row, the purge of Accounts unverified after seven days, and the standard `Retry-After` header. Its admin plugin is not used; the Operator stays a configuration allowlist with its own procedures, so impersonation never exists.

## The deviation

The identity session settled that the session id is stored hashed. The library stores the session token in plaintext at rest and offers no option to hash it. This is accepted: a read of the sessions table already implies a read of everything those sessions protect, so hashing there buys little in this app, and the alternative was a hand-rolled auth on primitives where every flow is ours to write and maintain. `01-identity.md` records the deviation beside the original rule.
