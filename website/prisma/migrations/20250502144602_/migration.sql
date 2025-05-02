/*
  Warnings:

  - A unique constraint covering the columns `[dataAccount]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dataAccount" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_dataAccount_key" ON "User"("dataAccount");
