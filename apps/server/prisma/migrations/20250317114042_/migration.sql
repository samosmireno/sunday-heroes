/*
  Warnings:

  - Made the column `given_name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "given_name" SET NOT NULL;
