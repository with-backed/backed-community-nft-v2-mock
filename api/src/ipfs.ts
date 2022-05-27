import pinataSDK from "@pinata/sdk";
import { XPChangeProposal } from "@prisma/client";
import dayjs from "dayjs";

const pinata = pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_KEY!
);

export async function postJSONToIPFS(changeProposals: XPChangeProposal[]) {
  const res = await pinata.pinJSONToIPFS({
    changes: changeProposals.map((proposal) => ({
      ethAddress: proposal.communityMemberEthAddress,
      statistic: proposal.categoryId,
      value: proposal.value,
      date: dayjs(new Date().getTime()).format("MMMM DD YYYY"),
    })),
  });

  return res;
}
