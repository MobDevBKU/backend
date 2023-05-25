/*
  Warnings:

  - You are about to drop the `_RouteToStop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RouteToStop" DROP CONSTRAINT "_RouteToStop_A_fkey";

-- DropForeignKey
ALTER TABLE "_RouteToStop" DROP CONSTRAINT "_RouteToStop_B_fkey";

-- DropTable
DROP TABLE "_RouteToStop";
