import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

import {
  CommunityMember,
  PrismaClient,
  Statistic,
  Status,
} from "@prisma/client";

const port = process.env.PORT || 3001;

const prisma = new PrismaClient();

type CreateProposalBody = {
  ethAddress: string;
  statistic: Statistic;
  value: number;
};

type DecisionProposalBody = {
  id: string;
};

app.post("/proposals/create", async (req, res) => {
  const { ethAddress, statistic, value } = req.body as CreateProposalBody;

  let communityMember: CommunityMember | null;

  communityMember = await prisma.communityMember.findUnique({
    where: { ethAddress },
  });

  if (!communityMember)
    communityMember = await createCommunityMember(ethAddress);

  const proposal = await prisma.xPChangeProposal.create({
    data: {
      status: Status.PENDING,
      communityMemberEthAddress: ethAddress,
      statistic,
      value,
      txHash: "",
      gnosisSafeId: "",
      ipfsURL: "",
    },
  });

  return res.json({
    proposalId: proposal.id,
  });
});

app.post("/proposals/approve", async (req, res) => {
  const { id } = req.body as DecisionProposalBody;

  const proposal = await prisma.xPChangeProposal.findUnique({
    where: { id },
  });

  // publish to ipfs
  let ipfsURL = "some-ipfs-url";

  // send tx to gnosis safe
  let gnosisSafeId = "some-id";
  // need a way to get a callback when official optimism tx gets posted

  await prisma.xPChangeProposal.update({
    where: { id },
    data: {
      status: Status.APPROVED,
      gnosisSafeId,
      ipfsURL,
    },
  });

  return res.json({
    success: true,
    ipfsURL,
    gnosisSafeId,
  });
});

app.post("/proposals/reject", async (req, res) => {
  const { id } = req.body as DecisionProposalBody;

  await prisma.xPChangeProposal.update({
    where: { id },
    data: {
      status: Status.REJECTED,
    },
  });

  return res.json({
    success: true,
  });
});

app.get("/proposals/all", async (req, res) => {
  return res.json({
    proposals: await prisma.xPChangeProposal.findMany(),
  });
});

app.listen(port, () => {
  console.log("server running...");
});

async function createCommunityMember(
  ethAddress: string
): Promise<CommunityMember> {
  return await prisma.communityMember.create({
    data: {
      ethAddress,
      communityCallsAttended: 0,
      prsMerged: 0,
    },
  });
}
