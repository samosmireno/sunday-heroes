# Architecture

_Branch session 12, 2026-09-16. Output of the thirteenth `/grill-with-docs` session for the rewrite. Takes `00-map.md` and `01-identity.md` through `11-notifications.md` as settled; settles the open questions under area 12 of the map and records the proposals put to the user, accepted and declined. The hard-to-reverse choices are recorded as ADRs in `docs/rewrite/adr/`. Nothing here is code._

## Purpose

The stack and the shape of the code: one language end to end, one contract between client and server, and a data model that serves derived Standings and Ratings. This session turns the domain sessions' demands into a structure that makes each of them the default rather than a discipline: nothing derived is stored, members only is a property of the procedure builder, every multi-row act is one transaction, two admins at once produce one outcome, append-only records name their actors, scheduled work runs outside the request process, and the contract between client and server is inferred from one router rather than kept in step by hand. It also fixes the repository, the workflow an agent follows to build it, and the testing strategy that makes the branch documents' role tables and refusals executable.

## Decisions carried in from the map

- TypeScript end to end is the only constraint on the stack. The shared-types package was a workaround for one contract across client and server; this session finds the proper mechanism.
- The rewrite reuses no code. The current repo was read for behaviour only; no module boundary, table shape, endpoint name or layering carries over.
- Operational rigour: staging, migrations as a deliberate deploy step, a health check, error tracking, automated backups, scheduled work outside the request process. Hosting is open and belongs to the operations session. Settled in `14-operations.md`: Render, with a production and a staging environment.
- Members only: every read is scoped to a Group the Account belongs to. The identity session owns the rule; this session makes it the default rather than a per-route check.
- Ratings and man of the match are derived from ballots at read time; Standings are derived from Completed matches, never counted.
- A settings change applies forward: a match carries the settings it was created under.

What the domain sessions handed to this session, gathered:

- **Nothing derived is stored.** Standings with head-to-head and the champion mark, Ratings with the floor and the crown, the results breakdown, the Turnout, the voting record, Form, streaks, Records, Honours, the Season summary, the played span, an Entry's Result, the teams still in, the All seasons tables, Qualified, Your open votes, Your career, and the Active or Ended state of a competition: every one a read over Completed matches, closed votes and Memberships.
- **Invariants the database must hold.** One open Season per Competition; nickname, competition name, Team name and Season label unique under the normalised rule; one Entry per Team per Season; one roster spot per Player per Season across the Season's Entries; one open ballot per voter per match; a Shoot-out present if and only if the match is a level Deciding match.
- **Acts that are one transaction.** Complete with the Knockout progression and the eight checks; Un-complete with the next-Tie guard; Merge of Players and of Teams; Start new season, End competition and Reopen last season; Generate, Regenerate, Add a cycle, Draw, Redraw, Add a team, Withdraw and Restore; the last-ballot close evaluated with the ballot write.
- **Two at once.** Two admins rolling a Season, two Managers generating a schedule or drawing a bracket, two Managers saving one match or one Roster setup: one outcome, and a stale form must never silently drop the other's rows.
- **Append-only records with tombstoned actors.** The Group's activity record, the match's change record, the Account's security events, and Deliveries.
- **Scheduled work and mail.** The deadline close, the hourly reminder sweep, the purge of unverified Accounts, session expiry, Delivery retention, and an outbox with retries behind a provider's HTTP API and webhooks; a mail catcher in every non-production environment.
- **Reads that are private by construction.** A ballot's picks visible only to its Player and, when entered on behalf, to Managers and Group admins; Your career and Your open votes scoped to the Account across its Memberships.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **The contract is a hand-kept package.** `packages/shared-types` is built with Bunchee and must be rebuilt before either app sees a change; CI builds it as a separate step and the Dockerfile re-links the workspaces after building it. Nothing checks that a handler's response matches the interface the client imports.
- **The database cannot state the domain's invariants.** The one partial unique index that exists, one open Season per Competition, is custom SQL in a migration that the Prisma 6 engine cannot see; nickname uniqueness is a case-sensitive, untrimmed unique column, so the normalised rule the groups session settled has no home; Team names are unique nowhere.
- **Derived numbers are stored and drift.** Standings are counters on a join row, written by completion, adjusted by a delta in a separate transaction and zeroed at rollover, and ADR 0003 records that the derived figures are the correct ones when the two differ; ratings and crowns are stored at close and repaired by two migrations. Read-only Past seasons exist because of the counters (ADR 0002).
- **Authorization is per route, by omission.** Several read routes carry no authentication at all; membership is computed in two places as "owner or has a player with this user id"; the moderator check compares player ids against user ids and works only because the client sends the id it expects.
- **Scheduled work runs inside the web process** as two node-cron timers on a single instance, and migrations run on every container start, so a migration on `main` is in production minutes after the push.
- **Secrets and environments blur.** The developer `.env` holds the production database URL, which is why `migrate:dev` needed a localhost guard; production dumps sit at the repo root; CLAUDE.md is gitignored, so the conventions an agent needs are not in the repository.
- **The test harness got five things right** and this session keeps all five: the real migrations are applied once per run, every table is truncated before each database test, factories build state through the real services, the test database URL refuses any host other than localhost, and database test files run one at a time. What it lacks is a layer without a database, so every scenario in the branch documents would need Postgres to run.
- **Sessions and limits are not shared.** Refresh tokens are stored in plaintext with no device fields; the only rate limiter is in-memory per process; the client session is a `localStorage` entry.
- **Dates carry no time zone**, ids are UUIDv4 minted by the server, and a request retried from a phone creates a second match.

## The model

### Repository and packages

The rewrite lives in a **new repository**. The old one keeps running until cut-over and is archived afterwards; the data migration job of session 15 is the one thing that ever reads its database. On day one the new repository holds the branch documents as `docs/spec/`, the rewrite glossary as its root `CONTEXT.md`, the ADRs of this session as `docs/adr/`, the agent documents of `docs/agents/`, and a committed `CLAUDE.md`.

Three packages in a **pnpm workspace**, ordered by TypeScript project references so `tsc -b` builds them in dependency order; no task runner, and one root `check` script that runs lint, types, format and tests, which is what CI and an agent both call:

| Package  | Holds                                                                                                                                                                             | May import                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `domain` | Fact types, derivations, value rules, the completion checks, the refusal reasons, the formation table. Pure: no I/O, no clock, no time zone; Zod is its only runtime dependency   | nothing                                          |
| `server` | Hono on Node 22, the tRPC router, better-auth, Drizzle schema and migrations, acts and reads by module, the pg-boss producer and the worker's jobs, mail templates, the built SPA | `domain`                                         |
| `web`    | The Vite React SPA: TanStack Router, TanStack Query through tRPC, the screens the frontend session designs                                                                        | `domain`, and the server's router **types** only |

`domain` is what keeps the shared-types workaround from returning: the client reuses the value rules and the completion checks for its warnings, and the server's input schemas compose the same rules, but the contract between the two is the router's inferred types, never a package of interfaces kept in step by hand.

### One image, two commands

One container image with two long-lived entry points. Settled in `14-operations.md`: the same image also carries four one-shot commands, `migrate`, `seed`, `backup` and `rehearse`, run as the pre-deploy command or as jobs, never as services. **`server`** hosts the tRPC router, the auth library's handler, the OAuth callback, the mail provider's webhooks, the unsubscribe link, CSV export, `/health`, and the built SPA's static files, so app and API share one origin. **`worker`** owns the pg-boss schedules and maintenance and runs every job; the server process only enqueues. Both read the same Postgres and the same typed configuration.

Same origin means the session cookie stays `SameSite=Lax` with no cross-domain configuration, the share link and the OAuth return path are one host, and a service worker for the PWA the notifications session deferred is trivial later. Every response carries the **build id**; the SPA compares it to its own at each navigation and reloads once when they differ, so a phone that kept the app open across a deploy never runs a stale bundle against a new router.

### The contract

**tRPC v11** on Hono through its fetch adapter, with the first-party TanStack Query client on the web side. The router is the contract: the client imports its types and gets typed hooks and query keys; there is no OpenAPI document and no generated package. Every input is a Zod schema that composes `domain`'s value rules; every output is what the read returns. Non-RPC routes exist only where the outside world dictates the shape: the OAuth callback, the provider's webhooks, the unsubscribe link, CSV export and `/health`.

### Data

**Postgres**, reached through **Drizzle 0.45** on the core query builder and SQL, never the relational query API, so the planned upgrade to Drizzle 1.0 is a migrations-folder move and not a rewrite of every read. Migrations are generated by `drizzle-kit generate`, committed as SQL, reviewed, and applied by a release command; `drizzle-kit push` never runs outside a scratch database. The job queue's own schema is excluded from Drizzle's view and owned by pg-boss.

Conventions that hold on every table:

- **Ids are UUIDv7**, minted by the app, and **minted by the client on every create** (Add match, Save, a ballot, a Team, a Player), so a phone that retries a request after a dropped connection cannot create the thing twice; the duplicate warning of the matches session catches the human double entry, this catches the network one.
- **`group_id` on every Group-owned row**: matches, lineup rows, ballots, Entries, roster spots, change records, invitations, everything that belongs to a Group carries it directly, and every read and write filters on the Group from the request context. A foreign id from another Group is simply not found.
- **Time**: a match date is a Postgres `date`; every instant is `timestamptz`; a Group's time zone is an IANA name; "today in this Group" and "the end of day N in this Group as an instant" are computed by one small module in `server`, the only place the calendar rules of the matches and voting sessions are implemented.
- **Settings apply forward by snapshot.** The voting switch, the voting period and Minimum matches are three columns on the match, stamped at creation and never rewritten; the Award threshold is stamped on the Season by Start new season and End competition, so a Past season resolves the value it closed under without a join; the competition row holds the current values; the activity record holds every old and new value, which is the history.
- **Stored states, derived states.** A match's state (to play, Completed, Not played) with its completion instant, a Walkover and its awarded side, a Fixture's Round and ordered sides, a Tie's slots, a Season's start and end, an Entry's seed and withdrawn mark, a ballot's voided instant: stored, because they are acts. Active and Ended, the played span, Empty, Rated and Not rated, closed-by-deadline: derived, because they follow from the stored facts and nothing may disagree with them.
- **A vote is columns on the match**: the deadline as an instant, the closed instant and its reason once closed. A vote reads as closed when its closed instant is set **or** its deadline has passed, so no reader waits for the job that stamps it.
- **The bracket is a table of Ties.** A Tie has a Round, a position, and two slots; each slot is exactly one of an Entry, a bye, or a reference to the feeding Tie, held by a check constraint, and resolves to an Entry when the feeding Tie is decided.
- **Ballots are rows, picks are three columns.** One row per ballot with the match, the voter Player, the acting Account when entered on behalf, the first-submitted and last-changed instants, the three picks, and a voided instant; a partial unique index keeps one unvoided ballot per voter per match, so a voided ballot stays as a fact and the voter may cast again.
- **Append-only records are four tables**, one each for the activity record, the change record, security events and Deliveries. Each has typed columns for the actor, the target and the instant, a `kind`, and a `jsonb` details column validated at write and read by a discriminated union in `domain`. The actor column is nullable with `ON DELETE SET NULL`: when an Account is deleted the id goes and the row itself is the marker that an Account acted, exactly the tombstone the identity session asked for.

Constraints carry the invariants that can be stated: a partial unique index for one open Season per Competition; functional unique indexes on the normalised nickname, competition name, Team name and Season label; unique Entry per Team and Season; unique roster spot per Player and Season; the partial unique index on ballots; the check constraint on Tie slots. What a constraint cannot state, the act does inside its transaction.

### Derivation: the domain engine

Every number the stats, League, Knockout, voting and seasons sessions defined is computed **on read, in pure TypeScript, over facts loaded by one or two queries**, with no cache in the first release. `domain` exports the fact types (a Completed match with its sides, lineup rows and settings snapshot; a ballot with its picks; an Entry with its roster and seed; a Season), and the derivations over them: `standings` with the head-to-head mini-table, shared positions and the champion mark; `ratings` with the three-ballot floor, the crown and the results breakdown; `streaks`, `form`, `qualified` with the Pickup and Entry denominators and the floor of three; the Season summary; Records and Honours; the bracket's progression, an Entry's Result and the teams still in; the All seasons tables; the balance for Draw sides and Draw teams. Every scope, a Season, All seasons, the Players page, the Player page, the Team page, Your career, is the same function over a differently loaded set, so there is one arithmetic and it is unit-tested without a database.

The loaders in `server` are the only SQL. Volumes are a football group's (the production database holds five competitions and a few hundred matches; a busy Group in five years holds a few thousand), and a cache, should a measurement ever ask for one, wraps a loader and invalidates on the writes the sessions listed, without touching the engine.

### The boundary

**Six procedure tiers and nothing else.** The procedure builder exports exactly these, so a procedure cannot exist without declaring its scope, and a test enumerates every procedure in the router and asserts its tier, so a procedure on the wrong tier fails CI.

| Tier                     | Resolves before the handler runs                                               | Used by                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `public`                 | nothing                                                                        | sign-in and sign-up flows, invitation validation, the unsubscribe link, `/health`        |
| `account`                | a signed-in Account                                                            | settings, sessions, Your career, Your open votes, the Groups list, Group creation        |
| `member(groupId)`        | the Membership row of this Account in this Group                               | every read inside a Group, casting a ballot, editing one's own nickname, leaving         |
| `manager(competitionId)` | the Membership plus a Manager assignment for the competition or the admin flag | recording and completing matches, Roster setup, schedules, brackets, ballots on behalf   |
| `groupAdmin(groupId)`    | the Membership with the admin flag                                             | competitions, settings, Seasons, Corrections, Managers, repairs, Members, Group settings |
| `operator`               | the configuration allowlist                                                    | the Operator's acts on Accounts, never anything inside a Group                           |

Every Group-scoped input names the Group explicitly; links carry the Group, so there is no "current group" header and no session state about which Group is open. **Re-authentication** is a seventh check layered on `account` for the identity session's sensitive acts: a `reauthenticate` procedure verifies a password or completes a Google sign-in and stamps the session row, and the sensitive procedures refuse when the stamp is older than ten minutes.

**Errors on the wire** are four tRPC codes with a stable reason: `NOT_FOUND` for anything outside the caller's Groups or absent, `FORBIDDEN` for a tier failure, `CONFLICT` for a version mismatch or a unique constraint, `PRECONDITION_FAILED` for a domain refusal. Every refusal carries a `reason` from a closed enum in `domain` (`next_tie_recorded`, `last_group_admin`, `season_not_current`, `lineup_frozen`, `both_players_linked`, and so on) plus the data the message needs, so the client's copy table is typed against the same enum. A form's warnings are not errors; they travel as a list on the read.

**Rate limits** for the auth library's routes are its own, stored in the database. For everything else one tRPC middleware with a limit declared per procedure keeps a fixed-window counter in a Postgres table, purged daily: the mail-sending acts (the addressed invitation and its resend at 3 per hour per IP and per address) and the per-Account safety net of 600 per minute. Every 429 carries `Retry-After`.

**Secrecy is a property of the reads.** Ballot picks are returned by exactly two reads, "my ballot" and "ballots entered on behalf in this match", and by nothing else; every aggregate is computed server-side from three ballots up. Your career and Your open votes are `account` reads that join through the Account's Memberships. Nothing is hidden by the client.

### Identity

**better-auth** with the Drizzle adapter, the app's migrations owning its tables, Google by subject id with linking to a password Account only when both emails are verified (Google is deliberately not a trusted provider, so an unverified Google email is refused), mandatory verification with a 24-hour link, neutral sign-in and forgot-password responses, database sessions with IP and user agent, a session list with revoke one and revoke all, Origin and Fetch Metadata checks in place of per-form tokens, additional fields on the Account for the Vote reminder preference, the Reminder prompt's asked flag and the Undeliverable mark, and its own database-backed rate limits on its routes.

Four pieces are custom code on top of it: the one-year hard cap on a session, as a clamp in the session update hook; the ten-minute re-authentication window and the `reauthenticate` procedure above; the purge of Accounts unverified after seven days, as a daily job; and the standard `Retry-After` header beside the library's own. **One deviation is accepted and recorded**: the library stores the session token in plaintext at rest, and the identity session had settled a hashed session id. A read of the sessions table already implies a read of everything those sessions protect, so hashing buys little in this app; `01-identity.md` carries the note. The library's admin plugin is not used: the Operator stays the identity session's allowlist, with its acts as `operator` procedures over the library's server API, so impersonation never exists.

### Scheduled work and mail

**pg-boss** on the same Postgres, pinned, with the worker owning schedules and maintenance and the server process producing only. Jobs: the deadline close every few minutes, which stamps the closed instant on every match whose deadline has passed and is unstamped; the hourly Vote reminder sweep; the daily purges of unverified Accounts, expired sessions, rate-limit windows and Deliveries older than 90 days; and the **outbox**, one job per message with retries and backoff for a bounded time, after which the Delivery is marked failed. Every job is idempotent on its record, the Delivery or the closed instant, and no read ever waits for one. A singleton key keeps one close job per match at a time.

Mail goes through **Resend's HTTP API** with signed webhooks for delivered, bounced and complained, each webhook updating the Delivery and, on a hard bounce or a complaint, setting the Undeliverable mark and turning the reminder off as the notifications session settled. Templates are **React Email**, rendered in the worker to an HTML part and a plain-text part with the bare URL beneath every button; the rendered subject and text are kept on the Delivery so an Operator can see what was sent. **Mailpit** runs in `compose.yml` and every non-production environment points at it, so no test and no developer session can ever send. Amended in `14-operations.md`: a non-production environment with a recipient allowlist configured, which is staging, sends real mail to the listed addresses and records every other address as a suppressed Delivery; production refuses to boot with an allowlist set.

### The server's shape

Modules by spec area: `identity`, `groups`, `competitions`, `seasons`, `teams`, `league`, `knockout`, `matches`, `voting`, `stats`, `notifications`. Each holds:

- `schema.ts`: its Drizzle tables and indexes;
- `acts.ts`: one exported function per domain act, `completeMatch`, `startNewSeason`, `mergePlayers`, `drawBracket`, `withdrawTeam`, each taking the actor and the input, opening the transaction, taking the row lock where the act needs one, loading what it checks, running `domain`'s checks, writing, and appending its activity or change record entry in the same function so it cannot be forgotten;
- `reads.ts`: loaders that return `domain` facts or view rows, and the reads the router exposes;
- `router.ts`: thin tRPC procedures on the right tier, one per act or read, whose body is validation, the call, and the mapping of a refusal to its code and reason.

There is no repository layer: Drizzle is the data access. Cross-module calls go through exported acts and reads, never through another module's tables. A module's tests sit beside it.

### The client

React with Vite, **TanStack Router** with file-based routes, typed path params for the Group and the Season number that every in-Group URL carries, typed search params, and loaders that call `ensureQueryData` on the one shared QueryClient so a page's data is requested before it renders and a page left and returned to reads the same cache. **TanStack Query through tRPC** for every read and mutation. Forms validate with `domain`'s value rules for their warnings and send the `version` they loaded with every save. What the screens look like, the component library, the pitch view and the PWA install prompt are the frontend session's. Settled in `13-frontend.md`: the designer's sticker-album identity, Tailwind v4 with shadcn/ui restyled over Radix, a drawn pitch on the match page and a listed one in the form, and a manifest with a shell-only service worker.

### Concurrency

Three mechanisms, chosen by what each act needs:

1. **Constraints** for every invariant the database can state, listed under Data. The second of two colliding writes fails with a unique violation the act turns into `CONFLICT`.
2. **A row lock on the Competition** (`SELECT … FOR UPDATE`) inside every Season, schedule and bracket act: Start new season, End competition, Reopen last season, Generate, Regenerate, Add a cycle, Draw, Redraw, Add a team, Withdraw, Restore. Two admins rolling at once serialise; the second re-reads the state under the lock and refuses with the right reason.
3. **A version column** on the match and on the Season's roster set. The form sends the version it loaded; a save on a stale version is refused with `CONFLICT` and the form reloads and asks again, so last save wins only when the saver has seen the other's rows.

### Testing

Three layers, every scenario in a branch document a named test somewhere in them:

1. **Unit**, on `domain`: the derivations, the completion checks, the value rules, the formation table, the refusal reasons. No database, milliseconds, the majority of tests.
2. **Service**, through the router's own caller with a real context (an Account, a Membership, a role) against the compose Postgres: every procedure's tier, every act's transaction, constraint and version check, and the concurrency cases with two callers racing. Real migrations applied once per run, truncation before each test, factories that build state through the real acts, the localhost-only guard on the test database URL, one database file at a time: the five things the current harness got right, kept.
3. **End-to-end**, a Playwright suite of fewer than ten flows on the built app against the test database: sign in, create a Group, add and complete a match, cast a ballot, Roster setup and a schedule, the share link through a sign-in. Client component tests stay minimal, for pure UI logic.

Vitest runs the first two and the client's component tests; Playwright runs the third. The seed script below is the fixture the end-to-end suite and every screenshot start from.

### Local environment, secrets, migrations

`compose.yml` runs Postgres, on the same major as production (17, settled in `14-operations.md`), and Mailpit; `docker compose up -d` stays the only local setup step. A typed `env.ts` parses the environment with Zod at boot and refuses to start on a missing or malformed variable. The **development `.env` never holds a production URL or secret**; production values exist only in the host's configuration; every script that takes a database URL refuses a non-localhost host unless it is the release command run by the pipeline.

Migrations are forward-only SQL files generated by drizzle-kit and committed; a release command applies them **before** the new server version starts, never on container start; a rehearsal against the latest production dump in a scratch database is a pipeline step. The operations session owns the pipeline; this session states the rule. Settled in `14-operations.md`: `migrate` is the web service's pre-deploy command, every migration is safe for the previous version to run against, and the rehearsal is a one-off job on staging from the latest off-host dump.

### Observability seam

The operations session picks vendors; this session fixes what the code emits. Settled in `14-operations.md`: Sentry behind the error hook and on `/health`, healthchecks.io pinged at the end of every scheduled job, logs left on the host. Structured logs through pino with a request id on every line; **one log line per act** with the actor, the act name, the target ids, the outcome and the duration, the operational trail beside the domain's activity record; one error-reporting hook through which every unhandled error and every `INTERNAL_SERVER_ERROR` passes with its request id, so an error-tracking SDK is one file; `/health` checks the database and reports the build id; the worker logs every job's start, end and failure the same way.

### Workflow

- The spec is `docs/spec/`, the glossary `CONTEXT.md`, the decisions `docs/adr/`; `CLAUDE.md` is committed and maps each module to its spec document.
- One GitHub issue per vertical slice referencing its spec section; one pull request per issue; CI runs `check` on every push and pull request and is the gate; small fixes go to `main` directly, as now.
- Dependencies are pinned to exact versions, with one grouped weekly upgrade pull request that CI tests, majors separately.
- Lint is ESLint with typescript-eslint's type-aware rules (`no-floating-promises` and `no-misused-promises` are the ones acts and jobs need); format is Prettier, Markdown included, so a spec file that is not formatted fails the build like source.
- A **seed script** builds a realistic demo Group: two Pickup competitions with different match formats, a League and a cup over the same Teams, three Seasons with a Correction and a withdrawn Entry, open votes and closed ones, a ballot on behalf, an addressed invitation. It is the fixture for local development, screenshots, the frontend session and the end-to-end suite.

### The data migration's seam

The one-time job of session 15 **inserts rows directly** into the new schema, one transaction per Group, and then runs the domain engine over the result to produce the report the map asks for: every match whose re-derived rating or crown differs from what was stored, the one- and two-ballot matches now Not rated, the nickname collisions under the normalised rule for the admin to merge. It does not write through the acts, which take an actor and refuse what the domain refuses, and the old data breaks rules that history is allowed to break. The database constraints hold either way.

### ADRs

Written in this session under `docs/rewrite/adr/`, to be carried into the new repository's `docs/adr/`:

| ADR  | Decision                                                                     |
| ---- | ---------------------------------------------------------------------------- |
| 0001 | A new repository and no code reuse                                           |
| 0002 | Nothing derived is stored: a pure engine on read, no counters, no cache      |
| 0003 | Members only is structural: six procedure tiers and `group_id` on every row  |
| 0004 | Postgres is the only stateful service                                        |
| 0005 | A SPA and a typed RPC router are the contract; no OpenAPI, no shared package |
| 0006 | Drizzle over Prisma                                                          |
| 0007 | better-auth, with the session token in plaintext at rest                     |
| 0008 | Settings apply forward by snapshot                                           |
| 0009 | UUIDv7 ids minted by the client on creates                                   |
| 0010 | Account deletion unlinks Players and tombstones actors                       |
| 0011 | One worker on pg-boss; jobs idempotent on their record; reads never wait     |

## Scenarios that shaped the model

- **Two admins press Start new season together.** Both acts lock the Competition row; the first closes and opens; the second re-reads under the lock, finds the Season it meant to close already closed, and refuses with `season_not_current`. The partial unique index would have refused the second open Season anyway.
- **Complete on a bad connection.** The phone sends Complete, loses the response, and sends it again. The match id was minted on the phone; the second request finds the match already Completed with the same facts and answers as the first did. No second match, no second vote.
- **A link from another Group.** A Member pastes a match URL into the wrong chat. A Member of the other Group opens it: the procedure's tier resolves their Membership in the URL's Group, finds none, and answers not found; a Member of the right Group who lacks nothing sees the match. The query itself filtered on `group_id`, so even a bug in the tier would have found nothing.
- **A deploy while the app is open.** The Manager has had the match form open since Sunday; the app deployed Monday. Their next navigation sees a different build id in the response and reloads once; the draft they had saved is on the server, not in the bundle.
- **The mail provider is down on Sunday evening.** Completion opens the vote and the share link works; the outbox job retries the invitation mail for its bounded time, then marks the Delivery failed and the invitations list reads "not delivered" with Resend. Nothing in the act waited for the mail.
- **A Correction two seasons on.** A Group admin fixes a scorer on a Past season match. The act writes the lineup row and the activity entry in one transaction; the Season's top scorer, the Player's Honours and the competition's Records change on the next read because none of them was stored.
- **The wrong tier.** An agent adds a "delete Player" procedure on `manager` instead of `groupAdmin`. The tier enumeration test lists it under the wrong tier and CI fails before anyone reviews the pull request.
- **Two Managers, one match.** Both open Sunday's match. One adds Marko; the other, still on the old version, fixes a score. The second save carries a stale version and is refused with `CONFLICT`; the form reloads, shows Marko, and the score fix goes in on top.
- **Drizzle 1.0 arrives.** The reads use the core builder and SQL; the relational API it replaces was never used; the upgrade is the migrations-folder move its guide describes and a version bump in one pull request the weekly upgrade job opens.
- **The legacy one-ballot match.** The migration inserts the match and its single ballot as they were; the engine reads the closed vote, finds one ballot, and the match is Not rated. The report names it, as the voting session decided.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **A Vite React SPA plus one Node API with a typed RPC layer**, over a full-stack framework or a schema-first contract.
- **A new repository**, with the branch documents as its spec and the old repository archived after cut-over.
- **Postgres with Drizzle 0.45** on the core builder and SQL, generated migrations only.
- **Derivation on read in a pure TypeScript engine**, no cache in the first release.
- **Six procedure tiers and `group_id` on every Group-owned row**, with a tier enumeration test; no row-level security.
- **Postgres as the only stateful service**: sessions, rate limits, the queue and the outbox; no Redis.
- **A worker process on pg-boss**, the server producing only; every job idempotent on its record; reads never waiting.
- **Settings by snapshot**: three columns on the match, the Award threshold on the Season at close.
- **Four append-only tables** with `kind` plus validated `jsonb`, actors `SET NULL` on deletion.
- **Constraints, a Competition row lock, and version columns** as the three concurrency mechanisms.
- **UUIDv7 everywhere, minted by the client on creates**; `date` for match dates, `timestamptz` for instants, one time module.
- **Resend over HTTP with signed webhooks**, React Email templates rendered in the worker, Mailpit in every non-production environment. Amended in `14-operations.md`: staging sends real mail under a recipient allowlist.
- **Three test layers from day one**: unit on the engine, service through the router's caller, fewer than ten Playwright flows.
- **Three pnpm packages** with project references and no Turbo: `domain`, `server`, `web`.
- **The agent workflow**: `docs/spec`, `CONTEXT.md`, `docs/adr`, a committed `CLAUDE.md`, one issue per slice, one pull request per issue, CI as the gate, a seed script.
- **tRPC v11** with the TanStack Query client, on **Hono** and **Node 22 LTS**.
- **better-auth** with four custom pieces, the plaintext session token accepted as a recorded deviation, and no admin plugin.
- **TanStack Router** with file-based routes and loaders over the shared QueryClient.
- **The domain package's contract**: fact types, derivations, value rules, the completion checks, the refusal reasons; Zod its only dependency.
- **Modules by spec area** with `schema.ts`, `acts.ts`, `reads.ts` and `router.ts`; one function per act; no repository layer.
- **Same origin** for app and API, and the **build-id guard**.
- **Four error codes with a `reason` enum** from `domain`.
- **Typed environment parsing at boot; no production value in a development `.env`; non-localhost refused outside the release command.**
- **Migrations as a release step**, never on container start, rehearsed on a dump.
- **ADRs under `docs/rewrite/adr/`**, the eleven listed.
- **A Postgres fixed-window rate limiter** for the mail-sending acts and the per-Account safety net.
- **Direct inserts plus the engine as verifier** as the data migration's seam.
- **ESLint type-aware plus Prettier**, Markdown included.
- **The observability seam**: request ids, one log line per act, one error hook, `/health` with the build id.
- **Pinned dependencies with one grouped weekly upgrade pull request.**
- **date-fns v4 with its time-zone package.**

### Declined, and why

- **A full-stack React framework with server functions.** Every screen is behind sign-in, so server rendering buys nothing, and the worker, the webhooks and the deploy target would all take the framework's shape.
- **A schema-first contract with OpenAPI and a generated client**, and **oRPC** for its OpenAPI output. No non-TypeScript consumer exists; the codegen step is the shared-types workaround in another form; oRPC adds a single-maintainer bus factor and a major version landing now.
- **Hono's own typed client.** No procedure concept, no query-key helpers, and a documented IDE slowdown as routes grow.
- **Express or Fastify.** Express is slowest and mounts the auth library awkwardly; Fastify needs a hand-written catch-all for it. **Bun**, because the auth library and the job runner require Node.
- **Prisma.** It cannot declare the partial and functional unique indexes the domain needs, and the current repo already carries one as SQL the engine cannot see. **Kysely**, because it brings no schema or migrations.
- **Drizzle's 1.0 release candidate**, and **its relational query API**. Living on a pre-release, and writing reads against the API 1.0 replaces.
- **SQL views or materialised tables for derivations, or a cache from day one.** Volumes do not ask for it; a cache is a loader wrapper later, not a design now.
- **Row-level security as a second fence.** A session variable per request and policies per table for a solo project; the tiers plus `group_id` plus the enumeration test cover it.
- **Redis** for sessions, limits or the queue. A second stateful service is a second backup, outage and bill.
- **In-process timers** (what the map rejected) and **the host's cron hitting an endpoint** (locks the app to a host). **graphile-worker**, for its 0.x cadence, UTC-only cron and the scale-to-zero story on schema upgrades.
- **A versioned settings table** joined by time on every read. The snapshot is what the domain says, and the activity record is the history.
- **One generic events table** for all four records. Four readers, four shapes, four retention rules.
- **Bigint serial ids.** They expose counts and the client cannot mint them, which is what makes retries safe.
- **A hand-rolled auth on primitives**, which would have given the hashed session token at the price of writing and maintaining every flow. **The auth library's admin plugin**, which brings impersonation.
- **React Router v7 in library mode.** Untyped params and no loader integration with React Query there.
- **A static host for the SPA on a separate origin.** Cross-subdomain cookie configuration and a second deploy for nothing.
- **Biome.** No type-aware rules and no Markdown formatting, so Prettier would stay anyway. **Turbo.** Three packages need no task graph.
- **In-memory rate limits per instance** for the mail-sending acts. The identity session wants a shared store, and the counter table keeps the one-service ADR true.
- **The migration writing through the acts.** Slow, and it would refuse real history.
- **Luxon** and **the Temporal polyfill**. date-fns is enough and Node 22 has no Temporal.
- **The rewrite in place**, as a directory or branch of the current repository. A clean history, clean CI and no old code for an agent to "reuse".
- **SMTP** for mail, since bounces and complaints never come back over it; **hand-written string templates**, since every message needs two parts and a preview.

## Hand-offs to other sessions

- **Identity (1)**: applied to that document in this session: the plaintext session token as a recorded deviation; better-auth with its four custom pieces; the `reauthenticate` procedure and the ten-minute stamp; the Operator as `operator` procedures over the library's server API, no admin plugin; the rate limits split between the library's own store and the Postgres counter; the Origin check as the library's; sessions and security events as its tables and the app's.
- **Groups (2)**: applied to that document in this session: the Membership row is what `member` resolves; nickname uniqueness as a functional unique index on the normalised value; Merge as one act re-pointing lineup rows, ballots and roster spots in one transaction; the activity record as one append-only table with `kind` and validated `jsonb`; the actor column `SET NULL` as the tombstone.
- **Competitions (3)**: applied to that document in this session: the settings snapshot as three columns on the match and the Award threshold on the Season; Active and Ended derived from the Seasons; the competition name as a functional unique index per Group; the lineup cap as one of the completion checks in `domain`, run in the act.
- **Seasons (4)**: applied to that document in this session: one open Season per Competition as a partial unique index and one winner through the Competition row lock; the Season number as the wire identity, a typed path param; Not played as a stored state; Reopen last season as one act in one transaction; the played span and the summary derived by the engine, uncached.
- **Teams and rosters (5)**: applied to that document in this session: the Team name as a functional unique index per Group; Entry unique per Team and Season; the roster spot unique per Player and Season; colour uniqueness among a Season's Entries checked in the Save act; Team merge as one act; the version column on the Season's roster set so a stale Roster setup form is refused rather than dropping the other Manager's change.
- **League (6)**: applied to that document in this session: Standings, head-to-head, Form, the champion mark and All seasons Standings as engine functions on read; the Fixture state stored with the Walkover and its awarded side; Round as an integer and the sides as an ordered pair; Add a cycle, Add a team and Withdraw as single acts under the Competition lock, so two Managers generating at once produce one schedule.
- **Knockout (7)**: applied to that document in this session: the bracket as a table of Ties whose slots are an Entry, a bye or a feeding Tie under a check constraint; progression inside the Complete act; the "nothing recorded on the next Tie" guard in every reversal act; Draw and Redraw as single acts under the lock; the seed on the Entry; the Result, the teams still in and the All seasons record derived by the engine.
- **Matches (8)**: applied to that document in this session: the match state with its completion instant; the date as a `date` column judged in the Group's time zone by the one time module; the eight checks as a pure `domain` function run inside the Complete act with the Knockout progression, and re-run on every edit; the change record as an append-only table with tombstoned actors; the version column on the match; the duplicate check as a read the form calls; client-minted match ids so a retried Complete is idempotent.
- **Voting (9)**: applied to that document in this session: the ballot as a row with the voter, the acting Account, both instants, three pick columns and a voided instant, one unvoided ballot per voter per match by partial index; ratings, the floor, the crown, the breakdown, the Turnout, the voting record and Your open votes derived on read; the deadline as an instant on the match with Extend recorded in the change record; the last-ballot close evaluated in the ballot's transaction; the deadline close as a worker job that stamps the closed instant, with "closed" read as stamped or past the deadline; secrecy as two named reads; the Minimum matches count read at submit.
- **Stats (10)**: applied to that document in this session: every table, page, summary, Record and Honour as engine functions on read, uncached; the Award threshold stamped on the Season at close; Qualified evaluated by the engine with both denominators; streaks and Records as ordered reads by match date then recording order; Your career as an `account` read across Memberships; CSV as a plain HTTP route and Copy as text as a client serialisation of the same rows; the last-10 balance as a read at Draw time.
- **Notifications (11)**: applied to that document in this session: Resend's HTTP API and signed webhooks; the outbox as pg-boss jobs with the Delivery as their record; the hourly sweep and the deadline close as worker jobs, idempotent on the Delivery and the closed instant; the Reminder prompt's asked flag and the Vote reminder preference as additional fields on the Account; the unsubscribe token as a signed, revocable, single-purpose credential; the Undeliverable mark on the Account; React Email rendering both parts; Mailpit in every non-production environment.
- **Frontend (13)**: what it inherits: React with Vite, TanStack Router with the Group and the Season number as typed path params, TanStack Query through tRPC, `domain`'s value rules and completion checks for form warnings, the `version` sent with every save and the reload-and-retry on `CONFLICT`, the reason enum as the key of its copy table, the build-id reload, same origin for the later PWA and its install prompt; open to it: the component library, the look, every screen the domain sessions described. Settled in `13-frontend.md`: Tailwind v4 with the identity as CSS variables, shadcn/ui restyled over Radix, TanStack Table, dnd-kit on desktop only, React Hook Form, two self-hosted fonts, a hand-drawn SVG chart; the CONFLICT reload keeps uncontested edits and flags the rest; an offline draft of the match form under the client-minted id; a manifest and a shell-only service worker.
- **Operations (14)**: a host that runs one image as two commands beside a managed Postgres with backups; the release command that applies migrations before the new version starts, and the rehearsal on a dump as a pipeline step; staging; `/health` and the build id as the deploy check; the log and error vendors behind the seam; an alert when the worker's schedules stop firing; the mail provider's webhook authenticity and the sending domain's records; Mailpit never in production; production secrets only in the host; the weekly upgrade pull request; the cost ceiling. Settled in `14-operations.md`: Render with a production and a staging environment; the image built once in CI, pulled by every service, with six commands (`server`, `worker`, `migrate`, `seed`, `backup`, `rehearse`) and the Postgres 17 client tools; `migrate` as the web service's pre-deploy command under an expand-and-contract rule; the rehearsal as a one-off job on staging; Sentry and healthchecks.io behind the seam; Postgres 17 in `compose.yml` and CI; one amendment to the Mailpit rule, a non-production environment sends real mail exactly when a recipient allowlist is configured and records every other address as a suppressed Delivery; additions to the typed environment (the recipient allowlist, the Read-only flag, the heartbeat URLs, the Sentry DSN, the B2 credentials, the connection budget); `maintenance` in the refusal enum for Read-only mode; an `operator` System read; source maps uploaded by CI.
- **Data migration (15)**: direct inserts into the new schema, one transaction per Group, then the engine as the verifier producing the report; the old database read over its own connection, never through the new app; ids minted by the job; a "recorded" change record entry per migrated match naming the competition's admin; no Deliveries, no sessions, no security events migrated; the Award threshold stamped as 50% on every migrated Season; whether password hashes carry into the auth library's credential table is that session's, with the library's scrypt format as the fact to check.

## Vocabulary

Nothing is added to `docs/rewrite/CONTEXT.md` by this session. The words this document uses for the code, act, read, tier, fact, engine, module, snapshot, are implementation vocabulary and the glossary is a domain glossary; they live in the new repository's `CLAUDE.md` and in the code. "Shared types" as a package, "handler, service, repository" as layers, "reset" as a database act and "cron" as an in-process timer are retired.
