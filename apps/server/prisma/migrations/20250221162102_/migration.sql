/*
  Warnings:

  - Added the required column `position` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchPlayer" ADD COLUMN     "position" INTEGER NOT NULL;
