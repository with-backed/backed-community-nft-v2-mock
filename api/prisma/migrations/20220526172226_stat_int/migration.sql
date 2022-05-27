/*
  Warnings:

  - Changed the type of `statistic` on the `XPChangeProposal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "XPChangeProposal" DROP COLUMN "statistic",
ADD COLUMN     "statistic" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Statistic";
