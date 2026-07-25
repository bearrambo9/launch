/*
  Warnings:

  - You are about to drop the column `containerState` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "containerState";

-- DropEnum
DROP TYPE "ContainerState";
