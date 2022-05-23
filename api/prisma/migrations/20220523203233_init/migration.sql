-- CreateEnum
CREATE TYPE "Statistic" AS ENUM ('STATISTIC_ONE', 'STATISTIC_TWO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FINALIZED', 'FAULTY');

-- CreateTable
CREATE TABLE "XPChangeProposal" (
    "id" TEXT NOT NULL,
    "communityMemberEthAddress" TEXT NOT NULL,
    "statistic" "Statistic" NOT NULL,
    "status" "Status" NOT NULL,
    "value" INTEGER NOT NULL,
    "gnosisSafeId" VARCHAR(100) NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "ipfsURL" VARCHAR(100) NOT NULL,

    CONSTRAINT "XPChangeProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "prsMerged" INTEGER NOT NULL,
    "communityCallsAttended" INTEGER NOT NULL,
    "githubUsername" TEXT,
    "discordUsername" TEXT,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_ethAddress_key" ON "CommunityMember"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_githubUsername_key" ON "CommunityMember"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_discordUsername_key" ON "CommunityMember"("discordUsername");

-- AddForeignKey
ALTER TABLE "XPChangeProposal" ADD CONSTRAINT "XPChangeProposal_communityMemberEthAddress_fkey" FOREIGN KEY ("communityMemberEthAddress") REFERENCES "CommunityMember"("ethAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
