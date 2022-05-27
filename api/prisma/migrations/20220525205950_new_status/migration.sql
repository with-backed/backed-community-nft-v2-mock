/*
  Warnings:

  - You are about to drop the column `gnosisSafeId` on the `XPChangeProposal` table. All the data in the column will be lost.
  - Added the required column `gnosisSafeNonce` to the `XPChangeProposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "XPChangeProposal" DROP COLUMN "gnosisSafeId",
ADD COLUMN     "gnosisSafeNonce" INTEGER NOT NULL;
