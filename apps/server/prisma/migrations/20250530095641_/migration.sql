/*
  Warnings:

  - You are about to drop the column `nickname` on the `DashboardInvitation` table. All the data in the column will be lost.
  - Added the required column `dashboard_player_id` to the `DashboardInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DashboardInvitation" DROP COLUMN "nickname",
ADD COLUMN     "dashboard_player_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DashboardInvitation_dashboard_player_id_idx" ON "DashboardInvitation"("dashboard_player_id");

-- AddForeignKey
ALTER TABLE "DashboardInvitation" ADD CONSTRAINT "DashboardInvitation_dashboard_player_id_fkey" FOREIGN KEY ("dashboard_player_id") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
