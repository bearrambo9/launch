-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "dockerImage" TEXT NOT NULL DEFAULT 'launch-base:latest';
