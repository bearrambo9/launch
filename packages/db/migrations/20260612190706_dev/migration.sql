-- CreateEnum
CREATE TYPE "ContainerState" AS ENUM ('NONE', 'RUNNING', 'STOPPED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "containerId" TEXT,
ADD COLUMN     "containerState" "ContainerState" NOT NULL DEFAULT 'NONE';
