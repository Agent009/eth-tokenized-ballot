import { viem } from "hardhat";
import { hexToString } from "viem";
import { sepolia } from "viem/chains";
import { bootstrap, ballotContractAddress, checkAddress } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> GetWinningProposal`;
const PROPOSAL_NAME_IDX = 0;
const PROPOSAL_VOTES_IDX = 1;

async function main() {
  // Fetch parameters
  const ARG_CONTRACT_ADDRESS_IDX = 0;
  const parameters = process.argv.slice(2);
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkAddress("ballot", contractAddress);
  console.log(`${MSG_PREFIX} -> ballot contract`, contractAddress);

  // Fetch the contract
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  // Get the winning proposal details
  const proposalIndex = await contract.read.winningProposal();
  const proposal = await contract.read.proposals([BigInt(proposalIndex!)]);
  console.log(`${MSG_PREFIX} -> idx`, proposalIndex, "name", hexToString(proposal[PROPOSAL_NAME_IDX]), "votes", proposal[PROPOSAL_VOTES_IDX]);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
