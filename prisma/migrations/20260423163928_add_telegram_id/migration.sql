/*
  Warnings:

  - You are about to drop the column `description` on the `user_list` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegramId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "telegramId" TEXT;

-- AlterTable
ALTER TABLE "user_list" DROP COLUMN "description";

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramId_key" ON "user"("telegramId");
