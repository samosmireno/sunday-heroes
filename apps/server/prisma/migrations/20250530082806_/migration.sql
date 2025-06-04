/*
  Warnings:

  - You are about to drop the `CompetitionInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompetitionInvitation" DROP CONSTRAINT "CompetitionInvitation_invited_by_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionInvitation" DROP CONSTRAINT "CompetitionInvitation_used_by_user_id_fkey";

-- DropTable
DROP TABLE "CompetitionInvitation";

-- CreateTable
CREATE TABLE "DashboardInvitation" (
    "id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "invite_token" TEXT NOT NULL,
    "email" TEXT,
    "nickname" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "used_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardInvitation_invite_token_key" ON "DashboardInvitation"("invite_token");

-- CreateIndex
CREATE INDEX "DashboardInvitation_invite_token_idx" ON "DashboardInvitation"("invite_token");

-- CreateIndex
CREATE INDEX "DashboardInvitation_expires_at_idx" ON "DashboardInvitation"("expires_at");

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_used_by_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
