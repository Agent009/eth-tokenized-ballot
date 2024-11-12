import { viem } from "hardhat";
import { sepolia } from "viem/chains";
import {
  bootstrap,
  checkAddress,
  checkParameters,
  ballotContractAddress,
} from "@scripts/utils";

const CONTRACT_NAME = "TokenizedBallot";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> GetVotePower`;

async function main() {
  // Fetch parameters
  const ARG_TARGET_ADDRESS_IDX = 0;
  const ARG_CONTRACT_ADDRESS_IDX = 1;
  const parameters = process.argv.slice(2);
  const targetAddress = parameters[ARG_TARGET_ADDRESS_IDX] as `0x${string}`;
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotContractAddress;
  checkParameters(parameters, 1, "You must provide the target user address, and optionally, the ballot contract address.");
  checkAddress("target user", targetAddress);
  checkAddress("ballot contract", targetAddress);
  console.log(`${MSG_PREFIX} -> ballot contract`, contractAddress, "target user", targetAddress);

  // Fetch the contract
  const { publicClient, walletClient } = await bootstrap(MSG_PREFIX, sepolia);

  // Get the proposal details
  const contract = await viem.getContractAt(CONTRACT_NAME, contractAddress, {
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });

  // Stats before mint
  const votePower = await contract.read.getVotePower([targetAddress])
  console.log(`${MSG_PREFIX} -> target has ${votePower.toString()} units of voting power.`);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
