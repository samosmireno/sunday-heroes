-- CreateTable
CREATE TABLE "CompetitionInvitation" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "invite_token" TEXT NOT NULL,
    "email" TEXT,
    "nickname" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "used_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionInvitation_invite_token_key" ON "CompetitionInvitation"("invite_token");

-- CreateIndex
CREATE INDEX "CompetitionInvitation_invite_token_idx" ON "CompetitionInvitation"("invite_token");

-- CreateIndex
CREATE INDEX "CompetitionInvitation_competition_id_idx" ON "CompetitionInvitation"("competition_id");

-- CreateIndex
CREATE INDEX "CompetitionInvitation_expires_at_idx" ON "CompetitionInvitation"("expires_at");

-- AddForeignKey
ALTER TABLE "CompetitionInvitation" ADD CONSTRAINT "CompetitionInvitation_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionInvitation" ADD CONSTRAINT "CompetitionInvitation_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionInvitation" ADD CONSTRAINT "CompetitionInvitation_used_by_user_id_fkey" FOREIGN KEY ("used_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
