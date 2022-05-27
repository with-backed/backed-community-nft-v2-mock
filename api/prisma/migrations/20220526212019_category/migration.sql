/*
  Warnings:

  - You are about to drop the column `statistic` on the `XPChangeProposal` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `XPChangeProposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "XPChangeProposal" DROP COLUMN "statistic",
ADD COLUMN     "categoryId" INTEGER NOT NULL;
