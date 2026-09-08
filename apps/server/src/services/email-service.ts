import nodemailer from "nodemailer";
import { config } from "../config/config";
import { AppError } from "../utils/errors";
import { escapeHtml as esc } from "../utils/email-html";

/**
 * Deliverability is a property of this file, not of the copy in it. Mail that
 * lands in spam is mail nobody votes from, so every message leaves here in the
 * shape filters are looking for:
 *
 *   - a From on a domain we own and have signed — SPF, DKIM and DMARC on
 *     sunday-heroes.app, not a consumer mailbox borrowing a brand name;
 *   - a From domain that matches the domain the links point at, because a
 *     mismatch between the two is the single loudest phishing signal there is;
 *   - a plain-text alternative beside the HTML, because HTML-only is itself a
 *     spam heuristic;
 *   - a visible URL beside every button, so the message still works when images
 *     and styles are stripped;
 *   - a real Reply-To.
 *
 * The DNS half of this — the records that make the From domain mean something —
 * is in `docs/email-deliverability.md`. Neither half works without the other.
 */
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: config.smtp.secure === "true",
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  // A match's invitations are sent together (`MatchVotingService.sendVotingEmails`
  // maps them through `Promise.all`). The pool is what stops that fan-out from
  // reaching the provider as a burst, which is throttled at best and read as
  // bulk behaviour at worst.
  pool: true,
  maxConnections: 2,
  maxMessages: 50,
  rateDelta: 1000,
  rateLimit: 5,
});

type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * The one place a message becomes an actual send: identity (From, Reply-To) is
 * attached here so no caller can forget it, and every failure is reported as the
 * same operational `AppError`.
 */
async function send(message: Message, failure: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: config.mail.from,
      ...(config.mail.replyTo ? { replyTo: config.mail.replyTo } : {}),
      ...message,
    });
    return true;
  } catch (error) {
    throw new AppError(
      failure,
      500,
      error instanceof Error ? error.message : "Unknown error",
      true,
    );
  }
}

/** Header, body and footer chrome shared by every message. */
function shell(heading: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${heading}</h1>
      </div>

      <div style="padding: 20px; background-color: #f8fafc;">
        ${bodyHtml}
      </div>

      <div style="background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
        <p>You are receiving this because you play in a Sunday Heroes competition.</p>
        <p>&copy; ${new Date().getFullYear()} Sunday Heroes</p>
      </div>
    </div>
  `;
}

/**
 * A call to action, always twice: the button for clients that render it, and the
 * bare URL underneath for the ones that do not. A lone unlabelled button over a
 * stripped body is a link with nothing around it, which is what a phishing mail
 * looks like too.
 */
function callToAction(url: string, label: string): string {
  return `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${url}"
         style="background-color: #2563eb; color: white; padding: 12px 25px;
                text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        ${label}
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; text-align: center; word-break: break-all;">
      Or paste this into your browser:<br />
      <a href="${url}" style="color: #2563eb;">${url}</a>
    </p>
  `;
}

const TEXT_FOOTER =
  "\n\nYou are receiving this because you play in a Sunday Heroes competition.\n" +
  `© ${new Date().getFullYear()} Sunday Heroes`;

export class EmailService {
  static async sendVotingInvitation(
    email: string,
    nickname: string,
    matchId: string,
    playerId: string,
    matchDetails: {
      competitionName: string;
      competitionVotingDays: number;
      reminderDays: number;
      date: Date;
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
    },
    reminder: boolean = false,
  ): Promise<boolean> {
    const votingUrl = `${config.client}/vote/${matchId}?voterId=${playerId}`;
    const expiryDays = reminder
      ? matchDetails.reminderDays
      : matchDetails.competitionVotingDays;
    const playedOn = new Date(matchDetails.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const scoreline = `${matchDetails.homeTeam} ${matchDetails.homeScore} - ${matchDetails.awayScore} ${matchDetails.awayTeam}`;

    return send(
      {
        to: email,
        subject: `Vote for the best players in ${matchDetails.competitionName} match`,
        html: shell(
          `${reminder ? "Reminder" : "Time"} to vote!`,
          `
            <p>Hi ${esc(nickname)},</p>

            <p>The match you participated in is now complete:</p>

            <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #334155;">${esc(matchDetails.competitionName)}</h3>
              <p style="margin: 5px 0; font-size: 16px;">${esc(scoreline)}</p>
              <p style="margin: 5px 0; color: #64748b; font-size: 14px;">${esc(playedOn)}</p>
            </div>

            <p>Please vote for the 3 best players in this match:</p>

            ${callToAction(votingUrl, "Cast Your Votes")}

            <p style="color: #64748b; font-size: 14px;">
              The voting link will expire in ${expiryDays} days.
            </p>
          `,
        ),
        text:
          [
            `Hi ${nickname},`,
            "",
            "The match you participated in is now complete:",
            "",
            matchDetails.competitionName,
            scoreline,
            playedOn,
            "",
            "Please vote for the 3 best players in this match:",
            votingUrl,
            "",
            `The voting link will expire in ${expiryDays} days.`,
          ].join("\n") + TEXT_FOOTER,
      },
      "Failed to send voting invitation email",
    );
  }

  static async sendDashboardInvitation(
    email: string,
    inviteToken: string,
    details: {
      dashboardName: string;
      playerNickname: string;
      inviterName: string;
    },
  ): Promise<boolean> {
    const inviteUrl = `${config.client}/invite/${inviteToken}`;

    return send(
      {
        to: email,
        subject: `You're invited to join ${details.dashboardName}!`,
        html: shell(
          "&#127942; Dashboard Invitation",
          `
            <p>Hi there,</p>

            <p><strong>${esc(details.inviterName)}</strong> has invited you to join their dashboard:</p>

            <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #334155;">${esc(details.dashboardName)}</h3>
              <p style="margin: 5px 0; color: #64748b;">You'll be connected to player: <strong>${esc(details.playerNickname)}</strong></p>
            </div>

            <p>Click the button below to accept the invitation and connect to your player profile:</p>

            ${callToAction(inviteUrl, "Accept Invitation")}

            <p style="color: #64748b; font-size: 14px;">
              This invitation will expire in 7 days. If you don't have an account, you'll be prompted to sign in with Google.
            </p>
          `,
        ),
        text:
          [
            "Hi there,",
            "",
            `${details.inviterName} has invited you to join their dashboard: ${details.dashboardName}`,
            `You'll be connected to player: ${details.playerNickname}`,
            "",
            "Accept the invitation here:",
            inviteUrl,
            "",
            "This invitation will expire in 7 days. If you don't have an account, you'll be prompted to sign in with Google.",
          ].join("\n") + TEXT_FOOTER,
      },
      "Failed to send dashboard invitation email",
    );
  }

  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<boolean> {
    const resetUrl = `${config.client}/reset-password?token=${resetToken}`;

    return send(
      {
        to: email,
        subject: "Reset Your Password - Sunday Heroes",
        html: shell(
          "Password Reset",
          `
            <p>Hi there,</p>

            <p>We received a request to reset your password for your Sunday Heroes account.</p>

            <p>Click the button below to create a new password:</p>

            ${callToAction(resetUrl, "Reset Password")}

            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Security notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          `,
        ),
        text:
          [
            "Hi there,",
            "",
            "We received a request to reset your password for your Sunday Heroes account.",
            "",
            "Create a new password here:",
            resetUrl,
            "",
            "This link will expire in 1 hour for security reasons.",
            "",
            "If you didn't request a password reset, please ignore this email. Your password will remain unchanged.",
          ].join("\n") + TEXT_FOOTER,
      },
      "Failed to send password reset email",
    );
  }

  static async verifyConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      throw new AppError(
        "Failed to verify email connection",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true,
      );
    }
  }
}
