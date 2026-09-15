# Identity and accounts

_Branch session 1, 2026-09-11. Output of the second `/grill-with-docs` session for the rewrite. Takes `00-map.md` as settled; settles the open questions under its area 1 and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

Let a person prove who they are so they can be attached to Players, run Groups and vote. An Account is that proof and nothing more: it holds an email, one or two sign-in methods, a display name, and the sessions and security events that belong to it. It holds no role, creates no Group on sign-up and owns nothing inside a Group. A Player is a Group-level identity; an Account is what a Player attaches to in order to vote.

## Decisions carried in from the map

- Sign-in is Google or email and password. One email is one Account across both.
- Sign-up creates nothing else. No Group, no Player, no role.
- Roles are derived, never stored on the Account.
- Members only: every read is scoped to a Group the Account belongs to. This session owns the rule; the architecture session makes it the default rather than a per-route check.
- The rewrite reuses no code. Today's auth was read for behaviour only.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- There is no Google link. The callback decodes the id token without verifying its signature, matches by the raw email string without lowercasing, and the User table has no Google id column. A password Account and a Google sign-in on the same address are the same Account only because the strings happen to match.
- Password sign-up is live immediately, unverified. A password Account on an address someone else owns is signed into silently by that person's first Google sign-in.
- Three responses reveal whether an Account exists and of which kind: sign-in answers "please login with Google", forgot-password answers 404 for an unknown address and 400 for a Google-only one, while its copy promises neutrality.
- The refresh token table already lives in the database, storing the full token in plaintext, with no device fields and no sweep other than an inline cleanup on every mint. There is no sign-out-everywhere. A password reset revokes nothing.
- The only rate limiter is in-memory, per process, keyed by IP, applied to sign-in, forgot and reset, and skips successful requests. Sign-up, refresh, the Google callback and every `/api` route are unlimited.
- No route can delete an Account. The one delete function that exists cascades to the whole Dashboard, every match and every ballot in it. A User that ever sent an invitation cannot be deleted at all.
- "Registered" has two meanings: a column on the account that nothing reads for a decision, and a derived "this Player has an Account" that the players list shows as a badge.
- The `/auth/me` route is called on mount when a stored session exists. The map's line saying it is never called was stale and is corrected.

## The model

### Account

An Account is one person's proof of identity. It has:

- an **email**, lowercased and trimmed everywhere it enters, unique on that normalised value, with no Gmail dot or plus stripping;
- a **verified email** flag: true from birth for an Account created through Google, true for a password Account once its verification link is clicked;
- one or two **sign-in methods**: Password (a hash) and Google (attached by Google's stable subject id, at most one per Account). A method may be detached, never the last one;
- a **display name**, prefilled from Google or typed at password sign-up, editable; and an **avatar** that is the Google picture URL, refreshed on each Google sign-in, with initials as the fallback. No upload;
- its **sessions** and its **security events**;
- added by the notifications session: the **Vote reminder** preference, off at birth, whether the Reminder prompt has been asked, an **Undeliverable** mark set by a bounce or complaint, and its **Deliveries**.

The display name and avatar are used wherever the Account acts as itself: admin lists, "invited by", a ballot entered on someone's behalf. The nickname stays the identity inside a Group. Whether the display name becomes the default nickname on accepting an invitation belongs to the Groups session.

### One email, one Account

- **Google sign-in on an existing password Account** with a verified email: signs straight in and attaches Google to the Account. Condition: Google reports the address as verified, and the Account's own email is verified. A Google sign-in whose email Google marks as unverified is refused with a plain message.
- **Google sign-in on an unverified password Account**: the unverified Account is discarded and the Google sign-in creates a fresh one. Google has just proven who owns the address; the password Account never did. This is what makes the previous rule safe against pre-registration takeover.
- **Password sign-up on an address that already has an Account**: the response is the same "check your email" as for a new address, and the existing Account receives a mail saying an Account already exists, how to sign in, and the link to set a password. Nothing reveals whether or which Account exists.
- **Setting a password on a Google-only Account**: from account settings in a signed-in session, or through the forgot-password link, which proves ownership of the address. The reverse, attaching Google to a password Account, is done from settings by completing a Google sign-in.
- **Email change**: the new address receives a verification link; the change lands only when it is clicked; the old address is told. Google stays attached because it is linked by subject id, not by the string.

### Verification

- A password sign-up sends a verification link. Until it is clicked the Account exists only to be verified: signing in shows the "verify your email" screen with a resend button and nothing else.
- A verification link is valid for 24 hours. Resend is allowed within the rate limits.
- An Account still unverified after 7 days is deleted, so its address is free again.

### Google

- Scopes: openid, email, profile.
- The id token's signature is verified against Google's keys.
- The OAuth state is a signed random value that carries the return path and any invitation token. It protects against forged callbacks; today's state is the invitation token alone.

### Passwords

- Minimum 10 characters, maximum 128, no composition rules, no common-password list. Rate limiting on the password endpoints is what protects against guessing.
- Setting or changing a password, and a password reset, end every other session of the Account.

### Sessions

Server-side sessions, stated as a requirement the architecture session must meet, not a library choice. Any auth library it picks supports this.

- One row per session in the database: created, last seen, expires, user agent, IP at creation, and the sign-in method that opened it.
- The session id is random and stored hashed. It travels in an httpOnly, secure, SameSite=Lax cookie on path `/`.
- Lifetime: 90 days sliding, hard cap at one year. No "remember me" checkbox. Last seen and expiry are extended at most once a day, not on every request.
- No cap on concurrent sessions.
- **Sign out** ends the current session. **Sign out everywhere** ends every other session and needs re-authentication.
- A person can see their sessions (device, last seen) and end one or all.
- Cross-site request forgery: SameSite=Lax plus a check that every state-changing request carries an Origin or Referer header matching the app, rejected otherwise. No per-form tokens.

### Recovery

- Forgot password sends a single-use link that expires in one hour. The response is identical for a known address, an unknown one and a Google-only Account.
- The same link sets a first password on a Google-only Account; the mail says "set a password" in that case.
- A person who has lost both their Google account and their email gets no special flow. The Group admin unlinks the Player and re-invites them (Groups session), and the operator can delete the stranded Account.

### Re-authentication

A password entry or a completed Google sign-in counts as fresh for 10 minutes. Required for: changing email, changing or setting a password, attaching or detaching a sign-in method, ending all other sessions, and deleting the Account.

### Security notices

An email to the current address on: password change, email change (to both old and new), a sign-in method detached, and Account deletion. No "new device sign-in" mails.

### Security events

An append-only table in the database, one row per event: the Account, the kind, the time, the session, the IP and the user agent. Recorded: sign-in, failed sign-in, password change, email change, method attached or detached, sessions ended, deletion, and every operator action on the Account with the operator named. Deleted with the Account. A "recent activity" view for the person comes later; the record starts on day one.

### Deletion

Self-service, immediate, after re-authentication and a confirmation screen that lists what is kept and what goes. No typed phrase, no grace period.

- **Goes**: the Account row, its sign-in methods, its sessions, its security events, and, per the notifications session, its Deliveries and preferences. The email is free again.
- **Kept**: every Player the Account had claimed stays in its Group as an unlinked Player with all matches, stats and ballots intact. A ballot is the Player's act on the Group's record, not the Account's.
- **Tombstoned**: anything that names the Account as an actor (invited by, entered on behalf of) keeps a marker that an Account acted, not a name.
- **Refused** while the Account is the only Group admin of any Group, with the list of those Groups, so the person hands over or deletes the Group first.
- All sessions end at once and the deletion notice goes out.

This is the one decision of the session that is hard to reverse once data has been deleted the other way, and it is the candidate for an ADR when the architecture session sets up the rewrite's ADR directory.

### Operator

Not a role on the Account and not a domain concept: an allowlist of emails in configuration. An operator signs in like anyone and sees an extra section.

- Can: look up an Account by email; see its sign-in methods, sessions and security events; resend verification; mark an email verified; end its sessions; delete it. Added by the notifications session: see its Deliveries; clear an Undeliverable mark.
- Cannot: sign in as the Account; read or change anything inside a Group.
- Every action is recorded as a security event on the target Account with the operator named.

The Groups session never sees the operator.

### Rate limits

All in a store shared across instances, keyed as shown, answering 429 with a Retry-After header. Failed attempts count; successful ones do not clear the counter.

| Endpoint                                    | Key                     | Limit                        |
| ------------------------------------------- | ----------------------- | ---------------------------- |
| Password sign-in                            | IP, and email           | 10 per 15 min each           |
| Password sign-up                            | IP                      | 5 per hour                   |
| Forgot password, resend verification        | IP, and email           | 3 per hour each              |
| Reset and verification links (token checks) | IP                      | 10 per hour                  |
| Google callback                             | IP                      | 30 per 15 min                |
| Everything else                             | Account (or IP if none) | 600 per minute, a safety net |

No account lockout, because lockout lets anyone lock you out. A CAPTCHA only if abuse actually shows up. Sign-up creates nothing and a stray Account sees nothing, so the only costs of abuse are email sending and password guessing; the limits are hardest on the endpoints that send mail.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Email verification required** for password sign-up, closing the pre-registration takeover that the one-email-one-Account rule would otherwise open.
- **Google attached by subject id**, so an email change does not break the link and a matching string is never mistaken for a link.
- **Neutral responses everywhere** an Account's existence or kind could leak: sign-up, sign-in, forgot password.
- **Server-side sessions** with a session list and sign out everywhere.
- **Security events** as a table, with the view later.
- **Re-authentication** for sensitive actions.
- **Security notices** by email for the four changes a person cannot undo without knowing.
- **Self-service deletion** that unlinks Players rather than erasing the Group's record.
- **An operator** outside the domain, kept small.
- **Rate limits on every mail-sending and password-checking endpoint**, shared across instances.
- **Origin check** for cross-site request forgery instead of per-form tokens.

### Declined, and why

- **Magic-link sign-in.** Google covers the phones this app lives on, and the invitation flow works with a Google sign-in. Reconsider if password sign-ups turn out common.
- **Passkeys.** Worth adding later; nothing here blocks it because the sign-in method is a list on the Account.
- **Two-factor authentication.** Google brings its own, and the data protected is a football group's records.
- **Apple sign-in.** Not required on the web; the method list admits it later.
- **Merging two Accounts** that turn out to be one person. Better served by the Groups session's unlink-and-relink of a Player plus deleting the spare Account.
- **A grace period on deletion.** Immediate with re-authentication is enough for this data.
- **A "remember me" checkbox.** Every session is long.
- **New-device sign-in mails.** Noise on a phone app that stays signed in.
- **Avatar upload.** Storage and moderation for little gain.
- **A common-password list.** One more thing to maintain; rate limiting does the work.
- **Account lockout.** A denial-of-service vector.

## Hand-offs to other sessions

- **Groups (2)**: whether the display name is the default nickname on accepting an invitation; unlink and relink of a Player as the answer to lost access and duplicate Accounts; what happens to pending invitations addressed to a deleted Account's email; the Linked Player term may be tightened there.
- **Voting (9)**: a ballot belongs to the Player; "entered on behalf of" points at an Account and survives that Account's deletion as a tombstone. Settled in `09-voting.md`: as stated; the mark is visible to the Player and to Managers and Group admins, and an Account's Your open votes spans every Group it belongs to.
- **Notifications (11)**: the mails this session adds: verification, "an Account already exists", set or reset password, and the four security notices. Settled in `11-notifications.md`: all are Account mail, sent regardless of preference and without unsubscribe; the Account gains an Undeliverable mark with a banner, and its Deliveries, deleted with it.
- **Architecture (12)**: members only as the default authorization model; the session store, the shared rate-limit store, the Origin check, and the auth library that provides server-side sessions, verified Google id tokens and signed OAuth state; the candidate ADR on deletion semantics.
- **Operations (14)**: the operator allowlist as configuration; the unverified-Account purge and session expiry as scheduled work outside the request process.
- **Data migration (15)**: whether password hashes migrate; today's Accounts have no verified-email flag and no Google subject id, so the migration decides what to assume for each.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Account, Sign-in method, Verified email, Session, Sign out everywhere, Re-authentication, Security event, Operator, Linked Player. "Registered" is retired in both of its meanings. "Sign in" is the verb everywhere in copy; "user", "login" as a noun and "profile" are avoided.
