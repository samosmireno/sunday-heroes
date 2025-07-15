/*
  Warnings:

  - You are about to drop the column `created_at` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `current_season` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_id` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `is_round_robin` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `knockout_voting_period_days` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `min_players` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `reminder_days` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `track_seasons` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `voting_enabled` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `voting_period_days` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `competition_id` on the `CompetitionModerator` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `CompetitionModerator` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_player_id` on the `CompetitionModerator` table. All the data in the column will be lost.
  - You are about to drop the column `admin_id` on the `Dashboard` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Dashboard` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_player_id` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `invite_token` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `invited_by_id` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `used_at` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `used_by_user_id` on the `DashboardInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `DashboardPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_id` on the `DashboardPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `DashboardPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `away_team_score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `bracket_position` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `competition_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `home_team_score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `match_type` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_away_score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_home_score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `voting_ends_at` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `voting_status` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_player_id` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `is_home` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_scored` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `MatchTeam` table. All the data in the column will be lost.
  - You are about to drop the column `is_home` on the `MatchTeam` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `MatchTeam` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `MatchTeam` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `PlayerVote` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `PlayerVote` table. All the data in the column will be lost.
  - You are about to drop the column `match_player_id` on the `PlayerVote` table. All the data in the column will be lost.
  - You are about to drop the column `voter_id` on the `PlayerVote` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `last_used_at` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `competition_id` on the `TeamCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `TeamCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `goals_against` on the `TeamCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `goals_for` on the `TeamCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `TeamCompetition` table. All the data in the column will be lost.
  - You are about to drop the column `competition_id` on the `TeamRoster` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `TeamRoster` table. All the data in the column will be lost.
  - You are about to drop the column `dashboard_player_id` on the `TeamRoster` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `TeamRoster` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `family_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_registered` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[competitionId,dashboardPlayerId]` on the table `CompetitionModerator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminId]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inviteToken]` on the table `DashboardInvitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dashboardId,nickname]` on the table `DashboardPlayer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matchId,dashboardPlayerId]` on the table `MatchPlayer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matchId,teamId]` on the table `MatchTeam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matchId,voterId,matchPlayerId]` on the table `PlayerVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teamId,competitionId]` on the table `TeamCompetition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teamId,dashboardPlayerId,competitionId]` on the table `TeamRoster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dashboardId` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPlayers` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `CompetitionModerator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardPlayerId` to the `CompetitionModerator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminId` to the `Dashboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardPlayerId` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviteToken` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitedById` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardId` to the `DashboardPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchType` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardPlayerId` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isHome` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchId` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isHome` to the `MatchTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchId` to the `MatchTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `MatchTeam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchId` to the `PlayerVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchPlayerId` to the `PlayerVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterId` to the `PlayerVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUsedAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `TeamCompetition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `TeamCompetition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competitionId` to the `TeamRoster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardPlayerId` to the `TeamRoster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `TeamRoster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Competition" DROP CONSTRAINT "Competition_dashboard_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionModerator" DROP CONSTRAINT "CompetitionModerator_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionModerator" DROP CONSTRAINT "CompetitionModerator_dashboard_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardInvitation" DROP CONSTRAINT "DashboardInvitation_dashboard_player_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardInvitation" DROP CONSTRAINT "DashboardInvitation_invited_by_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardInvitation" DROP CONSTRAINT "DashboardInvitation_used_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardPlayer" DROP CONSTRAINT "DashboardPlayer_dashboard_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardPlayer" DROP CONSTRAINT "DashboardPlayer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_dashboard_player_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_match_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_team_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchTeam" DROP CONSTRAINT "MatchTeam_match_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchTeam" DROP CONSTRAINT "MatchTeam_team_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_match_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_match_player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_voter_id_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamCompetition" DROP CONSTRAINT "TeamCompetition_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamCompetition" DROP CONSTRAINT "TeamCompetition_team_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamRoster" DROP CONSTRAINT "TeamRoster_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamRoster" DROP CONSTRAINT "TeamRoster_dashboard_player_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamRoster" DROP CONSTRAINT "TeamRoster_team_id_fkey";

-- DropIndex
DROP INDEX "Competition_dashboard_id_idx";

-- DropIndex
DROP INDEX "CompetitionModerator_competition_id_dashboard_player_id_key";

-- DropIndex
DROP INDEX "CompetitionModerator_competition_id_idx";

-- DropIndex
DROP INDEX "CompetitionModerator_dashboard_player_id_idx";

-- DropIndex
DROP INDEX "Dashboard_admin_id_idx";

-- DropIndex
DROP INDEX "Dashboard_admin_id_key";

-- DropIndex
DROP INDEX "DashboardInvitation_dashboard_player_id_idx";

-- DropIndex
DROP INDEX "DashboardInvitation_expires_at_idx";

-- DropIndex
DROP INDEX "DashboardInvitation_invite_token_idx";

-- DropIndex
DROP INDEX "DashboardInvitation_invite_token_key";

-- DropIndex
DROP INDEX "DashboardPlayer_dashboard_id_idx";

-- DropIndex
DROP INDEX "DashboardPlayer_dashboard_id_nickname_key";

-- DropIndex
DROP INDEX "DashboardPlayer_dashboard_id_user_id_idx";

-- DropIndex
DROP INDEX "DashboardPlayer_user_id_idx";

-- DropIndex
DROP INDEX "Match_competition_id_idx";

-- DropIndex
DROP INDEX "MatchPlayer_dashboard_player_id_idx";

-- DropIndex
DROP INDEX "MatchPlayer_is_home_idx";

-- DropIndex
DROP INDEX "MatchPlayer_match_id_dashboard_player_id_key";

-- DropIndex
DROP INDEX "MatchPlayer_match_id_idx";

-- DropIndex
DROP INDEX "MatchPlayer_team_id_idx";

-- DropIndex
DROP INDEX "MatchTeam_match_id_idx";

-- DropIndex
DROP INDEX "MatchTeam_match_id_team_id_key";

-- DropIndex
DROP INDEX "MatchTeam_team_id_idx";

-- DropIndex
DROP INDEX "PlayerVote_match_id_idx";

-- DropIndex
DROP INDEX "PlayerVote_match_id_voter_id_match_player_id_key";

-- DropIndex
DROP INDEX "PlayerVote_match_player_id_idx";

-- DropIndex
DROP INDEX "PlayerVote_voter_id_idx";

-- DropIndex
DROP INDEX "RefreshToken_user_id_idx";

-- DropIndex
DROP INDEX "TeamCompetition_competition_id_idx";

-- DropIndex
DROP INDEX "TeamCompetition_team_id_competition_id_key";

-- DropIndex
DROP INDEX "TeamCompetition_team_id_idx";

-- DropIndex
DROP INDEX "TeamRoster_dashboard_player_id_competition_id_idx";

-- DropIndex
DROP INDEX "TeamRoster_team_id_competition_id_idx";

-- DropIndex
DROP INDEX "TeamRoster_team_id_dashboard_player_id_competition_id_key";

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "created_at",
DROP COLUMN "current_season",
DROP COLUMN "dashboard_id",
DROP COLUMN "is_round_robin",
DROP COLUMN "knockout_voting_period_days",
DROP COLUMN "min_players",
DROP COLUMN "reminder_days",
DROP COLUMN "track_seasons",
DROP COLUMN "voting_enabled",
DROP COLUMN "voting_period_days",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentSeason" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "dashboardId" TEXT NOT NULL,
ADD COLUMN     "isRoundRobin" BOOLEAN,
ADD COLUMN     "knockoutVotingPeriodDays" INTEGER,
ADD COLUMN     "minPlayers" INTEGER NOT NULL,
ADD COLUMN     "reminderDays" INTEGER,
ADD COLUMN     "trackSeasons" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "votingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "votingPeriodDays" INTEGER;

-- AlterTable
ALTER TABLE "CompetitionModerator" DROP COLUMN "competition_id",
DROP COLUMN "created_at",
DROP COLUMN "dashboard_player_id",
ADD COLUMN     "competitionId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dashboardPlayerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dashboard" DROP COLUMN "admin_id",
DROP COLUMN "created_at",
ADD COLUMN     "adminId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DashboardInvitation" DROP COLUMN "created_at",
DROP COLUMN "dashboard_player_id",
DROP COLUMN "expires_at",
DROP COLUMN "invite_token",
DROP COLUMN "invited_by_id",
DROP COLUMN "updated_at",
DROP COLUMN "used_at",
DROP COLUMN "used_by_user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dashboardPlayerId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "inviteToken" TEXT NOT NULL,
ADD COLUMN     "invitedById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "usedByUserId" TEXT;

-- AlterTable
ALTER TABLE "DashboardPlayer" DROP COLUMN "created_at",
DROP COLUMN "dashboard_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dashboardId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "away_team_score",
DROP COLUMN "bracket_position",
DROP COLUMN "competition_id",
DROP COLUMN "created_at",
DROP COLUMN "home_team_score",
DROP COLUMN "is_completed",
DROP COLUMN "match_type",
DROP COLUMN "penalty_away_score",
DROP COLUMN "penalty_home_score",
DROP COLUMN "voting_ends_at",
DROP COLUMN "voting_status",
ADD COLUMN     "awayTeamScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bracketPosition" INTEGER,
ADD COLUMN     "competitionId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "homeTeamScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchType" "MatchType" NOT NULL,
ADD COLUMN     "penaltyAwayScore" INTEGER,
ADD COLUMN     "penaltyHomeScore" INTEGER,
ADD COLUMN     "votingEndsAt" TIMESTAMP(3),
ADD COLUMN     "votingStatus" "VotingStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "MatchPlayer" DROP COLUMN "created_at",
DROP COLUMN "dashboard_player_id",
DROP COLUMN "is_home",
DROP COLUMN "match_id",
DROP COLUMN "penalty_scored",
DROP COLUMN "team_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dashboardPlayerId" TEXT NOT NULL,
ADD COLUMN     "isHome" BOOLEAN NOT NULL,
ADD COLUMN     "matchId" TEXT NOT NULL,
ADD COLUMN     "penaltyScored" BOOLEAN,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MatchTeam" DROP COLUMN "created_at",
DROP COLUMN "is_home",
DROP COLUMN "match_id",
DROP COLUMN "team_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isHome" BOOLEAN NOT NULL,
ADD COLUMN     "matchId" TEXT NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlayerVote" DROP COLUMN "created_at",
DROP COLUMN "match_id",
DROP COLUMN "match_player_id",
DROP COLUMN "voter_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchId" TEXT NOT NULL,
ADD COLUMN     "matchPlayerId" TEXT NOT NULL,
ADD COLUMN     "voterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "last_used_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TeamCompetition" DROP COLUMN "competition_id",
DROP COLUMN "created_at",
DROP COLUMN "goals_against",
DROP COLUMN "goals_for",
DROP COLUMN "team_id",
ADD COLUMN     "competitionId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalsFor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamRoster" DROP COLUMN "competition_id",
DROP COLUMN "created_at",
DROP COLUMN "dashboard_player_id",
DROP COLUMN "team_id",
ADD COLUMN     "competitionId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dashboardPlayerId" TEXT NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "family_name",
DROP COLUMN "given_name",
DROP COLUMN "is_registered",
DROP COLUMN "last_login",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "familyName" TEXT,
ADD COLUMN     "givenName" TEXT,
ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Competition_dashboardId_idx" ON "Competition"("dashboardId");

-- CreateIndex
CREATE INDEX "CompetitionModerator_competitionId_idx" ON "CompetitionModerator"("competitionId");

-- CreateIndex
CREATE INDEX "CompetitionModerator_dashboardPlayerId_idx" ON "CompetitionModerator"("dashboardPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionModerator_competitionId_dashboardPlayerId_key" ON "CompetitionModerator"("competitionId", "dashboardPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_adminId_key" ON "Dashboard"("adminId");

-- CreateIndex
CREATE INDEX "Dashboard_adminId_idx" ON "Dashboard"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardInvitation_inviteToken_key" ON "DashboardInvitation"("inviteToken");

-- CreateIndex
CREATE INDEX "DashboardInvitation_inviteToken_idx" ON "DashboardInvitation"("inviteToken");

-- CreateIndex
CREATE INDEX "DashboardInvitation_dashboardPlayerId_idx" ON "DashboardInvitation"("dashboardPlayerId");

-- CreateIndex
CREATE INDEX "DashboardInvitation_expiresAt_idx" ON "DashboardInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "DashboardPlayer_dashboardId_idx" ON "DashboardPlayer"("dashboardId");

-- CreateIndex
CREATE INDEX "DashboardPlayer_userId_idx" ON "DashboardPlayer"("userId");

-- CreateIndex
CREATE INDEX "DashboardPlayer_dashboardId_userId_idx" ON "DashboardPlayer"("dashboardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardPlayer_dashboardId_nickname_key" ON "DashboardPlayer"("dashboardId", "nickname");

-- CreateIndex
CREATE INDEX "Match_competitionId_idx" ON "Match"("competitionId");

-- CreateIndex
CREATE INDEX "MatchPlayer_matchId_idx" ON "MatchPlayer"("matchId");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_idx" ON "MatchPlayer"("dashboardPlayerId");

-- CreateIndex
CREATE INDEX "MatchPlayer_teamId_idx" ON "MatchPlayer"("teamId");

-- CreateIndex
CREATE INDEX "MatchPlayer_isHome_idx" ON "MatchPlayer"("isHome");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPlayer_matchId_dashboardPlayerId_key" ON "MatchPlayer"("matchId", "dashboardPlayerId");

-- CreateIndex
CREATE INDEX "MatchTeam_matchId_idx" ON "MatchTeam"("matchId");

-- CreateIndex
CREATE INDEX "MatchTeam_teamId_idx" ON "MatchTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchTeam_matchId_teamId_key" ON "MatchTeam"("matchId", "teamId");

-- CreateIndex
CREATE INDEX "PlayerVote_matchId_idx" ON "PlayerVote"("matchId");

-- CreateIndex
CREATE INDEX "PlayerVote_voterId_idx" ON "PlayerVote"("voterId");

-- CreateIndex
CREATE INDEX "PlayerVote_matchPlayerId_idx" ON "PlayerVote"("matchPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVote_matchId_voterId_matchPlayerId_key" ON "PlayerVote"("matchId", "voterId", "matchPlayerId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "TeamCompetition_teamId_idx" ON "TeamCompetition"("teamId");

-- CreateIndex
CREATE INDEX "TeamCompetition_competitionId_idx" ON "TeamCompetition"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCompetition_teamId_competitionId_key" ON "TeamCompetition"("teamId", "competitionId");

-- CreateIndex
CREATE INDEX "TeamRoster_teamId_competitionId_idx" ON "TeamRoster"("teamId", "competitionId");

-- CreateIndex
CREATE INDEX "TeamRoster_dashboardPlayerId_competitionId_idx" ON "TeamRoster"("dashboardPlayerId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRoster_teamId_dashboardPlayerId_competitionId_key" ON "TeamRoster"("teamId", "dashboardPlayerId", "competitionId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardPlayer" ADD CONSTRAINT "DashboardPlayer_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardPlayer" ADD CONSTRAINT "DashboardPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_dashboardPlayerId_fkey" FOREIGN KEY ("dashboardPlayerId") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_dashboardPlayerId_fkey" FOREIGN KEY ("dashboardPlayerId") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_matchPlayerId_fkey" FOREIGN KEY ("matchPlayerId") REFERENCES "MatchPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_dashboardPlayerId_fkey" FOREIGN KEY ("dashboardPlayerId") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_dashboardPlayerId_fkey" FOREIGN KEY ("dashboardPlayerId") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
