import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

import { CommunityMember, PrismaClient, Status } from "@prisma/client";
import { postJSONToIPFS } from "./ipfs";
import { getTransactionStatusFromGnosisNonce, proposeTx } from "./gnosis";

const port = process.env.PORT || 3001;

const prisma = new PrismaClient();

type CreateProposalBody = {
  ethAddress: string;
  categoryId: number;
  value: number;
};

type DecisionProposalBody = {
  id: string;
};

app.post("/proposals/create", async (req, res) => {
  const { ethAddress, categoryId, value } = req.body as CreateProposalBody;

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
      categoryId,
      value,
      txHash: "",
      gnosisSafeNonce: 0,
      ipfsURL: "",
    },
  });

  return res.json({
    proposalId: proposal.id,
  });
});

app.post("/proposals/:id/approve", async (req, res) => {
  const { id } = req.params as DecisionProposalBody;

  const proposal = await prisma.xPChangeProposal.findUnique({
    where: { id },
  });

  if (proposal?.status !== Status.PENDING) {
    return res.status(400).json({
      message: "Proposal is not in PENDING state",
    });
  }

  await prisma.xPChangeProposal.update({
    where: { id },
    data: {
      status: Status.APPROVED,
    },
  });

  return res.json({
    success: true,
  });
});

app.post("/proposals/:id/reject", async (req, res) => {
  const { id } = req.params as DecisionProposalBody;

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

app.post("/proposals/cron/process", async (req, res) => {
  const approvedProposals = await prisma.xPChangeProposal.findMany({
    where: { status: "APPROVED" },
  });

  if (approvedProposals.length === 0) return res.json({ success: true });

  const pinataResponse = await postJSONToIPFS(approvedProposals);

  await Promise.all(
    approvedProposals.map((proposal) => {
      return prisma.xPChangeProposal.update({
        where: { id: proposal.id },
        data: {
          ipfsURL: pinataResponse.IpfsHash,
        },
      });
    })
  );

  const nonce = await proposeTx(approvedProposals);

  await Promise.all(
    approvedProposals.map((proposal) => {
      return prisma.xPChangeProposal.update({
        where: { id: proposal.id },
        data: {
          gnosisSafeNonce: nonce,
          status: Status.PROCESSING,
        },
      });
    })
  );

  return res.json({ success: true });
});

app.post("/proposals/cron/finalize", async (req, res) => {
  const processingProposals = await prisma.xPChangeProposal.findMany({
    where: { status: "PROCESSING" },
  });

  if (processingProposals.length === 0) return res.json({ success: true });

  processingProposals.forEach(async (proposal) => {
    const [txHash, confirmed] = await getTransactionStatusFromGnosisNonce(
      proposal.gnosisSafeNonce
    );
    if (confirmed) {
      await prisma.xPChangeProposal.update({
        where: { id: proposal.id },
        data: {
          status: Status.FINALIZED,
          txHash,
        },
      });
    } else {
      await prisma.xPChangeProposal.update({
        where: { id: proposal.id },
        data: {
          status: Status.APPROVED,
        },
      });
    }
  });

  return res.json({
    success: true,
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
