# Email deliverability

Voting invitations were landing in spam. This is why, and what the fix consists
of. The code half lives in `apps/server/src/services/email-service.ts`; this file
is the other half, which is DNS and configuration. Neither works alone.

## Why the mail was filtered

Everything went out through `smtp.gmail.com`, authenticated as a personal
`@gmail.com` mailbox, with `From: Sunday Heroes <someone@gmail.com>`. That is the
shape of a phishing message:

- **A brand display name on a consumer mailbox.** Filters see a branded identity
  on a domain shared with millions of unrelated senders.
- **A From domain that does not match the link domain.** The mail came from
  `gmail.com`; every call to action pointed at the app. Mismatch between the two
  is among the strongest phishing signals there is.
- **No reputation to earn.** SPF and DKIM passed, but they authenticated
  _gmail.com_, not us. There was nothing for a filter to learn to trust, and no
  amount of good sending behaviour could accumulate anywhere.
- **Bulk shape without bulk hygiene.** HTML-only bodies, no plain-text
  alternative, no `Reply-To`, and a whole match's invitations fired at once.

The third point is the load-bearing one. The rest compound it, but no content
tuning fixes mail sent from a consumer Gmail address.

## The fix

Send from `sunday-heroes.app` — a domain we own, signed with SPF, DKIM and DMARC,
and the same domain the links in the mail point at.

### 1. Provider

Any transactional provider works; the server talks plain SMTP and reads host,
port and credentials from the environment, so switching provider is an
environment change and no code change. Resend's free tier (3,000/month,
100/day) covers this project's volume with room to spare.

Create the account, add `sunday-heroes.app` as a sending domain, and it will
generate the DNS records for the next step.

### 2. DNS, at Porkbun

DNS for the domain is hosted at Porkbun (`*.ns.porkbun.com`). Before this work
the domain had no MX, SPF or DMARC records at all, so every record below was
additive and nothing had to be reconciled.

These are the records actually in place. Porkbun's _Host_ field takes the
prefix only — `send`, not `send.sunday-heroes.app` — or nothing at all for the
apex; a full name there yields `send.sunday-heroes.app.sunday-heroes.app` and
verifies never.

| Type    | Host                | Points at                   | What it does                           |
| ------- | ------------------- | --------------------------- | -------------------------------------- |
| `TXT`   | `resend._domainkey` | the DKIM public key         | signs as `d=sunday-heroes.app`         |
| `CNAME` | `send`              | `send.forge.rmta.net`       | return path; carries SPF and bounce MX |
| `CNAME` | `rsend`             | `rsend-euw1.forge.rmta.net` | EU sending region                      |
| `TXT`   | `_dmarc`            | the policy below            | reporting and enforcement              |
| `MX`    | _(apex)_            | `fwd1`/`fwd2.porkbun.com`   | inbound forwarding to a real mailbox   |

Two things about this shape are worth knowing, because they contradict what
most SPF documentation describes:

- **There is no SPF `TXT` record on the apex, and there should not be.** Resend
  publishes SPF behind the `send` CNAME, so the return path is
  `send.sunday-heroes.app` and SPF is resolved there. It relaxed-aligns with the
  organisational domain, which is all DMARC asks.
- **DKIM is the strong half here.** It signs `d=sunday-heroes.app` directly,
  which aligns strictly with the From domain. DMARC passes on DKIM alone even
  if a forwarder later breaks SPF, which is the usual failure mode.

The apex `MX` is unrelated to sending — it is Porkbun's free email forwarding,
which gives the domain a real inbox (`info@`, `dmarc@`) to receive replies and
DMARC reports. It cannot collide with Resend, which lives entirely on the
`send.` subdomain.

DMARC is ours to author rather than the provider's to generate:

| Type  | Host                       | Value                                                  |
| ----- | -------------------------- | ------------------------------------------------------ |
| `TXT` | `_dmarc.sunday-heroes.app` | `v=DMARC1; p=none; rua=mailto:dmarc@sunday-heroes.app` |

`p=none` asks for reports without affecting delivery. Once the reports show
every legitimate message passing — a couple of weeks is enough — tighten to
`p=quarantine`, and later `p=reject`. A `rua` address must be **on a domain we
control**: pointed at a third-party domain it silently receives nothing, unless
that domain publishes an authorisation record for ours.

Verify from a shell, and note that SPF is queried on the subdomain:

```bash
dig +short resend._domainkey.sunday-heroes.app TXT  # DKIM
dig +short send.sunday-heroes.app TXT               # SPF, via the CNAME
dig +short _dmarc.sunday-heroes.app TXT             # DMARC
dig +short sunday-heroes.app MX                     # inbound forwarding
```

A resolver that returns nothing for a record just edited is usually caching the
gap rather than reporting the truth. Query the nameservers directly to see what
is actually configured: `dig @maceio.ns.porkbun.com <name> TXT +short`.

### 3. Server environment

`MAIL_FROM` is **required** — the server refuses to start without it, alongside
the SMTP credentials it already demanded. Set these in Render before deploying
the code that reads them:

| Variable        | Value                                    |
| --------------- | ---------------------------------------- |
| `SMTP_HOST`     | `smtp.resend.com`                        |
| `SMTP_PORT`     | `587`                                    |
| `SMTP_SECURE`   | `false` (587 is STARTTLS)                |
| `SMTP_USER`     | `resend`                                 |
| `SMTP_PASSWORD` | a Resend API key                         |
| `MAIL_FROM`     | `Sunday Heroes <info@sunday-heroes.app>` |
| `MAIL_REPLY_TO` | unset — `MAIL_FROM` is a real mailbox    |

`MAIL_FROM` is separate from `SMTP_USER` on purpose: with a provider we
authenticate as an API key and send as the domain, so the two are no longer the
same string. It is a mailbox that actually receives — Porkbun forwards `info@`
to a real inbox — rather than a `noreply@` that drops replies on the floor, so
`MAIL_REPLY_TO` is left unset.

### 4. Point the app at the domain

`PRODUCTION_URL` is what the mail links at (`config.client`), so it must be
`https://www.sunday-heroes.app` for the From domain and the link domain to
match — which was the second bullet at the top of this file.

**`PRODUCTION_URL` also builds the Google OAuth redirect URIs**
(`config.google.redirectUri` and `redirectClientUrl`). Changing it without
registering `https://www.sunday-heroes.app/auth/google/callback` in the Google
Cloud Console first will break sign-in. Add the new URI there before, or
alongside, the environment change; both old and new can be registered at once,
which makes the switch reversible.

## Still open

- **`List-Unsubscribe`.** Gmail and Yahoo require it above 5,000 messages a day,
  and it is a positive reputation signal well below that. Doing it properly
  needs an opt-out flag on the player, a signed unsubscribe token, and a `POST`
  endpoint that honours one-click without a confirmation page — a feature with a
  migration, not a header. Deliberately not faked with a `mailto:` pointing at an
  unmonitored box.
- **Bounce and complaint handling.** The provider records both; nothing feeds
  them back into the database, so a dead address is retried forever.
