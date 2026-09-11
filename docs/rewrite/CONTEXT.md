# Sunday Heroes rewrite

The glossary of the rewrite: a competition manager where a Group of people run football competitions, record matches, derive standings and stats from them, and vote on each other after matches. Started by the identity session; every branch session adds the terms it resolves. The root `CONTEXT.md` stays accurate for the current app and is not edited by the rewrite.

## Language

### Identity

**Account**:
One person's proof of identity: an email, one or two Sign-in methods, a display name. It holds no role and owns nothing inside a Group; a Player attaches to it in order to vote.
_Avoid_: User, profile, login (as a noun)

**Sign-in method**:
One of the ways an Account proves itself: Password or Google. An Account has one or two and may detach one, never its last.
_Avoid_: Provider, credential, auth type

**Verified email**:
An Account's email once its owner has proven they control the address: at birth for a Google sign-up, on clicking the verification link for a password sign-up. Nothing beyond verification is possible until then.
_Avoid_: Confirmed email, activated account, registered

**Session**:
One signed-in device of an Account, opened by a sign-in and ended by signing out, by expiry, or by Sign out everywhere.
_Avoid_: Token, login session, device (as the thing itself)

**Sign out everywhere**:
The act that ends every Session of an Account other than the current one. Also happens on a password change or reset.
_Avoid_: Revoke all, log out all devices

**Re-authentication**:
A fresh password entry or Google sign-in, good for a few minutes, demanded before an Account changes its email or password, attaches or detaches a Sign-in method, signs out everywhere or deletes itself.
_Avoid_: Sudo mode, confirm password, step-up

**Security event**:
A record on an Account of something that touched its identity: a sign-in or failed sign-in, a password or email change, a method attached or detached, sessions ended, deletion, or an Operator's action. Deleted with the Account.
_Avoid_: Audit log, activity log, history

**Operator**:
A person on a configured allowlist who can look after Accounts (look one up, resend verification, mark an email verified, end sessions, delete) and can neither act as an Account nor see inside a Group. Not a role and not part of the domain.
_Avoid_: Superadmin, global admin, staff, support role

**Linked Player**:
A Player attached to a Member of its Group. The link is made by accepting a Player invitation, by picking oneself on a join link, or by an admin linking a Member; it ends when an admin unlinks, when the Membership ends, or when the Account is deleted. Nothing else about the Player changes on either side.
_Avoid_: Registered player, claimed player, verified player, user

### Groups

**Group**:
A circle of people who play together: the boundary of "who these people are". Owns a Player pool, competitions, Memberships, invitations and an activity record. Created deliberately by an Account, never at sign-up. Two competitions that share people belong in one Group; two circles that share nobody are two Groups.
_Avoid_: Dashboard, team (in this sense), club, organisation

**Player pool**:
The Players of a Group. Every competition in the Group draws its lineups and rosters from the same pool; nothing registers a Player to one competition.
_Avoid_: Squad (reserved for a format), roster (reserved for teams), member list

**Member**:
An Account in a Group: the record that "members only" checks and that every derived role hangs off. May be linked to at most one Player of the Group, or to none. Begins by creating the Group, accepting a Player invitation or using a join link; ends by leaving, removal, Account deletion or Group deletion.
_Avoid_: User, participant, registered player

**Group admin**:
A Member with the admin flag. Several per Group and no owner above them; any admin may promote or demote, never the last one. Runs the Group: settings, Members, Managers, Player repairs, join links, deletion.
_Avoid_: Owner, dashboard admin, superuser

**Manager**:
A Member assigned to one competition by a Group admin; "Competition manager" in full. Records and completes matches, runs Roster setup, generates schedules, submits ballots on behalf, creates and renames unlinked Players and issues Player invitations. Every Group admin is implicitly a Manager of every competition. Ends with the Membership.
_Avoid_: Moderator, organiser, coordinator

**Player**:
A person in a Group's Player pool: a durable record whose Nickname is its label. Either linked to one Member or unlinked, and either active or archived. Belongs to exactly one Group.
_Avoid_: DashboardPlayer, user, participant, account

**Nickname**:
The name a Player goes by in its Group, unique within the Group ignoring case and surrounding or repeated whitespace, with the typed casing kept for display. Renaming keeps the Player's history.
_Avoid_: Username, display name (that is the Account's), handle

**Archived Player**:
A Player hidden from lineup pickers, Roster setup and invitations, with its matches, stats, ballots and any link intact. Reversible. Not a deleted Player: deletion exists only for a Player with no match rows and no link.
_Avoid_: Inactive, retired, removed, deleted

**Player invitation**:
A single-use invitation tied to one unlinked Player, issued by a Group admin or Manager, either a bearer link or addressed to an email that must match the accepting Account's verified email. Accepting makes the Account a Member, if it is not one, and links it to the Player. Expires after 14 days; may be resent, revoked, or voided when its Player is linked or archived.
_Avoid_: Invite link (ambiguous with a join link), claim, registration link

**Join link**:
A multi-use invitation into a Group, made and revoked by a Group admin, without expiry unless one is set. Accepting makes the Account a Member and asks who they are: an unlinked Player from the pool, or a new Nickname.
_Avoid_: Group invite, public link, share link (reserved for the vote)

**Merge**:
The Group admin act that folds one Player into another. The survivor keeps its Nickname and link; if only the absorbed Player is linked, the link moves. Refused when both are linked to different Accounts or both appear in the same match.
_Avoid_: Combine, deduplicate, alias

**Activity record**:
An append-only record per Group of the acts that change who someone is or what they may do: Members, admins, Managers, Player repairs, invitations, settings. Names the acting Account, tombstoned on that Account's deletion. Visible to Group admins.
_Avoid_: Audit log, feed, history, timeline
