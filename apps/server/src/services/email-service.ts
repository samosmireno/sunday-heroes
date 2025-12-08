import nodemailer from "nodemailer";
import { config } from "../config/config";
import { AppError } from "../utils/errors";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

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
    reminder: boolean = false
  ): Promise<boolean> {
    const votingUrl = `${config.client}/vote/${matchId}?voterId=${playerId}`;

    const mailOptions = {
      from: `Sunday Heroes <${config.smtp.user}>`,
      to: email,
      subject: `Vote for the best players in ${matchDetails.competitionName} match`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">${`${reminder ? "Reminder" : "Time"}`} to vote!</h1>
              </div>
              
              <div style="padding: 20px; background-color: #f8fafc;">
                <p>Hi ${nickname},</p>
                
                <p>The match you participated in is now complete:</p>
                
                <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <h3 style="margin-top: 0; color: #334155;">${matchDetails.competitionName}</h3>
                  <p style="margin: 5px 0; font-size: 16px;">${matchDetails.homeTeam} ${matchDetails.homeScore} - ${matchDetails.awayScore} ${matchDetails.awayTeam}</p>
                  <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                    ${new Date(matchDetails.date).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                
                <p>Please vote for the 3 best players in this match:</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${votingUrl}" 
                     style="background-color: #2563eb; color: white; padding: 12px 25px; 
                            text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Cast Your Votes
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                  The voting link will expire in ${reminder ? matchDetails.reminderDays : matchDetails.competitionVotingDays} days.
                </p>
              </div>
              
              <div style="background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Sunday Heroes</p>
              </div>
            </div>
          `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new AppError(
        "Failed to send voting invitation email",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true
      );
    }
  }

  static async sendDashboardInvitation(
    email: string,
    inviteToken: string,
    details: {
      dashboardName: string;
      playerNickname: string;
      inviterName: string;
    }
  ): Promise<boolean> {
    const inviteUrl = `${config.client}/invite/${inviteToken}`;

    const mailOptions = {
      from: `Sunday Heroes <${config.smtp.user}>`,
      to: email,
      subject: `You're invited to join ${details.dashboardName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🏆 Dashboard Invitation</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <p>Hi there,</p>
            
            <p><strong>${details.inviterName}</strong> has invited you to join their dashboard:</p>
            
            <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #334155;">${details.dashboardName}</h3>
              <p style="margin: 5px 0; color: #64748b;">You'll be connected to player: <strong>${details.playerNickname}</strong></p>
            </div>
            
            <p>Click the button below to accept the invitation and connect to your player profile:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              This invitation will expire in 7 days. If you don't have an account, you'll be prompted to sign in with Google.
            </p>
          </div>
          
          <div style="background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Sunday Heroes</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new AppError(
        "Failed to send dashboard invitation email",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true
      );
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${config.client}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `Sunday Heroes <${config.smtp.user}>`,
      to: email,
      subject: "Reset Your Password - Sunday Heroes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <p>Hi there,</p>
            
            <p>We received a request to reset your password for your Sunday Heroes account.</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <div style="background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Sunday Heroes</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      throw new AppError(
        "Failed to send password reset email",
        500,
        error instanceof Error ? error.message : "Unknown error",
        true
      );
    }
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
        true
      );
    }
  }
}
