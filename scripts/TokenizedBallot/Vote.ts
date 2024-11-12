import { viem } from "hardhat";
import { sepolia } from "viem/chains";
import { bootstrap, ballotContractAddress, checkAddress, checkNumber, checkParameters, formatBigInt, gasPrices } from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Vote`;

async function main() {
  // Fetch parameters
  const ARG_PROPOSAL_NO_IDX = 0;
  const ARG_VOTE_AMOUNT_IDX = 1;
  const ARG_CONTRACT_ADDRESS_IDX = 2;
  const parameters = process.argv.slice(2);
  const proposalIndex = parameters[ARG_PROPOSAL_NO_IDX];
  const votes = parameters[ARG_VOTE_AMOUNT_IDX];
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkParameters(parameters, 2, "You must provide the proposal ID, number of votes, and optionally, the ballot contract address.");
  checkNumber("proposal index", proposalIndex);
  checkNumber("votes", votes);
  checkAddress("ballot contract", contractAddress);
  console.log(`${MSG_PREFIX} -> ballot contract`, contractAddress, "proposal idx", proposalIndex, "votes", formatBigInt(BigInt(votes!)));

  // Fetch the contract
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
  const voteTx = await contract.write.vote([BigInt(proposalIndex!), BigInt(votes!)]);
  const voteReceipt = await publicClient.waitForTransactionReceipt({hash: voteTx});
  gasPrices(voteReceipt, MSG_PREFIX);
  console.log(`${MSG_PREFIX} -> tx`, voteReceipt.transactionHash);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
