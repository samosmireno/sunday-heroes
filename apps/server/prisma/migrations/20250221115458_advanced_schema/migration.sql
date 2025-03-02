-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('LEAGUE', 'DUEL', 'KNOCKOUT');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('FIVE_A_SIDE', 'SIX_A_SIDE', 'SEVEN_A_SIDE', 'ELEVEN_A_SIDE');

-- CreateEnum
CREATE TYPE "VotingStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'PLAYER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "given_name" TEXT,
    "family_name" TEXT,
    "nickname" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompetitionType" NOT NULL,
    "track_seasons" BOOLEAN NOT NULL DEFAULT false,
    "current_season" INTEGER NOT NULL DEFAULT 1,
    "min_players" INTEGER NOT NULL,
    "voting_enabled" BOOLEAN NOT NULL DEFAULT false,
    "voting_period_days" INTEGER,
    "knockout_voting_period_days" INTEGER,
    "reminder_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionModerator" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionModerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamCompetition" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamCompetition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "match_type" "MatchType" NOT NULL,
    "home_team_score" INTEGER NOT NULL DEFAULT 0,
    "away_team_score" INTEGER NOT NULL DEFAULT 0,
    "penalty_home_score" INTEGER,
    "penalty_away_score" INTEGER,
    "round" INTEGER NOT NULL,
    "bracket_position" INTEGER,
    "voting_status" "VotingStatus" NOT NULL DEFAULT 'OPEN',
    "voting_ends_at" TIMESTAMP(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchTeam" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_home" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_home" BOOLEAN NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "penalty_scored" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerVote" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "match_player_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_nickname_idx" ON "User"("nickname");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_admin_id_key" ON "Dashboard"("admin_id");

-- CreateIndex
CREATE INDEX "Dashboard_admin_id_idx" ON "Dashboard"("admin_id");

-- CreateIndex
CREATE INDEX "Competition_dashboard_id_idx" ON "Competition"("dashboard_id");

-- CreateIndex
CREATE INDEX "CompetitionModerator_competition_id_idx" ON "CompetitionModerator"("competition_id");

-- CreateIndex
CREATE INDEX "CompetitionModerator_user_id_idx" ON "CompetitionModerator"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionModerator_competition_id_user_id_key" ON "CompetitionModerator"("competition_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE INDEX "TeamCompetition_team_id_idx" ON "TeamCompetition"("team_id");

-- CreateIndex
CREATE INDEX "TeamCompetition_competition_id_idx" ON "TeamCompetition"("competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCompetition_team_id_competition_id_key" ON "TeamCompetition"("team_id", "competition_id");

-- CreateIndex
CREATE INDEX "Match_competition_id_idx" ON "Match"("competition_id");

-- CreateIndex
CREATE INDEX "MatchTeam_match_id_idx" ON "MatchTeam"("match_id");

-- CreateIndex
CREATE INDEX "MatchTeam_team_id_idx" ON "MatchTeam"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "MatchTeam_match_id_team_id_key" ON "MatchTeam"("match_id", "team_id");

-- CreateIndex
CREATE INDEX "MatchPlayer_match_id_idx" ON "MatchPlayer"("match_id");

-- CreateIndex
CREATE INDEX "MatchPlayer_player_id_idx" ON "MatchPlayer"("player_id");

-- CreateIndex
CREATE INDEX "MatchPlayer_team_id_idx" ON "MatchPlayer"("team_id");

-- CreateIndex
CREATE INDEX "MatchPlayer_is_home_idx" ON "MatchPlayer"("is_home");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPlayer_match_id_player_id_key" ON "MatchPlayer"("match_id", "player_id");

-- CreateIndex
CREATE INDEX "PlayerVote_match_id_idx" ON "PlayerVote"("match_id");

-- CreateIndex
CREATE INDEX "PlayerVote_voter_id_idx" ON "PlayerVote"("voter_id");

-- CreateIndex
CREATE INDEX "PlayerVote_match_player_id_idx" ON "PlayerVote"("match_player_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVote_match_id_voter_id_match_player_id_key" ON "PlayerVote"("match_id", "voter_id", "match_player_id");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchTeam" ADD CONSTRAINT "MatchTeam_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_match_player_id_fkey" FOREIGN KEY ("match_player_id") REFERENCES "MatchPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
