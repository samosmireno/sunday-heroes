# Migrated Accounts are verified and have no Sign-in method

The one-time data migration inserts every User of the old app as an Account whose email is verified and which has no Sign-in method: no password hash migrates and no Google subject id exists to migrate. Google attaches on the person's first Google sign-in, by subject id, under the identity session's rule for a verified Account; a password is set through forgot password, which creates the credential row. The old database is deleted 30 days after cut-over, after which neither half can be revisited.

## Why

- 41 of 51 Accounts are Google-only. The auth library links a Google sign-in to an existing user only when the local row is verified; unverified, they could not sign in at all.
- The 10 password Accounts hold bcrypt hashes. Carrying them means a bcrypt dependency and a verifier that branches on the hash prefix, in a codebase built to have neither, for ten people of whom nine never returned after sign-up. Forgot password already serves an Account with no credential row.
- Marking those ten unverified instead would put them behind the verify wall on day one and the seven-day purge behind it, to close a takeover that needs someone to have registered a friend's address a year ago. The Migration report lists the ten by id for a look.

## Consequences

- The glossary's Account entry carries the exception: an Account has one or two Sign-in methods, except a migrated Account, which has none until its first sign-in. The Operator's Account section shows it as such.
- The cut-over chat message tells password users to use forgot password once.
