/*
  Warnings:

  - You are about to drop the column `genreIds` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `posterEn` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `posterRu` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `posterUk` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `titleEn` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `titleRu` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `titleUk` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `tmdbRating` on the `UserMedia` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `UserMedia` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,mediaId]` on the table `UserMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserMedia_userId_mediaId_type_key";

-- AlterTable
ALTER TABLE "UserMedia" DROP COLUMN "genreIds",
DROP COLUMN "posterEn",
DROP COLUMN "posterRu",
DROP COLUMN "posterUk",
DROP COLUMN "releaseDate",
DROP COLUMN "titleEn",
DROP COLUMN "titleRu",
DROP COLUMN "titleUk",
DROP COLUMN "tmdbRating",
DROP COLUMN "type";

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "tmdbRating" DOUBLE PRECISION,
    "genreIds" TEXT,
    "releaseDate" TIMESTAMP(3),
    "titleEn" TEXT,
    "titleRu" TEXT,
    "titleUk" TEXT,
    "posterEn" TEXT,
    "posterRu" TEXT,
    "posterUk" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_tmdbId_type_key" ON "Media"("tmdbId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "UserMedia_userId_mediaId_key" ON "UserMedia"("userId", "mediaId");

-- AddForeignKey
ALTER TABLE "UserMedia" ADD CONSTRAINT "UserMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
