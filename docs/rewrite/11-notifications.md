# Notifications and email

_Branch session 11, 2026-09-15. Output of the twelfth `/grill-with-docs` session for the rewrite. Takes `00-map.md` and `01-identity.md` through `10-stats.md` as settled; settles the open questions under area 11 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

Tell people what needs them, and nothing else. The group chat is where a Sunday football group already talks, so the share link posted there is the primary path to a vote and the app's own surfaces catch what the chat missed. Email is for the things only email can do: prove an address, recover an Account, tell a person their identity changed, carry an invitation to someone who has no Account yet, and, for the people who ask for it, remind them the day before a vote closes. This session sorts every message the app sends into two classes with different rules, gives the in-app channel its surfaces, defines the one reminder, and takes on the deliverability duties today's app ignores: a way off every reminder, and an answer to a bounced or complained-about address.

## Decisions carried in from the map

- A share link posted in the group chat is the primary path to a vote. Email stays for account matters and as an opt-in reminder.
- The reminder is an Account preference, never a competition setting; the competition contributes only the Voting deadline (competitions session).
- Your open votes is the in-app half of the share link, a per-Account list across Groups with a badge; a Voided ballot is always shown in-app (voting session).
- The identity session's mails: a verification link, "an Account already exists", set or reset password, and the four security notices on password change, email change to both addresses, a Sign-in method detached, and Account deletion. No "new device sign-in" mail. Rate limits are hardest on the endpoints that send mail.
- The groups session's addressed Player invitation: a mail to a typed address, accepted only by an Account whose Verified email matches, with resend, revoke and expiry after 14 days; the invitations list shows pending, accepted, expired and revoked.
- Hooks other sessions left open: vote opened, ballot voided, deadline extended and vote closed (voting); a "season closed" notice (seasons); Who's in? on a match to play (matches, deferred); a next Fixture or Tie reminder off a Planned date (league and Knockout, later). Which of these becomes a message, on which channel and by whose preference, is this session's.
- Scheduled work runs outside the request process (operations). A Group has a time zone (groups session).
- Members only, English only, mobile first.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Three templates in one file**: a voting invitation, a Group invitation and a password reset. The voting invitation doubles as the reminder with a flag, and the reminder variant states the reminder lead as "the link will expire in N days", which is the wrong number. Each carries a plain-text part, a button with the bare URL beneath it, and a footer explaining why the mail arrived.
- **Sent through Resend over SMTP** from a domain you own, signed with SPF, DKIM and DMARC, with a pooled transport that throttles a match's fan-out to five messages a second. The From domain matches the link domain on purpose. `docs/email-deliverability.md` holds the DNS half.
- **No unsubscribe, no bounce or complaint handling.** SMTP returns nothing after the handshake, so a dead address is mailed on every match forever and a spam complaint is never heard. The footer says "you are receiving this because you play in a Sunday Heroes competition" and offers no way to stop.
- **Two crons inside the web process**: midnight closes expired votes, noon sends reminders to every eligible non-voter with an email on every match closing within the competition's reminder lead. A voting invitation goes to every eligible voter with an email at match creation and again on every edit, since every edit reopens the vote.
- **The vote link carries the voter's Player id** in the query string. The Group invitation mail is reachable only through the API; the UI copies a link.
- **A send failure is thrown as an operational error** after the act it belongs to has committed, so a mail that did not leave is a log line and nothing more.

## The model

### Two classes of mail

Every message the app sends is one of two things.

**Account mail** is sent whenever the act that causes it happens. No preference governs it and it carries no unsubscribe, because it is either the person's only way in, or something they must know:

- the verification link on a password sign-up, and its resend;
- "an Account already exists" on a password sign-up for an address that has one;
- set or reset password;
- the four security notices: password changed, email changed (to the old address and the new), a Sign-in method detached, Account deleted;
- the addressed Player invitation, and its resend.

**A Notice** is a message about what is happening in a Group. It is governed by the Account's preferences, and every one carries a one-click way off. The first release has exactly one Notice, the **Vote reminder**. The model is built so that a second Notice, or a second channel, adds a switch and not a concept.

"Notification" stays the name of the channel in the map; a single message is an Account mail or a Notice, never "a notification".

### The in-app channel has no inbox

There is no bell, no list of messages, nothing to mark read. The in-app channel is the surfaces the other sessions already built, each derived from live state so it can never go stale:

- **Your open votes** and its badge: every match, across the Account's Groups, in which one of its Linked Players is a Voter without a Ballot, with the deadline.
- **Pending invitations** on the Account home: every addressed Player invitation to the Account's Verified email that is still pending.
- **The voided-ballot mark** on a match whose lineup change discarded the person's Ballot, which also puts the match back on Your open votes.
- **The delivery-problem banner** when the Account's email is Undeliverable (below).

### The Vote reminder

One preference on the Account, off for a new Account, one switch across every Group the Account belongs to: **Remind me by email before a vote closes**.

**How it is offered.** The **Reminder prompt** appears once per Account, on the first Ballot the person casts anywhere: "Remind me by email before a vote closes?" with Yes and Not now. Yes turns the preference on. Not now leaves it off and the prompt never returns. Account settings hold the switch from then on, either way.

**When it is sent.** A sweep runs every hour outside the request process. For each Account with the preference on and a Verified, deliverable email, it finds every open Vote in which one of the Account's Linked Players is a Voter without a Ballot and whose Voting deadline falls within the next 24 hours, and sends one mail listing all of them, across Groups, each with its share link and its deadline as a day in the Group's time zone: "Vote on Red 4-3 Blue in Sunday League closes tomorrow". Nothing is sent when the list is empty.

**Once per deadline.** A reminder is sent at most once per Voter per match per Voting deadline. Extend moves the deadline, so a vote extended past its reminder may earn a second one the day before the new deadline; that is the intended behaviour and needs no second rule. Un-complete and Complete run a fresh Vote with a fresh deadline and so a fresh reminder. A Voided ballot puts the Voter back among those without a Ballot; if the deadline is within 24 hours and no reminder went out for this deadline, the sweep catches it, otherwise the in-app mark is the notice. A Voting period of one day means the reminder can land on the completion day itself.

**What is not sent.** No "vote opened" mail: the share link in the chat is that. No results mail: Copy vote link pastes the results line into the chat. No "season closed" mail: the Season summary page is the moment to paste, with Copy as text. No mail to Managers or Group admins about turnout, joins or anything else: the Turnout is on the match page and the activity record is the admin's view.

### Copy reminder text

The chat-first reminder, beside the email one. On a match with an open Vote, every Member has **Copy reminder text**, which produces a chat line from the Turnout and the share link: "Still waiting on Marko, Ivan and Petar. Vote on Red 4-3 Blue, closes Wednesday" with the URL. It reads what every Member can already see; a read, never an act on the Vote.

### Delivery

Every message sent on any channel is recorded as a **Delivery**: the Account, or for an addressed invitation to an address with no Account the invitation itself, the kind of message, the channel, the instant, the provider's message id, and the outcome as the provider reports it back: delivered, bounced, complained, failed. It is what makes "once per deadline" a fact rather than a hope, what a bounce updates, and what lets an Operator answer "did Marko get the invitation".

A Delivery belongs to its Account and is deleted with it, like a Security event; an invitation's Delivery goes with the Group. Otherwise Deliveries are kept for 90 days.

**A send never blocks the act.** A Ballot is recorded, an invitation issued, a reset requested, whether or not the mail leaves. The send is queued, retried for a bounded time, then its Delivery is marked failed. The one place a failed send is shown in the app is the invitations list, where an addressed invitation reads "not delivered" with Resend beside it, because that is the one failure with a person in the app who can act on it. A person requesting a reset sees "check your email" either way, as the identity session already requires.

### Bounces, complaints and the Undeliverable mark

The provider reports hard bounces and spam complaints back through webhooks, and the app acts on them.

- **A hard bounce** marks the Account's email **Undeliverable**: Notices stop, and the app shows a banner, "we could not deliver mail to marko@example.com, check your address", until the mark clears.
- **A complaint** does the same and also turns the Vote reminder off, since a complaint is a wish expressed by the person.
- **Account mail the person asks for themselves**, a reset or a resend of verification, is still attempted on an Undeliverable address: they asked, and it is their only way back in.
- **The mark clears** when the person changes their email and verifies the new one, when they turn the Vote reminder back on in settings after a complaint (a complaint is not a dead address), or when an Operator clears it by hand after a provider outage or a typo since fixed at the mail host.
- Soft bounces and delays are the provider's to retry and change nothing here.

### Unsubscribe

Every Notice carries a signed link that turns its preference off without a sign-in, plus the `List-Unsubscribe` and one-click `List-Unsubscribe-Post` headers the large mailbox providers require of anyone sending in volume. The link is a token for one act on one Account, never expiring, revoked when the preference is toggled in settings. Account mail carries neither the link nor the headers.

### Sender identity and copy

From "Sunday Heroes" on the app's own domain, the same domain the links point at, signed with SPF, DKIM and DMARC. Reply-To a monitored mailbox of yours. Never a person's address in any header: the inviter is named in the body, not in Reply-To. Subject lines name the Group where one applies: "Vote on Red 4-3 Blue in Sunday League closes tomorrow", "Ana invited you to join Sunday League as Marko". A plain-text part beside the HTML, a bare URL beneath every button, dates as days in the Group's time zone, English only. The current code's deliverability comment carries over as behaviour, not as code.

### Unverified addresses and strangers

No Notice is ever sent to an address the app has not verified. The only mails an unverified address can receive are the verification link itself and its resend.

The addressed Player invitation is the only mail a stranger can ever receive from the app: it goes to an address an admin or Manager typed, which may belong to nobody with an Account. It says who typed the address and for which Group and Nickname, and carries the line "Ana typed your address; if this is not you, ignore it". Its repeats are bounded by the invitation's own life cycle: one mail per issue and per resend, both rate-limited, and nothing after acceptance, revocation or expiry.

### Operator

The Operator of the identity session gains two acts, both "look after Accounts" and neither seeing inside a Group: see an Account's Deliveries, and clear its Undeliverable mark by hand.

### Channels, and push later

A Notice is a message with a channel beneath it. The first release has one channel, email. Web Push is designed for and not built: it arrives as a second channel under the same Vote reminder preference, a checkbox beside "email", with its own Delivery rows and the same once-per-deadline rule. The PWA install prompt that makes push possible on a phone is the frontend session's. No new preference concept is needed for it.

### Deferred hooks

Who's in? on a match to play, and a "your next Fixture is on Saturday" reminder off a Planned date, stay out of the first release. Both fit the model as future Notices, each with its own preference switch, and nothing here forces them now.

## Scenarios that shaped the model

- **Sunday's match, Wednesday's deadline.** Ana completes the match Sunday evening; the vote opens with a three-day period, closing end of Wednesday. Ana pastes Copy vote link into the chat. Nine vote by Monday. Tuesday at 19:00 the sweep finds Marko, who turned the reminder on at his first ballot in March, without a ballot and a deadline within 24 hours: one mail, "closes tomorrow", with the share link. Marko votes from the mail. Ivan, who chose Not now, gets nothing but the badge and the chat.
- **Two Groups, one evening.** Petar plays five-a-side on Sunday and a League match on Saturday, both closing Wednesday. One mail Tuesday evening lists both matches under their Group names.
- **The holiday extension.** Marko got his reminder Tuesday; Wednesday the Manager extends to the following Friday. Thursday week, the sweep sees a new deadline with no reminder against it and sends a second mail. Without the Extend, the second would never go.
- **The dead address.** Ivan's employer closed his mailbox. Tuesday's reminder hard-bounces; the provider's webhook marks his email Undeliverable, the Delivery reads bounced, his reminders stop, and the next time he opens the app a banner asks him to check his address. He changes it, verifies the new one, and the mark clears. Had he never opened the app again, nothing would have been sent to the dead address twice.
- **The spam button.** Petar marks a reminder as spam from his phone. The complaint comes back, his reminder preference goes off, and no Notice reaches him until he turns it back on himself. Turning it on clears the mark.
- **The stranger's invitation.** Ana types a wrong address for Marko. A person who has never heard of the app gets one mail naming Ana, Sunday League and "Marko", with the line to ignore it. Ana notices, revokes, and issues a new one to the right address; the wrong address hears nothing more.
- **Mail down at the pitch.** The provider is down on Sunday evening. Ana's completion still opens the vote and the share link still works; the reminder that would have gone Tuesday is queued, retried, and either leaves or is marked failed. The invitation Ana issued that evening shows "not delivered" on the list on Monday, with Resend.
- **"Still waiting on…"** Wednesday morning, any Member presses Copy reminder text and pastes "Still waiting on Marko, Ivan and Petar. Vote on Red 4-3 Blue, closes today" into the chat. No email goes anywhere.
- **The wrong Marko, found Monday.** The lineup change voids three ballots. The three voters see the mark on the match page and the match is back on their open votes. Only those with the reminder on, and only if the deadline is within a day and no reminder went out yet, get a mail; the mark is the notice for everyone.
- **Marko leaves the Group.** His Membership ends, the Group drops out of Your open votes, and the sweep, which reads the same list, sends him nothing about it.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Two classes, Account mail and Notice**, with different rules on preferences and unsubscribe.
- **No in-app inbox**: the in-app channel is derived surfaces, never a list of messages.
- **One Notice in the first release, the Vote reminder**, off by default, one switch per Account across Groups.
- **The Reminder prompt at the first ballot**, asked once, with settings holding the switch afterwards.
- **An hourly sweep, one mail per Account within 24 hours of a deadline**, merged across Groups, once per Voter per match per deadline.
- **Bounce and complaint handling**: the Undeliverable mark, the banner, the preference turned off on a complaint, and Account mail the person asks for still attempted.
- **One-click unsubscribe** on every Notice, link and headers, none on Account mail.
- **The sender identity rules** the current code's deliverability comment already states, kept as behaviour.
- **No Notice to an unverified address**; the addressed invitation as the one mail a stranger can receive, with the "if this is not you" line.
- **Push as a later channel** under the same preference; the PWA prompt is the frontend session's.
- **Who's in? and the next-Fixture reminder stay deferred.**
- **Copy reminder text**, for every Member, from the Turnout.
- **A Delivery record** per message per channel per recipient, kept 90 days, deleted with the Account, an invitation's with the Group.
- **A send never blocks the act**; "not delivered" with Resend on the invitations list is the only failed send shown in the app.
- **Two Operator acts**: see Deliveries, clear an Undeliverable mark.
- **Re-enabling after a complaint** is the person's, and clears the mark.

### Declined, and why

- **A "vote opened" mail** to every voter at completion, as today. The share link in the chat is that, and the map made it primary.
- **A results mail** at close. Copy vote link pastes the results line where the argument happens.
- **A "season closed" mail.** The Season summary page with Copy as text is the moment; the seasons session had already left it optional.
- **A per-Group reminder preference.** One mailbox, one tolerance for mail; a per-Group mute can come later if anyone asks.
- **Reminder on by default.** The map settled the reminder as opt-in; the prompt at the first ballot is where the opt-in is offered.
- **A recurring Reminder prompt.** Nagging; the settings switch is one tap away.
- **A "vote opened" or "results" preference switch** beside the reminder. Every switch is a decision a person has to make; one is enough until someone asks.
- **Notices for Managers and Group admins**: low turnout, a join by link, an invitation accepted. The Turnout is on the match page, the activity record is the admin's view, and Copy reminder text covers the nudge.
- **A "new device sign-in" mail.** Declined by the identity session; unchanged here.
- **A weekly digest of Group activity.** The chat is the feed.
- **A notifications bell with read state.** Every in-app item is live state; read marks would be a second source of truth.
- **Reply-To the inviter** on an addressed invitation. A personal address in a header the recipient never asked for.
- **Retrying Notices to an Undeliverable address**, or **stopping Account mail on it.** The first mails a dead address forever, as today; the second locks a person out of their own recovery.
- **Push in the first release.** A second channel before the first has proved itself; the model leaves the door open.

## Hand-offs to other sessions

- **Identity (1)**: applied to that document in this session: the Operator gains "see an Account's Deliveries" and "clear an Undeliverable mark"; the identity mails are Account mail as defined here, sent regardless of preference and without unsubscribe; the Undeliverable mark and its banner on the Account; Deliveries deleted with the Account.
- **Groups (2)**: applied to that document in this session: the invitations list shows "not delivered" with Resend on an addressed invitation whose mail failed or bounced; the addressed invitation mail's content and its "if this is not you" line; the Account home's pending invitations as an in-app surface.
- **Competitions (3)**: nothing new; the competition contributes only the Voting deadline, as settled there.
- **Seasons (4)**: the optional "season closed" notice is declined; nothing to apply.
- **League (6)** and **Knockout (7)**: the next Fixture or Tie reminder stays later, as a future Notice off a Planned date.
- **Matches (8)**: Who's in? stays deferred, as a future Notice on a match to play; Copy reminder text joins Copy vote link on the match page.
- **Voting (9)**: the reminder reads the Voting deadline and the Voters without a Ballot; once per Voter per match per deadline, so Extend permits a second; a Voided ballot is notified in-app and by the same reminder rule, never by its own mail; Copy reminder text reads the Turnout; the vote opened, deadline extended and vote closed events send nothing.
- **Stats (10)**: nothing new; Copy as text of the Season summary is the season-closed message.
- **Architecture (12)**: the provider's HTTP API and webhooks, not SMTP, so bounces and complaints come back; an outbox with retries and a bounded life, the Delivery as its record; the hourly sweep and the deadline close as scheduled work outside the request process, idempotent on the Delivery; the Reminder prompt as a per-Account "asked" flag; the unsubscribe token as a signed, revocable, single-purpose credential; the Undeliverable mark on the Account; every render with a plain-text part; a mail catcher in every non-production environment so no test ever sends.
- **Frontend (13)**: the Reminder prompt after the first ballot; the Account settings switch; the delivery-problem banner; the "not delivered" state and Resend on the invitations list; Copy reminder text beside Copy vote link; the PWA install prompt, for push later; the mail templates' look.
- **Operations (14)**: the sending domain and its DNS records; the provider account and its webhooks' authenticity; the Reply-To mailbox; the sweep's schedule and its alert when it stops running; Delivery retention as a scheduled purge.
- **Data migration (15)**: nothing about mail migrates; every migrated Account starts with the reminder off and the prompt unasked; today's reminder lead is dropped with the competition settings, as the competitions session decided.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Account mail, Notice, Vote reminder, Reminder prompt, Copy reminder text, Delivery, Undeliverable. "Notification" as the name of a single message, "voting invitation email", "reminder lead", "inbox" and "alert" are avoided.
