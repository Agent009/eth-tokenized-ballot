import { viem } from "hardhat";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import {
  bootstrap,
  checkAddress,
  checkParameters,
  checkNumber,
  ballotTokenContractAddress,
  formatBigInt,
} from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> GetVotePower`;

async function main() {
  // Fetch parameters
  const ARG_TARGET_ADDRESS_IDX = 0;
  const ARG_BLOCK_NO_IDX = 1;
  const ARG_CONTRACT_ADDRESS_IDX = 2;
  const parameters = process.argv.slice(2);
  const targetAddress = parameters[ARG_TARGET_ADDRESS_IDX] as `0x${string}`;
  const blockNo = parameters[ARG_BLOCK_NO_IDX];
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotTokenContractAddress;
  checkParameters(parameters, 2, "You must provide the target user address, the block no, and optionally, the token contract address.");
  checkAddress("target user", targetAddress);
  checkAddress("token contract", targetAddress);
  checkNumber("block no", blockNo);
  console.log(`${MSG_PREFIX} -> token contract`, contractAddress, "target user", targetAddress, "blockNo", blockNo);

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
  const [balance, symbol, votes, votePower] = await Promise.all([
    contract.read.balanceOf([targetAddress]),
    contract.read.symbol(),
    contract.read.getVotes([targetAddress]),
    contract.read.getPastVotes([targetAddress, BigInt(blockNo!)]),
  ]);
  console.log(`${MSG_PREFIX} -> has ${formatBigInt(balance)} decimal units / ${formatEther(balance)} ${symbol}`, formatBigInt(votes), "units of voting power");
  console.log(`${MSG_PREFIX} -> had ${formatBigInt(votePower)} units of voting power at blockNo`, blockNo);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
