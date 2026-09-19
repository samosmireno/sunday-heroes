import { ReactNode } from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "petrovic.sr.nikola@gmail.com";

/**
 * Public, and linked from Google's OAuth consent screen as
 * https://sunday-heroes.app/privacy. Every statement here was checked against
 * the code when it was written (Prisma schema, auth and email services, cookie
 * and storage use, the Render services), so a change to what the app stores,
 * sets or sends should change this page and its date too.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-secondary">
      <header className="flex items-center p-4 sm:p-6">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/assets/logo.webp"
            alt="Sunday Heroes Logo"
            className="h-12 w-12 object-contain"
          />
          <span
            className="font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Sunday Heroes
          </span>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-4 text-gray-300 sm:px-6">
        <h1
          className="font-oswald text-3xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Privacy policy
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Last updated: 19 September 2026
        </p>

        <p className="mt-6 leading-relaxed">
          Sunday Heroes (sunday-heroes.app) lets groups of friends run their own
          football competitions. This page explains what the app stores about
          you, why, and who handles it for us.
        </p>

        <Section title="Who we are">
          <p>
            Sunday Heroes runs this app. For any question about your data, or
            any of the requests below, email <EmailLink />.
          </p>
        </Section>

        <Section title="What we store">
          <h3 className="font-semibold text-gray-100">Your account</h3>
          <List>
            <li>
              Your email address and your name. If you sign in with Google, that
              is the first and last name Google gives us.
            </li>
            <li>
              Your password, if you create one. We store only a bcrypt hash of
              it, never the password itself. Accounts that sign in with Google
              have no password here.
            </li>
            <li>The date your account was created and a last sign-in date.</li>
            <li>
              A sign-in token for each browser you are signed in on, and, if you
              ask to reset your password, a one-time reset code.
            </li>
          </List>

          <h3 className="font-semibold text-gray-100">Your groups</h3>
          <List>
            <li>
              The groups you run, with their competitions, seasons, teams and
              settings.
            </li>
            <li>
              Players, under the nickname the group's organiser chooses. An
              organiser can add you as a player before you have an account; your
              player is linked to your account when you accept their invitation.
            </li>
            <li>The email address an invitation was sent to.</li>
            <li>
              Matches: date, teams, score, penalty shoot-out score and, if
              someone adds one, a video link.
            </li>
            <li>
              Each player's match stats: goals, assists, penalties, position,
              rating and man of the match.
            </li>
            <li>
              Votes: after a match, players vote for the best players. We store
              who voted for whom and how many points they gave.
            </li>
          </List>

          <h3 className="font-semibold text-gray-100">Server logs</h3>
          <p>
            Our server logs the requests it handles: the address requested, the
            result and how long it took. Some entries include your account id,
            or your email address when you sign up, log in or ask for a password
            reset.
          </p>
        </Section>

        <Section title="Why we use it">
          <List>
            <li>
              To run your groups' competitions: standings, fixtures, stats,
              match history and voting.
            </li>
            <li>To sign you in and keep you signed in.</li>
            <li>
              To send you emails about your account and your groups. We send
              only three kinds: invitations to join a group, invitations and
              reminders to vote after a match, and password reset links. No
              newsletters and no marketing.
            </li>
          </List>
        </Section>

        <Section title="Who can see it">
          <p>
            Competition pages and player stats pages can be opened by anyone who
            has the link, without signing in. They show players' nicknames,
            teams, results and stats.
          </p>
        </Section>

        <Section title="Who handles it for us">
          <List>
            <li>
              <strong className="text-gray-100">Render</strong> hosts the app
              and its database, in Frankfurt, Germany.
            </li>
            <li>
              <strong className="text-gray-100">Resend</strong> delivers our
              emails.
            </li>
            <li>
              <strong className="text-gray-100">Google</strong>, if you choose
              to sign in with Google. We ask Google only for your basic profile
              and email address, and keep just your name and email. We do not
              keep your Google account id or profile picture.
            </li>
          </List>
          <p>
            We use no analytics, advertising or error-tracking services, and we
            never sell your data.
          </p>
        </Section>

        <Section title="Cookies and browser storage">
          <List>
            <li>
              <Code>access-token</Code> and <Code>refresh-token</Code> cookies
              keep you signed in. Scripts on the page cannot read them. They
              expire after 30 minutes and 30 days, and are deleted when you log
              out.
            </li>
            <li>
              A <Code>sidebar_state</Code> cookie remembers whether you left the
              side menu open or closed. It is set only when you open or close
              the menu, and lasts 7 days.
            </li>
            <li>
              Local storage holds your account id, name, email address and role,
              so the app knows who is signed in when you come back. It is
              removed when you log out.
            </li>
            <li>
              Session storage, which your browser clears when you close the tab,
              holds the page to return to after you sign in and the picks on a
              ballot you have not submitted yet.
            </li>
          </List>
          <p>Nothing is stored in your browser for tracking or advertising.</p>
        </Section>

        <Section title="How long we keep it">
          <List>
            <li>We keep your data for as long as your account exists.</li>
            <li>
              Sign-in tokens expire after 30 days, and password reset codes
              after one hour.
            </li>
            <li>
              To have your account and data deleted, or to get a copy of it,
              email <EmailLink />. We answer within 30 days.
            </li>
          </List>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 space-y-4 leading-relaxed">
      <h2 className="font-oswald text-xl font-bold uppercase tracking-wider text-accent">
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="break-words rounded bg-panel-bg px-1 py-0.5 text-sm text-gray-100">
      {children}
    </code>
  );
}

function EmailLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="break-words font-semibold text-accent underline-offset-4 hover:underline"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
