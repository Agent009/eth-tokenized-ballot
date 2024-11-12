import { viem } from "hardhat";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import {
  bootstrap,
  checkAddress,
  checkParameters,
  ballotTokenContractAddress,
  gasPrices
} from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Delegate`;

async function main() {
  // Fetch parameters
  const ARG_TARGET_ADDRESS_IDX = 0;
  const ARG_CONTRACT_ADDRESS_IDX = 1;
  const parameters = process.argv.slice(2);
  const targetAddress = parameters[ARG_TARGET_ADDRESS_IDX] as `0x${string}`;
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotTokenContractAddress;
  checkParameters(parameters, 1, "You must provide the target user address, and optionally, the token contract address.");
  checkAddress("target user", targetAddress);
  checkAddress("token contract", targetAddress);
  console.log(`${MSG_PREFIX} -> token contract`, contractAddress, "target user", targetAddress);

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
  const [balance, symbol, votes0] = await Promise.all([
    contract.read.balanceOf([targetAddress]),
    contract.read.symbol(),
    contract.read.getVotes([targetAddress]),
  ]);
  console.log(`${MSG_PREFIX} -> target has ${balance.toString()} decimal units / ${formatEther(balance)} ${symbol}`);
  console.log(`${MSG_PREFIX} -> target had ${votes0.toString()} units of voting power BEFORE delegation.`);

  const delegateTx = await await contract.write.delegate([targetAddress]);
  const delegateReceipt = await publicClient.waitForTransactionReceipt({hash: delegateTx});
  gasPrices(delegateReceipt, MSG_PREFIX);
  console.log(`${MSG_PREFIX} -> tx`, delegateReceipt.transactionHash);

  const votes = await contract.read.getVotes([targetAddress]);
  console.log(`${MSG_PREFIX} -> target has ${votes.toString()} units of voting power AFTER delegation.`);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
