/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'VI');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('HCMC', 'HANOI', 'DANANG');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "area" "Area" NOT NULL DEFAULT 'HCMC',
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'VI',
ADD COLUMN     "movedDistances" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numOfBusUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" VARCHAR(12),
ADD COLUMN     "username" VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "header" VARCHAR(255) NOT NULL,
    "payload" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "userPhone" VARCHAR(15) NOT NULL,
    "content" TEXT NOT NULL,
    "star" SMALLINT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
