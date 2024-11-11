import { viem } from "hardhat";
import { hexToString } from "viem";
import { sepolia } from "viem/chains";
import { bootstrap, ballotContractAddress, checkAddress, checkNumber, checkParameters } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> GetProposal`;
const PROPOSAL_NAME_IDX = 0;
const PROPOSAL_VOTES_IDX = 1;

async function main() {
  // Fetch parameters
  const ARG_PROPOSAL_NO_IDX = 0;
  const ARG_CONTRACT_ADDRESS_IDX = 1;
  const parameters = process.argv.slice(2);
  const proposalIndex = parameters[ARG_PROPOSAL_NO_IDX];
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkParameters(parameters, 2, "You must at least provide the proposal ID.");
  checkAddress("ballot", contractAddress);
  checkNumber("proposal index", proposalIndex);

  // Fetch the contract
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  const proposal = await contract.read.proposals([BigInt(proposalIndex!)]);
  console.log(`${MSG_PREFIX} -> idx`, proposalIndex, "name", hexToString(proposal[PROPOSAL_NAME_IDX]), "votes", proposal[PROPOSAL_VOTES_IDX]);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
