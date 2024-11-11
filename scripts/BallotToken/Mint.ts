import { viem } from "hardhat";
import { formatEther } from "viem";
import { sepolia } from "viem/chains";
import {
  bootstrap,
  checkAddress,
  checkParameters,
  checkNumber,
  ballotTokenContractAddress,
  gasPrices
} from "@scripts/utils";

const CONTRACT_NAME = "BallotToken";
const MSG_PREFIX = `scripts -> ${CONTRACT_NAME} -> Mint`;

async function main() {
  // Fetch parameters
  const ARG_TARGET_ADDRESS_IDX = 0;
  const ARG_MINT_AMOUNT_IDX = 1;
  const ARG_CONTRACT_ADDRESS_IDX = 2;
  const parameters = process.argv.slice(2);
  const targetAddress = parameters[ARG_TARGET_ADDRESS_IDX] as `0x${string}`;
  const mintAmount = parameters[ARG_MINT_AMOUNT_IDX];
  const contractAddress = parameters[ARG_CONTRACT_ADDRESS_IDX] as `0x${string}` || ballotTokenContractAddress;
  checkParameters(parameters, 2, "You must provide the target user address, the mint amount, and optionally, the token contract address.");
  checkAddress("target user", targetAddress);
  checkAddress("token contract", targetAddress);
  checkNumber("mint amount", mintAmount);
  console.log(`${MSG_PREFIX} -> token contract`, contractAddress, "target user", targetAddress, "mint amount", mintAmount);

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
  const [balance0, symbol, votes0] = await Promise.all([
    contract.read.balanceOf([targetAddress]),
    contract.read.symbol(),
    contract.read.getVotes([targetAddress]),
  ]);
  console.log(`${MSG_PREFIX} -> target had ${balance0.toString()} decimal units / ${formatEther(balance0)} ${symbol} BEFORE mint`);
  console.log(`${MSG_PREFIX} -> target had ${votes0.toString()} units of voting power BEFORE mint.`);

  const mintTx = await await contract.write.mint([targetAddress, BigInt(mintAmount as string)]);
  const mintReceipt = await publicClient.waitForTransactionReceipt({hash: mintTx});
  gasPrices(mintReceipt, MSG_PREFIX);
  console.log(`${MSG_PREFIX} -> tx`, mintReceipt.transactionHash);

  // const balance = await contract.read.balanceOf([targetAddress]);
  // const votes = await contract.read.getVotes([targetAddress]);
  const [balance, votes] = await Promise.all([
    contract.read.balanceOf([targetAddress]),
    contract.read.getVotes([targetAddress]),
  ]);
  console.log(`${MSG_PREFIX} -> target has ${balance.toString()} decimal units / ${formatEther(balance)} ${symbol} AFTER mint`);
  console.log(`${MSG_PREFIX} -> target has ${votes.toString()} units of voting power AFTER mint.`);
}

main().catch((error) => {
  console.log("\n\nError details:");
  console.error(error);
  process.exitCode = 1;
});
