-- DropForeignKey
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_admin_id_fkey";

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
