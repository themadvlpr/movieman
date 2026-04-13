/*
  Warnings:

  - You are about to drop the column `userDescription` on the `UserMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserMedia" DROP COLUMN "userDescription";

-- CreateTable
CREATE TABLE "user_list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_list_item" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_list_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_list_userId_name_key" ON "user_list"("userId", "name");

-- CreateIndex
CREATE INDEX "user_list_item_listId_idx" ON "user_list_item"("listId");

-- CreateIndex
CREATE INDEX "user_list_item_mediaId_idx" ON "user_list_item"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "user_list_item_listId_mediaId_key" ON "user_list_item"("listId", "mediaId");

-- AddForeignKey
ALTER TABLE "user_list" ADD CONSTRAINT "user_list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_list_item" ADD CONSTRAINT "user_list_item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "user_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_list_item" ADD CONSTRAINT "user_list_item_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
