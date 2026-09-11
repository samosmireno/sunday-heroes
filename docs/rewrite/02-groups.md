# Groups, players and roles

_Branch session 2, 2026-09-11. Output of the third `/grill-with-docs` session for the rewrite. Takes `00-map.md` and `01-identity.md` as settled; settles the open questions under area 2 of the map and records the proposals put to the user, accepted and declined. Nothing here is code._

## Purpose

The social unit. A Group is a circle of people who play together. It owns a pool of Players and the competitions those Players appear in; people run it, belong to it and are invited into it. A Group is the boundary of "who these people are": two competitions that share people belong in one Group, two circles that share nobody are two Groups. An Account may create several, belong to several and administer several.

## Decisions carried in from the map

- Group is first class and created deliberately. Sign-up creates no Group.
- A Player is a Group-level identity: the nickname within the Group. An Account is optional and is what voting requires. One Account claims at most one Player per Group.
- Roles are derived, never stored on the Account: Group admin from Group membership, Competition manager from a per-competition assignment. Several Group admins per Group.
- Members only: every read is scoped to a Group the Account belongs to.
- Invitations gain a life cycle: list, revoke, expire, resend.
- From the identity session: an Account's deletion unlinks its Players and changes nothing else about them; it is refused while the Account is the only Group admin of any Group; anything naming a deleted Account as an actor keeps a tombstone. The Operator never sees inside a Group.

## What today does, as evidence

Facts found in the current repo during this session that shaped a decision. They describe the code the rewrite replaces; none of them carries over.

- **Membership has no record.** "Belongs to a dashboard" is computed, in two places, as "is the owner or has a DashboardPlayer with this user id". The dashboard and players reads carry no authentication, so any caller may pass any user id.
- **One dashboard per account is enforced by the database** (a unique owner column) and minted at every sign-up. The production dump of 2026-09-03 holds 51 accounts, 51 dashboards and 5 competitions: about 46 dashboards are empty shells created for invited players.
- **Players are born from typing.** A nickname typed into a match lineup creates a DashboardPlayer. The service to create one from a page exists and is mounted on no route, and would link the new player to the admin's own account. Rename, link and delete services exist without routes. There is no merge.
- **Nickname uniqueness is exact.** The unique index is case-sensitive and untrimmed, the server applies no validation at all, and the client title-cases only on the Add button. "Ana", "ana" and "Ana " are three players.
- **Orphan pruning is global.** After a competition reset or delete, and inside every match creation, every player anywhere with no match rows and no account is deleted, not only in the caller's dashboard.
- **Invitations are bearer links.** All 50 invitations ever issued have no email; 45 were accepted. The invitation carries no dashboard id and reaches the dashboard through the player. Validation is unauthenticated and answers with the inviter's name and email. Issuing a second invitation for the same player returns the first token. List, revoke and resend exist in the service and on no route. The copy-link path is `/invite/:token` while the accept page navigates to `/invitation/:token`.
- **Moderators are assigned by player id under a field named `userId`.** The duplicate check on assignment compares player ids and every authorization check compares user ids. A moderator whose player has no account silently has no privileges. Two moderator rows exist in production. A moderator may create players in the admin's dashboard through match creation, and may record and edit matches, manage teams and rosters and close voting; not create, reset or delete a competition, assign moderators, invite, or touch the dashboard.
- **The players page shows a Registered badge** whose tooltip is the linked account's email, and one action, Invite, for unregistered players. No rename, delete or unlink.
- **Career stats already follow the link.** A player's career page unions every player the same account has claimed across all dashboards, recomputed on every read, so accepting an invitation merges history instantly and an account deletion un-merges it. The players list counts only the single row, so the two disagree.

## The model

### Group

A Group has a **name** (1 to 50 characters, not unique anywhere), a **time zone** (prefilled from the creator's browser, used for voting deadlines and "today"), and a **default match format for new Pickup matches** (prefilled as five-a-side). All three are editable by any Group admin. Nothing else: no description, avatar, colour or slug.

A Group is created deliberately by a signed-in Account, which becomes its first Group admin. Creation asks "I play too", on by default, and when accepted creates the creator's Player with their display name as the nickname.

A Group owns its **Player pool**, its competitions with their Seasons, matches and ballots, its Memberships, its invitations and its activity record.

### Member

A **Member** is an Account in a Group: one row per Account per Group, with an **admin flag** and a join date. A Member may be linked to at most one Player of the Group, and may have none: the organiser who never plays, or someone who joined and has not been matched to a nickname yet. Membership is what "members only" checks, and it is what every derived role hangs off.

Membership begins by creating the Group, by accepting a Player invitation or by using a join link. It ends when the Member leaves, when an admin removes them, when their Account is deleted, or when the Group is deleted. Ending a Membership unlinks the Member's Player and drops every Manager assignment of that Member; the Player, its matches, stats and ballots stay.

### Roles

Both roles are derived. Neither is stored on the Account.

**Group admin**: a Member with the admin flag. Several per Group; no owner above them. Any admin may promote a Member to admin and demote another admin or themselves, never the last one. The last admin cannot leave, and the identity session refuses to delete their Account until they hand over or delete the Group.

**Manager** ("Competition manager" in full): a Member assigned to one competition by a Group admin. A Member with no Player may be a Manager. Every Group admin is implicitly a Manager of every competition in the Group. The assignment ends with the Membership.

| Act                                                                                          | Member | Manager | Group admin |
| -------------------------------------------------------------------------------------------- | ------ | ------- | ----------- |
| Read everything in the Group; vote through a Linked Player; edit own nickname; leave         | yes    | yes     | yes         |
| Record, edit and complete matches; Roster setup; generate a schedule; ballot on behalf       |        | yes     | yes         |
| Create and rename unlinked Players; issue Player invitations                                 |        | yes     | yes         |
| Change competition settings; roll a Season; delete a competition; assign Managers            |        |         | yes         |
| Archive, merge, delete, link and unlink Players; join links; revoke any invitation           |        |         | yes         |
| Remove Members; promote and demote admins; Group settings; delete the Group; activity record |        |         | yes         |

Members read and vote only. A Group that wants everyone recording makes them Managers, so "who may write" is a visible list rather than a default. Competition settings stay with admins because a change applies forward and is the kind of thing a group argues about.

### Player

A Player is a durable record in one Group's pool, and its **nickname** is a label on it: renaming keeps every match and ballot. A Player is either **linked** to one Member or unlinked, and either active or **archived**.

Players come into being in three ways: created from the Players page by an admin or Manager; typed into a match lineup by an admin or Manager, which stays because it is how the app is used at the pitch; and created for a person on "I play too" or on a join link.

Every competition in the Group draws from the same pool. Which competitions a Player actually plays in is decided by lineups and rosters, never by a per-competition registration. Two people with the same name are two nicknames in the pool.

### Nicknames

Unique within the Group ignoring case and surrounding or repeated whitespace, so "ana" and "Ana " collide with "Ana". The typed casing is kept for display. Length 1 to 30. Letters, digits, spaces, apostrophes, dots and hyphens; no other punctuation.

A Linked Player's nickname may be changed by its own Member and by any admin. An unlinked Player's nickname by admins and Managers. On "I play too" and on a join link the Account's display name is the default nickname; on a Player invitation the nickname is already set and the invitee is told "you will be Marko".

### Invitations

An invitation is the only way an Account claims a Player. No admin may link an Account by email without the person's act. Two kinds:

**Player invitation**: single-use, tied to one unlinked Player, issued by an admin or Manager. Either a **bearer link** to paste into the chat, or **addressed** to an email, in which case a mail goes out and only an Account whose verified email matches may accept. Expires after 14 days. Accepting creates the Membership if needed and links it to the Player in one step.

**Join link**: multi-use, made and revoked by an admin, no expiry unless the admin sets one. Meant for the chat. Accepting makes the Account a Member and asks them who they are: pick an unlinked Player from the pool, or type a new nickname prefilled from the display name. A wrong pick is repaired by an admin unlinking.

Life cycle for both: **resend** issues a fresh token and voids the old one; **revoke** voids it; an invitation is voided automatically when its Player is linked or archived, or when the Group is deleted. The list shows pending, accepted (by whom, when), expired and revoked. An addressed invitation names an address, not an Account, so it stays valid if the Account holding that address is deleted; a new Account on the same address may accept it.

Collisions on accept:

- The Account already has a Linked Player in this Group: refused with "you are already Marko here; ask an admin to merge". Merge stays admin-only so nobody absorbs someone else's history by accepting a second link.
- The Account is a Member with no Player: accepting links them.
- The Player was linked meanwhile: "already claimed", nothing happens.

Bearer and join links are shown with copy and the phone's share sheet. Validating a link before sign-in shows the Group name and the nickname, never the inviter's email.

### Repairs

All admin-only, all recorded in the activity record, all leaving matches, stats and ballots intact.

- **Rename**: change the nickname; history follows the Player.
- **Merge**: fold one Player into another. The admin picks the survivor, which keeps its nickname and link. If only the absorbed Player is linked, its link and Membership move to the survivor. Refused when both are linked to different Accounts, and when both appear in the same match. The absorbed Player is gone afterwards. Merge is the universal repair for two nicknames that turned out to be one person and for a joiner who typed a new nickname instead of picking their existing one.
- **Unlink**: detach a Member from their Player. Both stay.
- **Link**: attach a Member who has no Player to an unlinked Player directly, without an invitation, because the person already consented by joining. With unlink, this is the repair for "claimed the wrong nickname".
- **Archive**: hide a Player from lineup pickers, Roster setup and invitations. Reversible in one click. A Linked Player may be archived; the link and Membership stay, and the person can still vote in matches they played. This covers the one-off guest and the person who stopped coming.
- **Delete**: only a Player with no match rows and no link. The one destructive act, allowed only when it destroys nothing. Nothing prunes Players automatically.

### Leaving and removing

A Member **leaves** on their own, or an admin **removes** them. Either ends the Membership as described under Member. "Removing a Member" and "archiving their Player" are different acts: the first says the person is gone from the circle, the second only takes them out of the picker.

The identity session's lost-access case is: the admin removes the dead Member and issues a new Player invitation for the same Player, which the person accepts with a fresh Account.

### Deleting a Group

By a Group admin, after re-authentication and a confirmation screen listing what goes: the competitions with their Seasons, matches and ballots, the Players, the Memberships, the invitations, the activity record. Members' Accounts are untouched. Hard delete, no archive state, no grace period, matching the identity session's deletion style.

### Activity record

An append-only record per Group of the acts this session defines: Member joined, left or removed; admin promoted or demoted; Manager assigned or unassigned; Player created, renamed, merged, archived, unarchived, linked, unlinked or deleted; invitation issued, resent, revoked or accepted; Group settings changed. Each entry names the acting Account, tombstoned if that Account is later deleted. Visible to admins on one screen; not a feed for Members. Other sessions may add their own acts to it. It exists so that merge and unlink are safe to offer.

### Who sees what

Admins see the Members list with display name, email, nickname, role and join date, and the pending invitations alongside. Members see display names and nicknames only; emails are visible to admins alone, because they need them for addressed invitations. No "last active" and no stats on this list; the Players page has the stats.

### Navigation

Every in-Group link carries the Group, so a link pasted into a chat opens the right Group regardless of which one the person used last. The home page lists the person's Groups and pending invitations; with one Group it opens straight into it. The Group name at the top of every in-Group screen is the switcher: it opens the list of Groups with "Create a Group" and pending invitations. The frontend session decides how it looks.

## Scenarios that shaped the model

- **Two unrelated circles.** Coworkers on Tuesdays, high school friends on Sundays. Two Groups: each has its own pool and its own Managers, and a Manager in one does not exist in the other. One Group would put every high school friend in the coworker's picker and stats.
- **Two circles that overlap.** Four coworkers also come on Sunday. The admin chooses: one Group where those four have one Player each and everyone sees everyone, or two Groups where those four have two Players each and their stats are separate. No per-competition squad layer; archive and merge make the one-Group choice easy to tidy over time.
- **Two Markos.** Two nicknames in the pool, "Marko B" and "Marko K", offered in every competition of the Group.
- **A joiner who typed "Marko Br" while "Marko B" already had forty matches.** The admin merges the new Player into the old one; the survivor takes the link.
- **A member who lost their Google account and their email.** The admin removes the Member, re-invites the Player, and the person accepts with a new Account; the Operator deletes the stranded Account.

## Proposals

Put to the user as decisions, never adopted silently.

### Accepted

- **Membership as its own record**, separate from the Player link, so a non-playing organiser and a not-yet-matched joiner both fit.
- **"I play too" on Group creation**, on by default.
- **Players created ahead of matches**, from the Players page, alongside the inline path.
- **Rename and merge**, with the Player as a durable record and the nickname as its label.
- **Addressed or bearer Player invitations** as the only claim path; no silent linking by email.
- **Join link** as a second, multi-use kind of invitation, since every invitation ever issued was a bearer link for the chat.
- **Managers may invite**, because the Manager at the pitch is the one asking people to sign up.
- **Four separate acts** for leaving, removing, archiving and deleting, only the last destructive and only when it destroys nothing.
- **"Manager"** as the name of the per-competition role; every admin manages every competition implicitly.
- **Members read and vote only**; writing is a visible list of Managers.
- **Nickname normalisation**: case- and whitespace-insensitive uniqueness with the typed casing kept.
- **Unlink and direct link** between a Member and a Player as in-Group repairs.
- **Group activity record**, admin-visible, append-only.
- **Hard delete of a Group** with re-authentication.
- **Group in the URL** with a switcher in the shell.
- **Group settings limited to** name, time zone and default Pickup format.

### Declined, and why

- **Any Member may add a Pickup match.** Making everyone a writer by default hides who may write; an admin can make everyone a Manager in a minute.
- **Per-competition squads** to narrow the picker. The Group is the boundary; archive handles people who stopped coming. Reconsider if Groups grow large.
- **Per-Player extras**: position, shirt number, photo, notes. Nothing reads them yet.
- **Group description, avatar, colour, public slug.** Members only makes a public face pointless for now.
- **An owner above admins.** Several equal admins and the sole-admin rule cover handover.
- **Group archive state.** Cheap to add later; a soft-delete flag on every query is not.
- **Automatic orphan pruning.** It deleted Players across dashboards today; delete is an explicit act now.
- **Player transfer between Groups**, a cap on Members, global Group name uniqueness, "last active" on the Members list.

## Hand-offs to other sessions

- **Competitions (3)**: the Manager's scope on competition acts as listed in the role table; the default Pickup format is a Group setting the Pickup match form reads; Manager assignment is an admin act on the competition from the Members list.
- **Teams and rosters (5)**: Roster setup draws from the pool, excluding archived Players; a Manager may run it.
- **Matches (8)**: the inline "type a nickname" path creates a Player under the rules here; archived Players are not offered; a Manager records; match acts may join the activity record.
- **Voting (9)**: a Player votes through its Member's Account; an archived Linked Player may still vote in matches it played; "entered on behalf of" names the acting Account and tombstones like the activity record.
- **Stats (10)**: the pool is per Group, so a per-Group career is the natural unit; whether a career also spans an Account's Players across Groups is that session's call. A merge changes history retroactively by design.
- **Notifications (11)**: the addressed-invitation mail; the share sheet for bearer and join links.
- **Architecture (12)**: Membership as the row that "members only" checks; nickname normalisation as a stored normalised column or a functional unique index; merge as a transaction that re-points lineup rows and ballots; the activity record's shape; tombstones for deleted Accounts.
- **Frontend (13)**: the switcher, the home page with Groups and pending invitations, the "who are you" step of the join link, the Members and Players pages, the activity record screen.
- **Data migration (15)**: every dashboard with at least one competition becomes a Group with its owner as the first admin Member and each linked DashboardPlayer's user as a Member; empty dashboards are dropped; nickname collisions under the new rule are reported for the admin to merge; used invitations need not migrate, unused ones may be voided; the two moderator rows become Manager assignments if their players are linked.

## Vocabulary

Resolved in this session and added to `docs/rewrite/CONTEXT.md`: Group, Player pool, Member, Group admin, Manager, Player, Nickname, Linked Player (tightened), Archived Player, Player invitation, Join link, Merge, Activity record. "Dashboard", "moderator", "owner" and "registered" are retired. "Manager" is the word in copy; "Competition manager" only where the competition needs naming.
