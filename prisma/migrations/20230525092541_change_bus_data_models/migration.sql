-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'VI');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('HCMC', 'HANOI', 'DANANG');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('STATION', 'STOP');

-- CreateTable
CREATE TABLE "Route" (
    "id" INTEGER NOT NULL,
    "no" VARCHAR(10) NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "stopIds" INTEGER[],

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" INTEGER NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "type" "StopType" NOT NULL,
    "routeNoes" TEXT[],

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(12),
    "numOfBusUsage" INTEGER NOT NULL DEFAULT 0,
    "movedDistances" INTEGER NOT NULL DEFAULT 0,
    "area" "Area" NOT NULL DEFAULT 'HCMC',
    "language" "Language" NOT NULL DEFAULT 'VI',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Route_no_key" ON "Route"("no");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
